import { SetMetadata } from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';

export const ROLES_KEY = 'auth:roles';

export const Roles = (...roles: UserRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
