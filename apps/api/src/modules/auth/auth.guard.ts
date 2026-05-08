import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const session = await this.authService.getSessionFromRequest(request);

    if (!session?.user || !session?.session) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const authRequest = request as AuthenticatedRequest;
    authRequest.authUser = session.user;
    authRequest.authSession = session.session;
    authRequest.authRoles = await this.authService.getUserRolesValues(
      session.user.id,
    );

    return true;
  }
}
