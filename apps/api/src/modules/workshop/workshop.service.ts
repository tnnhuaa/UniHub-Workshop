import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WorkshopService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workshop.findMany();
  }

  async findOne(id: string) {
    return this.prisma.workshop.findUniqueOrThrow({ where: { id } });
  }

  create(): never {
    // TODO: Implement with validated DTO
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_id: string): never {
    // TODO: Implement with validated DTO
    throw new Error('Not implemented');
  }

  async remove(id: string) {
    return this.prisma.workshop.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
