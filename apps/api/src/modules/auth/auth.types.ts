import type { FastifyRequest } from 'fastify';
import type { UserRoleType } from '@prisma/client';

type AuthUser = {
  id: string;
  email?: string | null;
  [key: string]: unknown;
};

type AuthSession = {
  id: string;
  token: string;
  [key: string]: unknown;
};

export type AuthenticatedRequest = FastifyRequest & {
  authUser?: AuthUser;
  authSession?: AuthSession;
  authRoles?: UserRoleType[];
};
