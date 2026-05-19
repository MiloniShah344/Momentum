/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  access_token: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    // @CurrentUser('id') → returns just the id
    // @CurrentUser() → returns the full user object
    return data ? user?.[data] : user;
  },
);
