import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopListQuery,
} from './workshop.schemas.js';

@Injectable()
export class WorkshopService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: WorkshopListQuery) {
    const where: Prisma.WorkshopWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.speaker) {
      where.speaker = { contains: query.speaker, mode: 'insensitive' };
    }

    if (query.room) {
      where.room = { contains: query.room, mode: 'insensitive' };
    }

    if (query.startFrom || query.startTo) {
      where.startTime = {
        gte: query.startFrom,
        lte: query.startTo,
      };
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { speaker: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const page = query.page;
    const pageSize = query.pageSize;

    return this.prisma.workshop.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { startTime: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.workshop.findUniqueOrThrow({ where: { id } });
  }

  create(_input: CreateWorkshopInput): never {
    // TODO: Implement with validated DTO
    void _input;
    throw new Error('Not implemented');
  }

  update(_id: string, _input: UpdateWorkshopInput): never {
    // TODO: Implement with validated DTO
    void _id;
    void _input;
    throw new Error('Not implemented');
  }

  remove(id: string) {
    return this.prisma.workshop.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
