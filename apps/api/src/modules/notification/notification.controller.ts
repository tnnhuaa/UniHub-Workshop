import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
  notificationSendSchema,
  type NotificationIdParam,
  type NotificationListQuery,
  type NotificationSendInput,
} from './notification.schemas.js';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  send(
    @Body(new ZodValidationPipe(notificationSendSchema))
    body: NotificationSendInput,
  ) {
    return this.notificationService.send(body);
  }

  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    'student' satisfies UserRoleType,
    'organizer' satisfies UserRoleType,
    'checkin_staff' satisfies UserRoleType,
  )
  findMine(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(notificationListQuerySchema))
    query: NotificationListQuery,
  ) {
    const userId = request.authUser?.id;
    if (!userId) {
      throw new ForbiddenException({
        code: 'USER_REQUIRED',
        message: 'User identity is required',
      });
    }

    return this.notificationService.findByUser(userId, query);
  }

  @Patch('me/:id/read')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    'student' satisfies UserRoleType,
    'organizer' satisfies UserRoleType,
    'checkin_staff' satisfies UserRoleType,
  )
  markAsRead(
    @Req() request: AuthenticatedRequest,
    @Param(new ZodValidationPipe(notificationIdParamSchema))
    params: NotificationIdParam,
  ) {
    const userId = request.authUser?.id;
    if (!userId) {
      throw new ForbiddenException({
        code: 'USER_REQUIRED',
        message: 'User identity is required',
      });
    }

    return this.notificationService.markAsRead(userId, params);
  }
}
