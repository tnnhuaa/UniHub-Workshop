import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StudentListQuery } from './student.schemas.js';

const studentSelect = {
  mssv: true,
  email: true,
  fullName: true,
  phone: true,
  faculty: true,
  className: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  csvSyncedAt: true,
} satisfies Prisma.StudentSelect;

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  findOne(mssv: string) {
    return this.prisma.student.findUniqueOrThrow({
      where: { mssv },
      select: studentSelect,
    });
  }

  findAll(query: StudentListQuery) {
    const where: Prisma.StudentWhereInput = {};

    if (query.faculty) {
      where.faculty = { contains: query.faculty, mode: 'insensitive' };
    }

    if (query.className) {
      where.className = { contains: query.className, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.OR = [
        { mssv: { contains: query.q, mode: 'insensitive' } },
        { fullName: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const page = query.page;
    const pageSize = query.pageSize;

    return this.prisma.student.findMany({
      where,
      select: studentSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { mssv: 'asc' },
    });
  }

  upsertFromCsv(data: {
    mssv: string;
    email: string | null;
    fullName: string | null;
    phone: string | null;
    faculty: string | null;
    className: string | null;
  }) {
    return this.prisma.student.upsert({
      where: { mssv: data.mssv },
      update: { ...data, csvSyncedAt: new Date() },
      create: { ...data, csvSyncedAt: new Date() },
    });
  }
}
