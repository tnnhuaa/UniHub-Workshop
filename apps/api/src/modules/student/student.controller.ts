import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { StudentService } from './student.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AuthService } from '../auth/auth.service.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { ZodValidationPipe } from '../../shared/validation/index.js';
import {
  studentListQuerySchema,
  studentMssvParamSchema,
  type StudentListQuery,
  type StudentMssvParam,
} from './student.schemas.js';

@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student' satisfies UserRoleType)
  async findMe(@Req() request: AuthenticatedRequest) {
    const userId = request.authUser?.id;
    if (!userId) {
      throw new ForbiddenException({
        code: 'STUDENT_PROFILE_MISSING',
        message: 'Student profile not linked to this account',
      });
    }

    const mssv = await this.authService.getStudentMssvOrThrow(userId);
    return this.studentService.findOne(mssv);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  findAll(
    @Query(new ZodValidationPipe(studentListQuerySchema))
    query: StudentListQuery,
  ) {
    return this.studentService.findAll(query);
  }

  @Get(':mssv')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('organizer' satisfies UserRoleType)
  findOne(
    @Param(new ZodValidationPipe(studentMssvParamSchema))
    params: StudentMssvParam,
  ) {
    return this.studentService.findOne(params.mssv);
  }
}
