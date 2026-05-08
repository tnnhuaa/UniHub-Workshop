const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const WORKSHOPS = [
  {
    id: "1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01",
    title: "Intro to Product Design",
    description: "Foundations of product design for student teams.",
    speaker: "Nguyen Minh Anh",
    room: "A101",
    capacity: 60,
    price: 0,
    startTime: new Date("2026-06-01T08:00:00Z"),
    endTime: new Date("2026-06-01T10:00:00Z"),
    status: "published",
  },
  {
    id: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    title: "AI for Career Growth",
    description: "Practical AI tools to boost your job search.",
    speaker: "Tran Quoc Huy",
    room: "B203",
    capacity: 80,
    price: 50000,
    startTime: new Date("2026-06-02T08:00:00Z"),
    endTime: new Date("2026-06-02T10:00:00Z"),
    status: "published",
  },
  {
    id: "6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8",
    title: "Startup Finance Basics",
    description: "Cash flow, runway, and funding essentials.",
    speaker: "Le Thanh Tuan",
    room: "C304",
    capacity: 50,
    price: 0,
    startTime: new Date("2026-06-03T08:00:00Z"),
    endTime: new Date("2026-06-03T10:00:00Z"),
    status: "published",
  },
];

async function main() {
  const organizer = await prisma.betterAuthUser.upsert({
    where: { email: "organizer@unihub.local" },
    update: { name: "Organizer Admin" },
    create: {
      email: "organizer@unihub.local",
      name: "Organizer Admin",
      emailVerified: true,
    },
  });

  const checkinStaff = await prisma.betterAuthUser.upsert({
    where: { email: "checkin@unihub.local" },
    update: { name: "Check-in Staff" },
    create: {
      email: "checkin@unihub.local",
      name: "Check-in Staff",
      emailVerified: true,
    },
  });

  const studentUser = await prisma.betterAuthUser.upsert({
    where: { email: "student@unihub.local" },
    update: { name: "Student User" },
    create: {
      email: "student@unihub.local",
      name: "Student User",
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_role: { userId: organizer.id, role: "organizer" } },
    update: {},
    create: { userId: organizer.id, role: "organizer" },
  });

  await prisma.userRole.upsert({
    where: { userId_role: { userId: checkinStaff.id, role: "checkin_staff" } },
    update: {},
    create: { userId: checkinStaff.id, role: "checkin_staff" },
  });

  await prisma.userRole.upsert({
    where: { userId_role: { userId: studentUser.id, role: "student" } },
    update: {},
    create: { userId: studentUser.id, role: "student" },
  });

  await prisma.student.upsert({
    where: { mssv: "21127001" },
    update: {
      email: "student@unihub.local",
      fullName: "Nguyen Van A",
      phone: "0901000001",
      faculty: "Information Technology",
      className: "SE2026",
      status: "active",
      betterAuthUserId: studentUser.id,
      csvSyncedAt: new Date(),
    },
    create: {
      mssv: "21127001",
      email: "student@unihub.local",
      fullName: "Nguyen Van A",
      phone: "0901000001",
      faculty: "Information Technology",
      className: "SE2026",
      status: "active",
      betterAuthUserId: studentUser.id,
      csvSyncedAt: new Date(),
    },
  });

  for (const workshop of WORKSHOPS) {
    await prisma.workshop.upsert({
      where: { id: workshop.id },
      update: {
        title: workshop.title,
        description: workshop.description,
        speaker: workshop.speaker,
        room: workshop.room,
        capacity: workshop.capacity,
        price: workshop.price,
        startTime: workshop.startTime,
        endTime: workshop.endTime,
        status: workshop.status,
        organizerId: organizer.id,
      },
      create: {
        ...workshop,
        organizerId: organizer.id,
      },
    });
  }

  const registration = await prisma.registration.upsert({
    where: {
      mssv_workshopId: {
        mssv: "21127001",
        workshopId: WORKSHOPS[0].id,
      },
    },
    update: {
      status: "confirmed",
      paymentStatus: "paid",
      qrCode: "QR-21127001-INTRO",
      paymentCompletedAt: new Date(),
    },
    create: {
      id: "9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4",
      mssv: "21127001",
      workshopId: WORKSHOPS[0].id,
      status: "confirmed",
      paymentStatus: "paid",
      qrCode: "QR-21127001-INTRO",
      paymentCompletedAt: new Date(),
    },
  });

  await prisma.checkin.upsert({
    where: {
      mssv_workshopId: {
        mssv: "21127001",
        workshopId: WORKSHOPS[0].id,
      },
    },
    update: {
      registrationId: registration.id,
      checkinStaffId: checkinStaff.id,
      syncStatus: "synced",
      syncedAt: new Date(),
    },
    create: {
      id: "3a2c9e1a-52b7-4f6f-9e06-6d52af48e5a6",
      mssv: "21127001",
      workshopId: WORKSHOPS[0].id,
      registrationId: registration.id,
      checkinStaffId: checkinStaff.id,
      syncStatus: "synced",
      syncedAt: new Date(),
    },
  });

  await prisma.csvLog.upsert({
    where: { id: "f6c6e213-7d0f-4f1e-8b25-2f16d62c52d9" },
    update: {
      totalRecords: 1,
      successfulRecords: 1,
      failedRecords: 0,
      conflictRecords: 0,
      status: "completed",
      completedAt: new Date(),
    },
    create: {
      id: "f6c6e213-7d0f-4f1e-8b25-2f16d62c52d9",
      sourceFile: "students-2026-06-01.csv",
      totalRecords: 1,
      successfulRecords: 1,
      failedRecords: 0,
      conflictRecords: 0,
      status: "completed",
      completedAt: new Date(),
    },
  });

  await prisma.staffWorkshopAssignment.upsert({
    where: {
      staffUserId_workshopId: {
        staffUserId: checkinStaff.id,
        workshopId: WORKSHOPS[0].id,
      },
    },
    update: { status: "active" },
    create: {
      staffUserId: checkinStaff.id,
      workshopId: WORKSHOPS[0].id,
      status: "active",
    },
  });

  console.log("Seed data created.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
