import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type {
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopListQuery,
} from './workshop.schemas.js';

@Injectable()
export class WorkshopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async attachAvailability<
    T extends {
      id: string;
      capacity: number;
      registeredCount: number;
      status: string;
    },
  >(workshops: T[]) {
    if (workshops.length === 0) {
      return [];
    }

    const now = new Date();
    const workshopIds = workshops.map((workshop) => workshop.id);
    const holdCounts = await this.prisma.registration.groupBy({
      by: ['workshopId'],
      where: {
        workshopId: { in: workshopIds },
        status: 'pending',
        paymentStatus: 'pending',
        heldUntil: { gt: now },
      },
      _count: {
        _all: true,
      },
    });

    const holdCountByWorkshopId = new Map(
      holdCounts.map((item) => [item.workshopId, item._count._all]),
    );

    return workshops.map((workshop) => {
      const activeHoldCount = holdCountByWorkshopId.get(workshop.id) ?? 0;
      const remainingSeats = Math.max(
        workshop.capacity - workshop.registeredCount - activeHoldCount,
        0,
      );

      return {
        ...workshop,
        activeHoldCount,
        remainingSeats,
        occupiedSeats: workshop.capacity - remainingSeats,
        isSoldOut: workshop.status === 'published' && remainingSeats === 0,
      };
    });
  }

  async findAll(query: WorkshopListQuery) {
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

    const workshops = await this.prisma.workshop.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { startTime: 'asc' },
    });

    return this.attachAvailability(workshops);
  }

  async findOne(id: string) {
    const workshop = await this.prisma.workshop.findUniqueOrThrow({
      where: { id },
    });

    const [withAvailability] = await this.attachAvailability([workshop]);
    return withAvailability ?? workshop;
  }

  async create(input: CreateWorkshopInput, organizerId: string) {
    if (!organizerId) {
      throw new ForbiddenException({
        code: 'ORGANIZER_REQUIRED',
        message: 'Organizer identity is required',
      });
    }

    if (input.endTime.getTime() <= input.startTime.getTime()) {
      throw new BadRequestException({
        code: 'WORKSHOP_TIME_RANGE_INVALID',
        message: 'endTime must be after startTime',
      });
    }

    const workshop = await this.prisma.workshop.create({
      data: {
        title: input.title,
        description: input.description,
        speaker: input.speaker,
        room: input.room,
        capacity: input.capacity,
        price: input.price ?? 0,
        startTime: input.startTime,
        endTime: input.endTime,
        floorMapUrl: input.floorMapUrl,
        status: input.status ?? 'draft',
        organizerId,
      },
    });

    await this.auditService.log({
      actorUserId: organizerId,
      action: 'workshop.create',
      resourceType: 'workshop',
      resourceId: workshop.id,
      metadata: {
        title: workshop.title,
        status: workshop.status,
      },
    });

    return workshop;
  }

  async update(id: string, input: UpdateWorkshopInput, organizerId: string) {
    if (!organizerId) {
      throw new ForbiddenException({
        code: 'ORGANIZER_REQUIRED',
        message: 'Organizer identity is required',
      });
    }

    const existing = await this.prisma.workshop.findUniqueOrThrow({
      where: { id },
    });

    if (existing.organizerId !== organizerId) {
      throw new ForbiddenException({
        code: 'WORKSHOP_OWNERSHIP_REQUIRED',
        message: 'Only the organizer can update this workshop',
      });
    }

    const nextStartTime = input.startTime ?? existing.startTime;
    const nextEndTime = input.endTime ?? existing.endTime;

    if (nextEndTime.getTime() <= nextStartTime.getTime()) {
      throw new BadRequestException({
        code: 'WORKSHOP_TIME_RANGE_INVALID',
        message: 'endTime must be after startTime',
      });
    }

    const nextCapacity = input.capacity ?? existing.capacity;
    if (nextCapacity < existing.registeredCount) {
      throw new BadRequestException({
        code: 'WORKSHOP_CAPACITY_TOO_LOW',
        message: 'capacity cannot be lower than registered count',
      });
    }

    const data: Prisma.WorkshopUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.speaker !== undefined) data.speaker = input.speaker;
    if (input.room !== undefined) data.room = input.room;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.price !== undefined) data.price = input.price;
    if (input.startTime !== undefined) data.startTime = input.startTime;
    if (input.endTime !== undefined) data.endTime = input.endTime;
    if (input.floorMapUrl !== undefined) data.floorMapUrl = input.floorMapUrl;
    if (input.status !== undefined) data.status = input.status;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException({
        code: 'WORKSHOP_UPDATE_EMPTY',
        message: 'No changes provided for update',
      });
    }

    const workshop = await this.prisma.workshop.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      actorUserId: organizerId,
      action: 'workshop.update',
      resourceType: 'workshop',
      resourceId: workshop.id,
      metadata: {
        changedFields: Object.keys(data),
      },
    });

    return workshop;
  }

  async adminUpdate(
    id: string,
    input: UpdateWorkshopInput,
    actorUserId: string,
  ) {
    if (!actorUserId) {
      throw new ForbiddenException({
        code: 'ORGANIZER_REQUIRED',
        message: 'Organizer identity is required',
      });
    }

    const existing = await this.prisma.workshop.findUniqueOrThrow({
      where: { id },
    });

    const nextStartTime = input.startTime ?? existing.startTime;
    const nextEndTime = input.endTime ?? existing.endTime;

    if (nextEndTime.getTime() <= nextStartTime.getTime()) {
      throw new BadRequestException({
        code: 'WORKSHOP_TIME_RANGE_INVALID',
        message: 'endTime must be after startTime',
      });
    }

    const nextCapacity = input.capacity ?? existing.capacity;
    if (nextCapacity < existing.registeredCount) {
      throw new BadRequestException({
        code: 'WORKSHOP_CAPACITY_TOO_LOW',
        message: 'capacity cannot be lower than registered count',
      });
    }

    const data: Prisma.WorkshopUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.speaker !== undefined) data.speaker = input.speaker;
    if (input.room !== undefined) data.room = input.room;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.price !== undefined) data.price = input.price;
    if (input.startTime !== undefined) data.startTime = input.startTime;
    if (input.endTime !== undefined) data.endTime = input.endTime;
    if (input.floorMapUrl !== undefined) data.floorMapUrl = input.floorMapUrl;
    if (input.status !== undefined) data.status = input.status;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException({
        code: 'WORKSHOP_UPDATE_EMPTY',
        message: 'No changes provided for update',
      });
    }

    const workshop = await this.prisma.workshop.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      actorUserId,
      action: 'workshop.update',
      resourceType: 'workshop',
      resourceId: workshop.id,
      metadata: {
        changedFields: Object.keys(data),
      },
    });

    return workshop;
  }

  async remove(id: string, organizerId: string) {
    if (!organizerId) {
      throw new ForbiddenException({
        code: 'ORGANIZER_REQUIRED',
        message: 'Organizer identity is required',
      });
    }

    const existing = await this.prisma.workshop.findUniqueOrThrow({
      where: { id },
    });

    const workshop = await this.prisma.workshop.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    await this.auditService.log({
      actorUserId: organizerId,
      action: 'workshop.cancel',
      resourceType: 'workshop',
      resourceId: workshop.id,
      metadata: {
        previousStatus: existing.status,
        newStatus: workshop.status,
      },
    });

    return workshop;
  }

  async adminRemove(id: string, actorUserId: string) {
    if (!actorUserId) {
      throw new ForbiddenException({
        code: 'ORGANIZER_REQUIRED',
        message: 'Organizer identity is required',
      });
    }

    const existing = await this.prisma.workshop.findUniqueOrThrow({
      where: { id },
    });

    const workshop = await this.prisma.workshop.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    await this.auditService.log({
      actorUserId,
      action: 'workshop.cancel',
      resourceType: 'workshop',
      resourceId: workshop.id,
      metadata: {
        previousStatus: existing.status,
        newStatus: workshop.status,
      },
    });

    return workshop;
  }
}
