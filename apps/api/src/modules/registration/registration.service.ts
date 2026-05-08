import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  create(): never {
    // TODO: Implement registration flow with SeatAllocator
    throw new Error('Not implemented');
  }

  async findOne(id: string) {
    return this.prisma.registration.findUniqueOrThrow({ where: { id } });
  }

  async findByStudent(mssv: string) {
    return this.prisma.registration.findMany({ where: { mssv } });
  }

  async getQrCode(id: string) {
    const registration = await this.prisma.registration.findUniqueOrThrow({
      where: { id },
      select: { qrCode: true },
    });
    return { qrCode: registration.qrCode };
  }
}
