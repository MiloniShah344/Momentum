/* eslint-disable @typescript-eslint/await-thenable */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ── Private helpers ─────────────────────────────────────────────

  private generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRES') || 900,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES') || '7d',
    });

    return { accessToken, refreshToken };
  }

  // ── Auth operations ──────────────────────────────────────────────

  async signup(dto: SignupDto) {
    // Check if email is taken
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Hash password with bcrypt (cost factor 12 — strong but not too slow)
    const password_hash = await bcrypt.hash(dto.password, 12);

    // Create user in our database
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      password_hash,
      display_name: dto.display_name,
    });

    // Generate tokens immediately (no email verification needed in dev)
    const tokens = this.generateTokens({ sub: user.id, email: user.email });

    return {
      message: 'Account created successfully.',
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        onboarding_complete: user.onboarding_complete,
      },
      tokens,
    };
  }

  async login(dto: LoginDto) {
    // Fetch user WITH password hash (normally excluded from queries)
    const user = await this.usersService.findByEmailWithPassword(
      dto.email.toLowerCase(),
    );

    if (!user) {
      // Use same error for both "user not found" and "wrong password"
      // Never reveal which one — prevents user enumeration attacks
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokens = this.generateTokens({ sub: user.id, email: user.email });

    return {
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        onboarding_complete: user.onboarding_complete,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found.');

      const tokens = this.generateTokens({ sub: user.id, email: user.email });

      return { message: 'Token refreshed.', tokens };
    } catch {
      throw new UnauthorizedException(
        'Refresh token is invalid or expired. Please log in again.',
      );
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    // Always return success — never reveal if email exists (security)
    if (!user) {
      return {
        message: 'If that email exists, a reset link has been sent.',
      };
    }

    // Generate a secure random token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.update(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: expiresAt,
    });

    // TODO: In production, send this via email (Resend/Nodemailer)
    // For development, we return it directly so you can test
    const isDev = this.configService.get<string>('NODE_ENV') === 'development';

    return {
      message: 'If that email exists, a reset link has been sent.',
      ...(isDev && {
        dev_reset_token: resetToken,
        dev_note:
          'This token is only shown in development. In production it would be emailed.',
      }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.reset_token);

    if (!user) {
      throw new BadRequestException(
        'Reset token is invalid or has expired. Please request a new one.',
      );
    }

    const password_hash = await bcrypt.hash(dto.password, 12);

    await this.usersService.update(user.id, {
      password_hash,
      password_reset_token: null,
      password_reset_expires: null,
    });

    return { message: 'Password updated successfully. Please log in.' };
  }

  async getMe(userId: string) {
    const user = await this.usersService.getProfile(userId);
    return { user };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token is invalid or expired.');
    }
  }
}
