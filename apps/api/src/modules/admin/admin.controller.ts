import { Controller, Get, UseGuards } from '@nestjs/common';
import type { UserRoleType } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('organizer' satisfies UserRoleType)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }
}
