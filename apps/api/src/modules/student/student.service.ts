import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(mssv: string) {
    return this.prisma.student.findUniqueOrThrow({ where: { mssv } });
  }

  async upsertFromCsv(data: {
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
