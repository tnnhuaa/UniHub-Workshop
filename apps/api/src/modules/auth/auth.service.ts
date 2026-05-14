import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UserRoleType } from '@prisma/client';
import type { betterAuth } from 'better-auth';
import { PrismaService } from '../prisma/prisma.service.js';
import { BETTER_AUTH_INSTANCE } from './auth.constants.js';

/**
 * AuthService — BetterAuth integration.
 * Provides session/JWT validation, role extraction, and RBAC guards.
 *
 * BetterAuth manages the actual auth tables (better_auth_users, sessions, accounts).
 * This service wraps BetterAuth's Node API to integrate with NestJS DI.
 *
 * @see blueprint/specs/auth.md
 */
export type BetterAuthInstance = ReturnType<typeof betterAuth>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BETTER_AUTH_INSTANCE)
    private readonly auth: BetterAuthInstance,
  ) {}

  async getSessionFromRequest(request: FastifyRequest) {
    const headers = new Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) {
        headers.set(key, value.join(','));
        return;
      }
      headers.set(key, String(value));
    });

    const session = await this.auth.api.getSession({ headers });

    if (session?.user?.id) {
      await this.syncStudentAccessForUser(session.user.id);
    }

    return session;
  }

  async getUserRolesValues(userId: string): Promise<UserRoleType[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });

    return roles.map((entry) => entry.role);
  }

  getPrimaryRole(roles: UserRoleType[]): UserRoleType | null {
    const priority: UserRoleType[] = ['organizer', 'checkin_staff', 'student'];
    for (const role of priority) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return roles[0] ?? null;
  }

  async hasRole(userId: string, role: UserRoleType): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: { userId, role },
    });
    return count > 0;
  }

  async getStudentMssvOrThrow(userId: string): Promise<string> {
    const student = await this.prisma.student.findFirst({
      where: { betterAuthUserId: userId },
      select: { mssv: true },
    });

    if (!student) {
      throw new ForbiddenException({
        code: 'STUDENT_PROFILE_MISSING',
        message: 'Student profile not linked to this account',
      });
    }

    return student.mssv;
  }

  private async syncStudentAccessForUser(userId: string) {
    const user = await this.prisma.betterAuthUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user?.email) {
      return;
    }

    const student = await this.prisma.student.findFirst({
      where: {
        email: {
          equals: user.email,
          mode: 'insensitive',
        },
      },
      select: {
        mssv: true,
        betterAuthUserId: true,
      },
    });

    if (!student) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (!student.betterAuthUserId) {
        await tx.student.update({
          where: { mssv: student.mssv },
          data: { betterAuthUserId: user.id },
        });
      }

      if (student.betterAuthUserId && student.betterAuthUserId !== user.id) {
        return;
      }

      await tx.userRole.upsert({
        where: {
          userId_role: {
            userId: user.id,
            role: 'student',
          },
        },
        update: {},
        create: {
          userId: user.id,
          role: 'student',
        },
      });
    });
  }
}
