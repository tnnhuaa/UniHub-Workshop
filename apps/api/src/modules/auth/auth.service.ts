import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * AuthService — BetterAuth integration.
 * Provides session/JWT validation, role extraction, and RBAC guards.
 *
 * BetterAuth manages the actual auth tables (better_auth_users, sessions, accounts).
 * This service wraps BetterAuth's Node API to integrate with NestJS DI.
 *
 * @see blueprint/specs/auth.md
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: { userId, role: role as never },
    });
    return count > 0;
  }
}
