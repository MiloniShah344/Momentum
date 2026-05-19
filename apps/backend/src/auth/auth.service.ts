/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    console.log('Signup DTO:', dto);
    const supabase = this.supabaseService.getClient();
    console.log('Supabase client initialized');

    // Check if email already exists in our users table
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true, // skip email verification in development
      user_metadata: {
        display_name: dto.display_name,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new InternalServerErrorException('Failed to create user account.');
    }

    // Create user profile in our users table
    try {
      await this.usersService.create({
        id: data.user.id,
        email: data.user.email ?? '',
        display_name: dto.display_name,
      });
    } catch (dbError) {
      // If profile creation fails, clean up the Supabase auth user
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new InternalServerErrorException(
        'Failed to create user profile. Please try again.',
      );
    }

    // Sign in immediately to get a session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (sessionError || !sessionData.session) {
      // Account created — user just needs to log in manually
      return {
        message: 'Account created successfully. Please log in.',
        user: { id: data.user.id, email: data.user.email },
      };
    }

    return {
      message: 'Account created successfully.',
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: dto.display_name,
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
      },
    };
  }

  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      // Don't reveal whether email or password is wrong — security best practice
      throw new UnauthorizedException(
        'Invalid email or password. Please check your credentials.',
      );
    }

    if (!data.session || !data.user) {
      throw new UnauthorizedException('Login failed. Please try again.');
    }

    // Ensure user profile exists (handles edge cases)
    await this.usersService.findOrCreate({
      id: data.user.id,
      email: data.user.email ?? '',
      display_name: data.user.user_metadata?.display_name,
    });

    const profile = await this.usersService.findById(data.user.id);

    return {
      message: 'Logged in successfully.',
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: profile?.display_name,
        onboarding_complete: profile?.onboarding_complete ?? false,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  async logout(accessToken: string) {
    const supabase = this.supabaseService.getClient();

    // Revoke the specific session token
    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      // Log but don't throw — client should clear cookies regardless
      console.error('Logout error (non-fatal):', error.message);
    }

    return { message: 'Logged out successfully.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const supabase = this.supabaseService.getClient();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const { error } = await supabase.auth.resetPasswordForEmail(dto.email, {
      redirectTo: `${frontendUrl}/reset-password`,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Always return success — never reveal if email exists (security)
    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const supabase = this.supabaseService.getClient();

    // Verify the token and set the new password
    const { data: userData, error: userError } = await supabase.auth.getUser(
      dto.access_token,
    );

    if (userError || !userData.user) {
      throw new UnauthorizedException(
        'Reset link is invalid or has expired. Please request a new one.',
      );
    }

    const { error } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { password: dto.password },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Password updated successfully. Please log in.' };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    return {
      message: 'Token refreshed.',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  async getMe(userId: string) {
    const profile = await this.usersService.getProfile(userId);
    return { user: profile };
  }
}
