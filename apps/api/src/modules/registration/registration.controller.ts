import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AuthService } from '../auth/auth.service.js';
import { RegistrationService } from './registration.service.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  createRegistrationSchema,
  registrationIdParamSchema,
  registrationListQuerySchema,
  type CreateRegistrationInput,
  type RegistrationIdParam,
  type RegistrationListQuery,
} from './registration.schemas.js';

@Controller('registrations')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student' satisfies UserRoleType)
  async create(
    @Body(new ZodValidationPipe(createRegistrationSchema))
    body: CreateRegistrationInput,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.authUser?.id;
    if (!userId) {
      throw new ForbiddenException({
        code: 'STUDENT_PROFILE_MISSING',
        message: 'Student profile not linked to this account',
      });
    }

    const mssv = await this.authService.getStudentMssvOrThrow(userId);
    if (body.mssv !== mssv) {
      throw new ForbiddenException({
        code: 'STUDENT_MSSV_MISMATCH',
        message: 'Cannot register on behalf of another student',
      });
    }

    return this.registrationService.create(body);
  }

  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student' satisfies UserRoleType)
  async findMine(
    @Query(new ZodValidationPipe(registrationListQuerySchema))
    query: RegistrationListQuery,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.authUser?.id;
    if (!userId) {
      throw new ForbiddenException({
        code: 'STUDENT_PROFILE_MISSING',
        message: 'Student profile not linked to this account',
      });
    }

    const mssv = await this.authService.getStudentMssvOrThrow(userId);
    return this.registrationService.findByStudent(mssv, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student' satisfies UserRoleType, 'organizer' satisfies UserRoleType)
  findOne(
    @Param(new ZodValidationPipe(registrationIdParamSchema))
    params: RegistrationIdParam,
  ) {
    return this.registrationService.findOne(params.id);
  }

  @Get(':id/qr')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student' satisfies UserRoleType)
  getQrCode(
    @Param(new ZodValidationPipe(registrationIdParamSchema))
    params: RegistrationIdParam,
  ) {
    return this.registrationService.getQrCode(params.id);
  }
}
