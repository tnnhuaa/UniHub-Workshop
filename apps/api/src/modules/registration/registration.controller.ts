import { Controller, Get, Post, Param } from '@nestjs/common';
import { RegistrationService } from './registration.service.js';

@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  create() {
    // TODO: Implement with Zod DTO (CreateRegistrationDTO)
    return this.registrationService.create();
  }

  @Get('me')
  findMine() {
    // TODO: Extract user from auth context
    return this.registrationService.findByStudent('placeholder');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationService.findOne(id);
  }

  @Get(':id/qr')
  getQrCode(@Param('id') id: string) {
    return this.registrationService.getQrCode(id);
  }
}
