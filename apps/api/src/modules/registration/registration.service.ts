import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateRegistrationInput,
  RegistrationListQuery,
} from './registration.schemas.js';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  create(_input: CreateRegistrationInput): never {
    // TODO: Implement registration flow with SeatAllocator
    void _input;
    throw new Error('Not implemented');
  }

  findOne(id: string) {
    return this.prisma.registration.findUniqueOrThrow({ where: { id } });
  }

  findByStudent(mssv: string, query: RegistrationListQuery) {
    const page = query.page;
    const pageSize = query.pageSize;

    return this.prisma.registration.findMany({
      where: {
        mssv,
        status: query.status,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { registeredAt: 'desc' },
    });
  }

  async getQrCode(id: string) {
    const registration = await this.prisma.registration.findUniqueOrThrow({
      where: { id },
      select: { qrCode: true },
    });
    return { qrCode: registration.qrCode };
  }
}
