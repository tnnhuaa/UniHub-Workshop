import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createRegistrationSchema))
    body: CreateRegistrationInput,
  ) {
    return this.registrationService.create(body);
  }

  @Get('me')
  findMine(
    @Query(new ZodValidationPipe(registrationListQuerySchema))
    query: RegistrationListQuery,
  ) {
    // TODO: Extract user from auth context
    return this.registrationService.findByStudent('placeholder', query);
  }

  @Get(':id')
  findOne(
    @Param(new ZodValidationPipe(registrationIdParamSchema))
    params: RegistrationIdParam,
  ) {
    return this.registrationService.findOne(params.id);
  }

  @Get(':id/qr')
  getQrCode(
    @Param(new ZodValidationPipe(registrationIdParamSchema))
    params: RegistrationIdParam,
  ) {
    return this.registrationService.getQrCode(params.id);
  }
}
