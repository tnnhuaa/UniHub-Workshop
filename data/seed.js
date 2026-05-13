const path = require("node:path");
const { pathToFileURL } = require("node:url");
require(path.resolve(
  __dirname,
  "..",
  "apps",
  "api",
  "node_modules",
  "dotenv",
)).config({ path: path.resolve(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SAMPLE_PASSWORD = "Test@123456";
const CSV_FIXTURE_PATH = path.resolve(
  __dirname,
  "fixtures",
  "students-import-sample.csv",
);

const ACCOUNTS = {
  organizer: {
    email: "organizer@unihub.local",
    name: "Organizer Admin",
    roles: ["organizer"],
  },
  staff: {
    email: "checkin@unihub.local",
    name: "Check-in Staff",
    roles: ["checkin_staff"],
  },
  student: {
    email: "student@unihub.local",
    name: "Student User",
    roles: ["student"],
  },
};

const STUDENTS = [
  {
    mssv: "21127001",
    email: "student@unihub.local",
    fullName: "Nguyen Van A",
    phone: "0901000001",
    faculty: "Information Technology",
    className: "SE2026",
    status: "active",
    accountKey: "student",
  },
  {
    mssv: "21127002",
    email: "tran.binh@unihub.local",
    fullName: "Tran Thi Binh",
    phone: "0901000002",
    faculty: "Business Administration",
    className: "BA2026",
    status: "active",
  },
  {
    mssv: "21127003",
    email: "le.cuong@unihub.local",
    fullName: "Le Minh Cuong",
    phone: "0901000003",
    faculty: "Computer Science",
    className: "CS2026",
    status: "active",
  },
  {
    mssv: "21127004",
    email: "pham.dung@unihub.local",
    fullName: "Pham Thi Dung",
    phone: "0901000004",
    faculty: "Design",
    className: "DS2026",
    status: "inactive",
  },
];

const WORKSHOPS = [
  {
    id: "1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01",
    title: "Intro to Product Design",
    description: "Foundations of product design for student teams.",
    speaker: "Nguyen Minh Anh",
    room: "A101",
    capacity: 60,
    registeredCount: 1,
    price: 0,
    startTime: new Date("2026-06-01T08:00:00Z"),
    endTime: new Date("2026-06-01T10:00:00Z"),
    status: "published",
    floorMapUrl: "https://cdn.unihub.local/maps/a101-floor-map.png",
  },
  {
    id: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    title: "AI for Career Growth",
    description: "Practical AI tools to boost your job search.",
    speaker: "Tran Quoc Huy",
    room: "B203",
    capacity: 80,
    registeredCount: 2,
    price: 50000,
    startTime: new Date("2026-06-02T08:00:00Z"),
    endTime: new Date("2026-06-02T10:00:00Z"),
    status: "published",
    floorMapUrl: "https://cdn.unihub.local/maps/b203-floor-map.png",
  },
  {
    id: "6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8",
    title: "Startup Finance Basics",
    description: "Cash flow, runway, and funding essentials.",
    speaker: "Le Thanh Tuan",
    room: "C304",
    capacity: 50,
    registeredCount: 1,
    price: 0,
    startTime: new Date("2026-05-20T08:00:00Z"),
    endTime: new Date("2026-05-20T10:00:00Z"),
    status: "completed",
    floorMapUrl: "https://cdn.unihub.local/maps/c304-floor-map.png",
  },
  {
    id: "7bf4b5fd-f0b8-4d8f-9dc9-79d0cb7bd601",
    title: "Hackathon Kickoff Briefing",
    description: "Draft planning session for internal organizers.",
    speaker: "Internal Ops Team",
    room: "D201",
    capacity: 30,
    registeredCount: 0,
    price: 0,
    startTime: new Date("2026-06-10T01:00:00Z"),
    endTime: new Date("2026-06-10T03:00:00Z"),
    status: "draft",
    floorMapUrl: null,
  },
  {
    id: "c25795a3-32a5-4fe7-8a8d-64d3f75d3d02",
    title: "Cloud Security Crash Course",
    description: "Cancelled session kept for admin/test coverage.",
    speaker: "Pham Gia Bao",
    room: "E105",
    capacity: 45,
    registeredCount: 0,
    price: 75000,
    startTime: new Date("2026-06-15T08:00:00Z"),
    endTime: new Date("2026-06-15T10:00:00Z"),
    status: "cancelled",
    floorMapUrl: "https://cdn.unihub.local/maps/e105-floor-map.png",
  },
];

const REGISTRATIONS = [
  {
    id: "9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4",
    mssv: "21127001",
    workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    status: "confirmed",
    paymentStatus: "paid",
    qrCode: "QR-21127001-AI-CAREER",
    paymentCompletedAt: new Date("2026-05-13T02:00:00Z"),
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: "113f3e25-52d2-4787-8e1c-01d5e164cc61",
    mssv: "21127001",
    workshopId: "1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01",
    status: "confirmed",
    paymentStatus: "pending",
    qrCode: "QR-21127001-PRODUCT-DESIGN",
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: "d7c77fe6-1403-4a8a-b53b-3918ce732451",
    mssv: "21127002",
    workshopId: "6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8",
    status: "confirmed",
    paymentStatus: "pending",
    qrCode: "QR-21127002-FINANCE",
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: "93807f56-48d8-4f0b-aa5f-b6274955b69d",
    mssv: "21127003",
    workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    status: "pending",
    paymentStatus: "pending",
    qrCode: null,
    paymentCompletedAt: null,
    heldUntil: new Date("2026-05-14T03:00:00Z"),
    cancellationReason: null,
  },
  {
    id: "c8fbd186-6762-43d0-88ee-0b1f40f7d662",
    mssv: "21127004",
    workshopId: "c25795a3-32a5-4fe7-8a8d-64d3f75d3d02",
    status: "cancelled",
    paymentStatus: "refunded",
    qrCode: null,
    paymentCompletedAt: new Date("2026-05-11T04:00:00Z"),
    heldUntil: null,
    cancellationReason: "workshop_cancelled",
  },
];

const PAYMENTS = [
  {
    id: "b2145ff1-1336-4842-bfd7-b2036732fd97",
    registrationId: "9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4",
    provider: "mock",
    providerRef: "mock_paid_ai_career_21127001",
    idempotencyKey: "seed-payment-success-21127001-ai-career",
    amount: 50000,
    currency: "VND",
    status: "paid",
    requestedAt: new Date("2026-05-13T01:50:00Z"),
    completedAt: new Date("2026-05-13T02:00:00Z"),
  },
  {
    id: "6ed952e5-df1c-4ded-80cb-b00b357cb5de",
    registrationId: "93807f56-48d8-4f0b-aa5f-b6274955b69d",
    provider: "mock",
    providerRef: null,
    idempotencyKey: "seed-payment-pending-21127003-ai-career",
    amount: 50000,
    currency: "VND",
    status: "pending",
    requestedAt: new Date("2026-05-13T02:10:00Z"),
    completedAt: null,
  },
  {
    id: "c4fe18cc-75ae-4577-a9b4-070c3226f8d9",
    registrationId: "c8fbd186-6762-43d0-88ee-0b1f40f7d662",
    provider: "mock",
    providerRef: "mock_refund_cloud_security_21127004",
    idempotencyKey: "seed-payment-refunded-21127004-cloud-security",
    amount: 75000,
    currency: "VND",
    status: "refunded",
    requestedAt: new Date("2026-05-11T03:50:00Z"),
    completedAt: new Date("2026-05-11T04:00:00Z"),
  },
];

const CHECKINS = [
  {
    id: "3a2c9e1a-52b7-4f6f-9e06-6d52af48e5a6",
    mssv: "21127001",
    workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    registrationId: "9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4",
    deviceEventId: "device-event-ai-career-21127001",
    checkedInAt: new Date("2026-06-02T07:55:00Z"),
    syncedAt: new Date("2026-06-02T07:56:00Z"),
    syncStatus: "synced",
  },
];

const ASSIGNMENTS = [
  {
    id: "8a9ef7c1-080c-4647-95f8-3fa1153f9073",
    workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    status: "active",
  },
  {
    id: "a85c96a8-f36f-4707-b083-f53b7ebcf95a",
    workshopId: "6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8",
    status: "active",
  },
  {
    id: "b1026784-d82a-4b84-9f97-e91f88418fee",
    workshopId: "c25795a3-32a5-4fe7-8a8d-64d3f75d3d02",
    status: "inactive",
  },
];

const DOCUMENTS = [
  {
    id: "658c67df-17b0-46a8-bfff-f92de85d3355",
    workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
    fileUrl: "https://storage.unihub.local/workshops/ai-career-growth/slide-deck.pdf",
    fileName: "ai-career-growth-slides.pdf",
    processingStatus: "completed",
  },
  {
    id: "42628af8-0b3c-4268-a8f8-f1d0ddb0310d",
    workshopId: "6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8",
    fileUrl: "https://storage.unihub.local/workshops/startup-finance/handout.pdf",
    fileName: "startup-finance-handout.pdf",
    processingStatus: "failed",
  },
];

const SUMMARY_JOBS = [
  {
    id: "27ec47f1-07f5-4665-bc03-364897c205b5",
    documentId: "658c67df-17b0-46a8-bfff-f92de85d3355",
    summaryText:
      "Career workshop covers CV tailoring, networking prompts, and interview preparation with AI assistants.",
    status: "completed",
    retryCount: 0,
  },
  {
    id: "6f70a998-c360-4a1f-960f-91620cfd89da",
    documentId: "42628af8-0b3c-4268-a8f8-f1d0ddb0310d",
    summaryText: null,
    status: "failed",
    retryCount: 1,
  },
];

const CSV_BATCHES = [
  {
    id: "f6c6e213-7d0f-4f1e-8b25-2f16d62c52d9",
    sourceFile: CSV_FIXTURE_PATH,
    totalRecords: 4,
    successfulRecords: 2,
    failedRecords: 1,
    conflictRecords: 1,
    status: "completed",
    completedAt: new Date("2026-05-13T03:00:00Z"),
  },
  {
    id: "4f0b291d-acf3-4ea4-9527-9fd3ebb80593",
    sourceFile: path.resolve(__dirname, "fixtures", "missing-file.csv"),
    totalRecords: 0,
    successfulRecords: 0,
    failedRecords: 0,
    conflictRecords: 0,
    status: "failed",
    completedAt: new Date("2026-05-13T03:30:00Z"),
  },
];

const CSV_ERRORS = [
  {
    id: "8b29798c-72f6-4b3f-8389-7761fd634f99",
    batchId: "f6c6e213-7d0f-4f1e-8b25-2f16d62c52d9",
    rowNumber: 4,
    message: "EMAIL_INVALID",
    rawRow: {
      mssv: "21127100",
      email: "invalid-email",
      fullName: "Invalid Email Student",
      phone: "0901000099",
      faculty: "Testing",
      className: "QA2026",
      status: "active",
    },
  },
  {
    id: "c95a01d3-44c9-4af1-9a8c-7cc3a099035f",
    batchId: "4f0b291d-acf3-4ea4-9527-9fd3ebb80593",
    rowNumber: 1,
    message: "CHUNK_UPSERT_FAILED",
    rawRow: { sourceFile: "missing-file.csv" },
  },
];

async function getPasswordHash(password) {
  const cryptoModulePath = pathToFileURL(
    path.resolve(
      __dirname,
      "..",
      "apps",
      "api",
      "node_modules",
      "better-auth",
      "dist",
      "crypto",
      "index.mjs",
    ),
  ).href;
  const { hashPassword } = await import(cryptoModulePath);
  return hashPassword(password);
}

async function ensureCredentialAccount(userId, passwordHash) {
  const existing = await prisma.betterAuthAccount.findFirst({
    where: {
      userId,
      providerId: "credential",
    },
    select: { id: true },
  });

  if (existing) {
    return prisma.betterAuthAccount.update({
      where: { id: existing.id },
      data: {
        accountId: userId,
        password: passwordHash,
      },
    });
  }

  return prisma.betterAuthAccount.create({
    data: {
      userId,
      accountId: userId,
      providerId: "credential",
      password: passwordHash,
    },
  });
}

async function ensureUser(accountConfig, passwordHash) {
  const user = await prisma.betterAuthUser.upsert({
    where: { email: accountConfig.email },
    update: {
      name: accountConfig.name,
      emailVerified: true,
    },
    create: {
      email: accountConfig.email,
      name: accountConfig.name,
      emailVerified: true,
    },
  });

  await ensureCredentialAccount(user.id, passwordHash);

  for (const role of accountConfig.roles) {
    await prisma.userRole.upsert({
      where: {
        userId_role: {
          userId: user.id,
          role,
        },
      },
      update: {},
      create: {
        userId: user.id,
        role,
      },
    });
  }

  return user;
}

async function main() {
  const passwordHash = await getPasswordHash(SAMPLE_PASSWORD);

  const organizer = await ensureUser(ACCOUNTS.organizer, passwordHash);
  const checkinStaff = await ensureUser(ACCOUNTS.staff, passwordHash);
  const studentUser = await ensureUser(ACCOUNTS.student, passwordHash);

  const usersByKey = {
    organizer,
    staff: checkinStaff,
    student: studentUser,
  };

  for (const student of STUDENTS) {
    await prisma.student.upsert({
      where: { mssv: student.mssv },
      update: {
        email: student.email,
        fullName: student.fullName,
        phone: student.phone,
        faculty: student.faculty,
        className: student.className,
        status: student.status,
        betterAuthUserId: student.accountKey
          ? usersByKey[student.accountKey].id
          : null,
        csvSyncedAt: new Date("2026-05-13T02:30:00Z"),
      },
      create: {
        mssv: student.mssv,
        email: student.email,
        fullName: student.fullName,
        phone: student.phone,
        faculty: student.faculty,
        className: student.className,
        status: student.status,
        betterAuthUserId: student.accountKey
          ? usersByKey[student.accountKey].id
          : null,
        csvSyncedAt: new Date("2026-05-13T02:30:00Z"),
      },
    });
  }

  for (const workshop of WORKSHOPS) {
    await prisma.workshop.upsert({
      where: { id: workshop.id },
      update: {
        title: workshop.title,
        description: workshop.description,
        speaker: workshop.speaker,
        room: workshop.room,
        capacity: workshop.capacity,
        registeredCount: workshop.registeredCount,
        price: workshop.price,
        startTime: workshop.startTime,
        endTime: workshop.endTime,
        status: workshop.status,
        floorMapUrl: workshop.floorMapUrl,
        organizerId: organizer.id,
      },
      create: {
        ...workshop,
        organizerId: organizer.id,
      },
    });
  }

  for (const registration of REGISTRATIONS) {
    await prisma.registration.upsert({
      where: { id: registration.id },
      update: {
        mssv: registration.mssv,
        workshopId: registration.workshopId,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        qrCode: registration.qrCode,
        paymentCompletedAt: registration.paymentCompletedAt,
        heldUntil: registration.heldUntil,
        cancellationReason: registration.cancellationReason,
      },
      create: registration,
    });
  }

  for (const payment of PAYMENTS) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: {
        registrationId: payment.registrationId,
        provider: payment.provider,
        providerRef: payment.providerRef,
        idempotencyKey: payment.idempotencyKey,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        requestedAt: payment.requestedAt,
        completedAt: payment.completedAt,
      },
      create: payment,
    });
  }

  for (const assignment of ASSIGNMENTS) {
    await prisma.staffWorkshopAssignment.upsert({
      where: { id: assignment.id },
      update: {
        staffUserId: checkinStaff.id,
        workshopId: assignment.workshopId,
        status: assignment.status,
      },
      create: {
        id: assignment.id,
        staffUserId: checkinStaff.id,
        workshopId: assignment.workshopId,
        status: assignment.status,
      },
    });
  }

  for (const checkin of CHECKINS) {
    await prisma.checkin.upsert({
      where: { id: checkin.id },
      update: {
        mssv: checkin.mssv,
        workshopId: checkin.workshopId,
        checkinStaffId: checkinStaff.id,
        registrationId: checkin.registrationId,
        deviceEventId: checkin.deviceEventId,
        checkedInAt: checkin.checkedInAt,
        syncedAt: checkin.syncedAt,
        syncStatus: checkin.syncStatus,
      },
      create: {
        ...checkin,
        checkinStaffId: checkinStaff.id,
      },
    });
  }

  for (const document of DOCUMENTS) {
    await prisma.workshopDocument.upsert({
      where: { id: document.id },
      update: {
        workshopId: document.workshopId,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        processingStatus: document.processingStatus,
      },
      create: document,
    });
  }

  for (const summaryJob of SUMMARY_JOBS) {
    await prisma.aiSummaryJob.upsert({
      where: { id: summaryJob.id },
      update: {
        documentId: summaryJob.documentId,
        summaryText: summaryJob.summaryText,
        status: summaryJob.status,
        retryCount: summaryJob.retryCount,
      },
      create: summaryJob,
    });
  }

  await prisma.notificationDelivery.upsert({
    where: { dedupeKey: "seed-notify-student-workshop-confirmed" },
    update: {
      userId: studentUser.id,
      channel: "email",
      templateCode: "registration_confirmed",
      status: "sent",
      sentAt: new Date("2026-05-13T04:00:00Z"),
    },
    create: {
      userId: studentUser.id,
      channel: "email",
      templateCode: "registration_confirmed",
      status: "sent",
      dedupeKey: "seed-notify-student-workshop-confirmed",
      sentAt: new Date("2026-05-13T04:00:00Z"),
    },
  });

  await prisma.notificationDelivery.upsert({
    where: { dedupeKey: "seed-notify-organizer-summary-ready" },
    update: {
      userId: organizer.id,
      channel: "in_app",
      templateCode: "summary_ready",
      status: "pending",
      sentAt: null,
    },
    create: {
      userId: organizer.id,
      channel: "in_app",
      templateCode: "summary_ready",
      status: "pending",
      dedupeKey: "seed-notify-organizer-summary-ready",
      sentAt: null,
    },
  });

  await prisma.notificationDelivery.upsert({
    where: { dedupeKey: "seed-notify-staff-sync-failed" },
    update: {
      userId: checkinStaff.id,
      channel: "telegram",
      templateCode: "checkin_sync_failed",
      status: "failed",
      sentAt: null,
    },
    create: {
      userId: checkinStaff.id,
      channel: "telegram",
      templateCode: "checkin_sync_failed",
      status: "failed",
      dedupeKey: "seed-notify-staff-sync-failed",
      sentAt: null,
    },
  });

  const auditLogs = [
    {
      id: "41c80811-5ddb-47e3-b237-b69d90289326",
      actorUserId: organizer.id,
      action: "workshop.created",
      resourceType: "workshop",
      resourceId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
      metadata: {
        title: "AI for Career Growth",
        source: "seed",
      },
    },
    {
      id: "7ce8cc84-8ca2-4656-9202-b78618217ec6",
      actorUserId: studentUser.id,
      action: "registration.created",
      resourceType: "registration",
      resourceId: "9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4",
      metadata: {
        workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
      },
    },
    {
      id: "af6378b4-7df0-48b3-aa3e-d4d9ce5f1885",
      actorUserId: checkinStaff.id,
      action: "checkin.confirmed",
      resourceType: "checkin",
      resourceId: "3a2c9e1a-52b7-4f6f-9e06-6d52af48e5a6",
      metadata: {
        workshopId: "2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142",
        deviceEventId: "device-event-ai-career-21127001",
      },
    },
  ];

  for (const auditLog of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: auditLog.id },
      update: auditLog,
      create: auditLog,
    });
  }

  for (const batch of CSV_BATCHES) {
    await prisma.csvLog.upsert({
      where: { id: batch.id },
      update: batch,
      create: batch,
    });
  }

  for (const error of CSV_ERRORS) {
    await prisma.csvLogError.upsert({
      where: { id: error.id },
      update: error,
      create: error,
    });
  }

  console.log("Seed data created.");
  console.log("");
  console.log("Sample accounts:");
  console.log(`- Student   : ${ACCOUNTS.student.email} / ${SAMPLE_PASSWORD}`);
  console.log(`- Organizer : ${ACCOUNTS.organizer.email} / ${SAMPLE_PASSWORD}`);
  console.log(`- Check-in  : ${ACCOUNTS.staff.email} / ${SAMPLE_PASSWORD}`);
  console.log("");
  console.log(`CSV fixture : ${CSV_FIXTURE_PATH}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
