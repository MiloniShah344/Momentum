/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'No authorization token provided. Include "Authorization: Bearer <token>" header.',
      );
    }

    const token: string = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token is empty or malformed.');
    }

    try {
      // Ask Supabase to verify the token and return the user
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException(
          'Token is invalid or expired. Please log in again.',
        );
      }

      // Attach user to request — accessible via @CurrentUser() decorator
      request.user = {
        id: data.user.id,
        email: data.user.email,
        access_token: token,
      };

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token verification failed.');
    }
  }
}
