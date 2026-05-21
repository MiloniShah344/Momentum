/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Try httpOnly cookie (browser)
    // 2. Fallback to Authorization header (API clients / testing)
    const token =
      (request.cookies as Record<string, string>)?.access_token ||
      request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException(
        'Authentication required. Please log in.',
      );
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach decoded payload to request
      (request as any).user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (err: any) {
      const message =
        err?.name === 'TokenExpiredError'
          ? 'Session expired. Please log in again.'
          : 'Invalid token. Please log in again.';
      throw new UnauthorizedException(message);
    }
  }
}
