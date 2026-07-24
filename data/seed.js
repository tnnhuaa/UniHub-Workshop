const path = require('node:path');
const { pathToFileURL } = require('node:url');
require(
  path.resolve(__dirname, '..', 'apps', 'api', 'node_modules', 'dotenv'),
).config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SAMPLE_PASSWORD = 'Test@123456';
const CSV_FIXTURE_PATH = path.resolve(
  __dirname,
  'fixtures',
  'students-import-sample.csv',
);

const ACCOUNTS = {
  organizer: {
    email: 'organizer@unihub.local',
    name: 'Organizer Admin',
    roles: ['organizer'],
  },
  staff: {
    email: 'checkin@unihub.local',
    name: 'Check-in Staff',
    roles: ['checkin_staff'],
  },
  student: {
    email: 'student@unihub.local',
    name: 'Student User',
    roles: ['student'],
  },
};

const STUDENTS = [
  {
    mssv: '21127001',
    email: 'student@unihub.local',
    fullName: 'Nguyen Van A',
    phone: '0901000001',
    faculty: 'Information Technology',
    className: 'SE2026',
    status: 'active',
    accountKey: 'student',
  },
  {
    mssv: '21127002',
    email: 'tran.binh@unihub.local',
    fullName: 'Tran Thi Binh',
    phone: '0901000002',
    faculty: 'Business Administration',
    className: 'BA2026',
    status: 'active',
  },
  {
    mssv: '21127003',
    email: 'le.cuong@unihub.local',
    fullName: 'Le Minh Cuong',
    phone: '0901000003',
    faculty: 'Computer Science',
    className: 'CS2026',
    status: 'active',
  },
  {
    mssv: '21127004',
    email: 'pham.dung@unihub.local',
    fullName: 'Pham Thi Dung',
    phone: '0901000004',
    faculty: 'Design',
    className: 'DS2026',
    status: 'inactive',
  },
];

const MORE_STUDENTS = [
  {
    mssv: '21127005',
    email: 'le.van.e@unihub.local',
    fullName: 'Le Van E',
    phone: '0901000005',
    faculty: 'Information Technology',
    className: 'SE2026',
    status: 'active',
  },
  {
    mssv: '21127006',
    email: 'hoang.thi.f@unihub.local',
    fullName: 'Hoang Thi F',
    phone: '0901000006',
    faculty: 'Information Technology',
    className: 'SE2026',
    status: 'active',
  },
  {
    mssv: '21127007',
    email: 'ngo.quoc.g@unihub.local',
    fullName: 'Ngo Quoc G',
    phone: '0901000007',
    faculty: 'Business Administration',
    className: 'BA2026',
    status: 'active',
  },
  {
    mssv: '21127008',
    email: 'vu.thanh.h@unihub.local',
    fullName: 'Vu Thanh H',
    phone: '0901000008',
    faculty: 'Computer Science',
    className: 'CS2026',
    status: 'active',
  },
  {
    mssv: '21127009',
    email: 'do.minh.i@unihub.local',
    fullName: 'Do Minh I',
    phone: '0901000009',
    faculty: 'Design',
    className: 'DS2026',
    status: 'active',
  },
  {
    mssv: '21127010',
    email: 'dang.quang.j@unihub.local',
    fullName: 'Dang Quang J',
    phone: '0901000010',
    faculty: 'Information Technology',
    className: 'SE2026',
    status: 'active',
  },
  {
    mssv: '21127011',
    email: 'bui.huu.k@unihub.local',
    fullName: 'Bui Huu K',
    phone: '0901000011',
    faculty: 'Business Administration',
    className: 'BA2026',
    status: 'active',
  },
  {
    mssv: '21127012',
    email: 'ly.gia.l@unihub.local',
    fullName: 'Ly Gia L',
    phone: '0901000012',
    faculty: 'Computer Science',
    className: 'CS2026',
    status: 'active',
  },
  {
    mssv: '21127013',
    email: 'truong.an.m@unihub.local',
    fullName: 'Truong An M',
    phone: '0901000013',
    faculty: 'Design',
    className: 'DS2026',
    status: 'active',
  },
  {
    mssv: '21127014',
    email: 'phan.hoang.n@unihub.local',
    fullName: 'Phan Hoang N',
    phone: '0901000014',
    faculty: 'Information Technology',
    className: 'SE2026',
    status: 'active',
  },
];

STUDENTS.push(...MORE_STUDENTS);

const WORKSHOPS = [
  {
    id: '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01',
    title: 'Intro to Product Design',
    description: 'Foundations of product design for student teams.',
    speaker: 'Nguyen Minh Anh',
    room: 'A101',
    capacity: 60,
    registeredCount: 1,
    price: 0,
    startTime: new Date('2026-06-01T08:00:00Z'),
    endTime: new Date('2026-06-01T10:00:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/a101-floor-map.png',
  },
  {
    id: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
    title: 'AI for Career Growth',
    description: 'Practical AI tools to boost your job search.',
    speaker: 'Tran Quoc Huy',
    room: 'B203',
    capacity: 80,
    registeredCount: 2,
    price: 50000,
    startTime: new Date('2026-06-02T08:00:00Z'),
    endTime: new Date('2026-06-02T10:00:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/b203-floor-map.png',
  },
  {
    id: '6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8',
    title: 'Startup Finance Basics',
    description: 'Cash flow, runway, and funding essentials.',
    speaker: 'Le Thanh Tuan',
    room: 'C304',
    capacity: 50,
    registeredCount: 1,
    price: 0,
    startTime: new Date('2026-05-20T08:00:00Z'),
    endTime: new Date('2026-05-20T10:00:00Z'),
    status: 'completed',
    floorMapUrl: 'https://cdn.unihub.local/maps/c304-floor-map.png',
  },
  {
    id: '7bf4b5fd-f0b8-4d8f-9dc9-79d0cb7bd601',
    title: 'Hackathon Kickoff Briefing',
    description: 'Draft planning session for internal organizers.',
    speaker: 'Internal Ops Team',
    room: 'D201',
    capacity: 30,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-06-10T01:00:00Z'),
    endTime: new Date('2026-06-10T03:00:00Z'),
    status: 'draft',
    floorMapUrl: null,
  },
  {
    id: 'c25795a3-32a5-4fe7-8a8d-64d3f75d3d02',
    title: 'Cloud Security Crash Course',
    description: 'Cancelled session kept for admin/test coverage.',
    speaker: 'Pham Gia Bao',
    room: 'E105',
    capacity: 45,
    registeredCount: 0,
    price: 75000,
    startTime: new Date('2026-06-15T08:00:00Z'),
    endTime: new Date('2026-06-15T10:00:00Z'),
    status: 'cancelled',
    floorMapUrl: 'https://cdn.unihub.local/maps/e105-floor-map.png',
  },
  {
    id: 'f7ce8c29-6c3b-4a11-9d28-6b7d4e5a1001',
    title: 'Modern Frontend Sprint',
    description: 'Hands-on React and Vite workshop for student builders.',
    speaker: 'Vo Gia Huy',
    room: 'F204',
    capacity: 40,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-06-18T08:00:00Z'),
    endTime: new Date('2026-06-18T10:30:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/f204-floor-map.png',
  },
  {
    id: 'c4d2b5a1-17a7-4d93-9b63-7f0143f11002',
    title: 'Portfolio Review Studio',
    description: 'Bring your CV and portfolio for live feedback from mentors.',
    speaker: 'Dang Thu Ha',
    room: 'G105',
    capacity: 35,
    registeredCount: 0,
    price: 25000,
    startTime: new Date('2026-06-22T06:30:00Z'),
    endTime: new Date('2026-06-22T09:00:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/g105-floor-map.png',
  },
  {
    id: 'ab91f83d-5f7b-4c9a-8f72-2cb492f21003',
    title: 'Data Storytelling for Students',
    description: 'Learn how to turn analysis into clear visual stories.',
    speaker: 'Nguyen Bao Chau',
    room: 'H302',
    capacity: 55,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-06-25T09:00:00Z'),
    endTime: new Date('2026-06-25T11:00:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/h302-floor-map.png',
  },
];

const REGISTRATIONS = [
  {
    id: '9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4',
    mssv: '21127001',
    workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
    status: 'confirmed',
    paymentStatus: 'paid',
    qrCode: 'QR-21127001-AI-CAREER',
    paymentCompletedAt: new Date('2026-05-13T02:00:00Z'),
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '113f3e25-52d2-4787-8e1c-01d5e164cc61',
    mssv: '21127001',
    workshopId: '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01',
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127001-PRODUCT-DESIGN',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: 'd7c77fe6-1403-4a8a-b53b-3918ce732451',
    mssv: '21127002',
    workshopId: '6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8',
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127002-FINANCE',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '93807f56-48d8-4f0b-aa5f-b6274955b69d',
    mssv: '21127003',
    workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
    status: 'pending',
    paymentStatus: 'pending',
    qrCode: null,
    paymentCompletedAt: null,
    heldUntil: new Date('2026-05-14T03:00:00Z'),
    cancellationReason: null,
  },
  {
    id: 'c8fbd186-6762-43d0-88ee-0b1f40f7d662',
    mssv: '21127004',
    workshopId: 'c25795a3-32a5-4fe7-8a8d-64d3f75d3d02',
    status: 'cancelled',
    paymentStatus: 'refunded',
    qrCode: null,
    paymentCompletedAt: new Date('2026-05-11T04:00:00Z'),
    heldUntil: null,
    cancellationReason: 'workshop_cancelled',
  },
];

const MORE_REGISTRATIONS = [
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e801',
    mssv: '21127005',
    workshopId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', // React Performance
    status: 'confirmed',
    paymentStatus: 'paid',
    qrCode: 'QR-21127005-REACT-PERF',
    paymentCompletedAt: new Date('2026-06-15T10:00:00Z'),
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e802',
    mssv: '21127006',
    workshopId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', // React Performance
    status: 'confirmed',
    paymentStatus: 'paid',
    qrCode: 'QR-21127006-REACT-PERF',
    paymentCompletedAt: new Date('2026-06-15T11:00:00Z'),
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e803',
    mssv: '21127007',
    workshopId: 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', // Cybersecurity
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127007-CYBER',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e804',
    mssv: '21127008',
    workshopId: 'c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f', // Public Speaking
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127008-SPEAKING',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e805',
    mssv: '21127009',
    workshopId: 'd4e5f6a7-b8c9-4d8e-9f2a-3b4c5d6e7f8a', // Docker & K8s
    status: 'pending',
    paymentStatus: 'pending',
    qrCode: null,
    paymentCompletedAt: null,
    heldUntil: new Date('2026-07-01T10:00:00Z'),
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e806',
    mssv: '21127010',
    workshopId: 'e5f6a7b8-c9d0-4e9f-aa3b-4c5d6e7f8a9b', // Digital Marketing
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127010-MARKETING',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e807',
    mssv: '21127011',
    workshopId: 'a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d', // Agile & Scrum
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127011-AGILE',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e808',
    mssv: '21127012',
    workshopId: 'b8c9d0e1-f2a3-4b2c-9d6e-7f8a9b0c1d2e', // Blockchain
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127012-BLOCKCHAIN',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e809',
    mssv: '21127013',
    workshopId: 'c9d0e1f2-a3b4-4c3d-ae7f-8a9b0c1d2e3f', // Data Science
    status: 'cancelled',
    paymentStatus: 'pending',
    qrCode: null,
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: 'user_requested',
  },
  {
    id: '778e72c8-8f83-4a61-9c6a-685b3068e810',
    mssv: '21127014',
    workshopId: 'd0e1f2a3-b4c5-4d4e-bf8a-9b0c1d2e3f4a', // Flutter
    status: 'confirmed',
    paymentStatus: 'pending',
    qrCode: 'QR-21127014-FLUTTER',
    paymentCompletedAt: null,
    heldUntil: null,
    cancellationReason: null,
  },
];
REGISTRATIONS.push(...MORE_REGISTRATIONS);

const MORE_WORKSHOPS = [
  {
    id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    title: 'React Performance Optimization',
    description: 'Deep dive into useMemo, useCallback and profiling tools.',
    speaker: 'Hoang Nguyen',
    room: 'A202',
    capacity: 40,
    registeredCount: 5,
    price: 20000,
    startTime: new Date('2026-07-10T08:00:00Z'),
    endTime: new Date('2026-07-10T11:00:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/a202-floor-map.png',
  },
  {
    id: 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    title: 'Cybersecurity Essentials',
    description:
      'Protecting your data and understanding common attack vectors.',
    speaker: 'Phan Minh',
    room: 'B105',
    capacity: 100,
    registeredCount: 3,
    price: 0,
    startTime: new Date('2026-07-12T13:30:00Z'),
    endTime: new Date('2026-07-12T16:00:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
  {
    id: 'c3d4e5f6-a7b8-4c7d-8e1f-2a3b4c5d6e7f',
    title: 'Public Speaking for Engineers',
    description:
      'How to present technical ideas to non-technical stakeholders.',
    speaker: 'Elena Trinh',
    room: 'C401',
    capacity: 30,
    registeredCount: 2,
    price: 0,
    startTime: new Date('2026-07-15T09:00:00Z'),
    endTime: new Date('2026-07-15T11:30:00Z'),
    status: 'published',
    floorMapUrl: 'https://cdn.unihub.local/maps/c401-floor-map.png',
  },
  {
    id: 'd4e5f6a7-b8c9-4d8e-9f2a-3b4c5d6e7f8a',
    title: 'Docker & Kubernetes 101',
    description: 'Containerization basics for modern web applications.',
    speaker: 'Tran Long',
    room: 'Lab 4',
    capacity: 25,
    registeredCount: 0,
    price: 150000,
    startTime: new Date('2026-07-20T08:00:00Z'),
    endTime: new Date('2026-07-20T12:00:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
  {
    id: 'e5f6a7b8-c9d0-4e9f-aa3b-4c5d6e7f8a9b',
    title: 'Digital Marketing for Startups',
    description: 'Growth hacking and SEO strategies for new ventures.',
    speaker: 'Bui Anh Tuan',
    room: 'D302',
    capacity: 60,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-07-25T14:00:00Z'),
    endTime: new Date('2026-07-25T16:00:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
  {
    id: 'f6a7b8c9-d0e1-4f0a-bb4c-5d6e7f8a9b0c',
    title: 'Figma for Beginners',
    description: 'Learn the basics of UI design with Figma.',
    speaker: 'Le Vy',
    room: 'G201',
    capacity: 40,
    registeredCount: 0,
    price: 50000,
    startTime: new Date('2026-07-28T08:30:00Z'),
    endTime: new Date('2026-07-28T11:30:00Z'),
    status: 'draft',
    floorMapUrl: null,
  },
  {
    id: 'a7b8c9d0-e1f2-4a1b-8c5d-6e7f8a9b0c1d',
    title: 'Agile & Scrum Masterclass',
    description: 'Working effectively in modern software teams.',
    speaker: 'Kevin Pham',
    room: 'B202',
    capacity: 45,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-08-01T09:00:00Z'),
    endTime: new Date('2026-08-01T12:00:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
  {
    id: 'b8c9d0e1-f2a3-4b2c-9d6e-7f8a9b0c1d2e',
    title: 'Blockchain & Web3 Apps',
    description: 'Understanding smart contracts and decentralized web.',
    speaker: 'Ngo Gia Bao',
    room: 'Hall A',
    capacity: 150,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-08-05T13:00:00Z'),
    endTime: new Date('2026-08-05T16:00:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
  {
    id: 'c9d0e1f2-a3b4-4c3d-ae7f-8a9b0c1d2e3f',
    title: 'Data Science with Python',
    description: 'Hands-on Pandas, Numpy and Matplotlib.',
    speaker: 'Dr. Nguyen Duc',
    room: 'C102',
    capacity: 35,
    registeredCount: 0,
    price: 100000,
    startTime: new Date('2026-08-10T08:00:00Z'),
    endTime: new Date('2026-08-10T12:00:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
  {
    id: 'd0e1f2a3-b4c5-4d4e-bf8a-9b0c1d2e3f4a',
    title: 'Mobile App with Flutter',
    description: 'Build cross-platform apps from a single codebase.',
    speaker: 'Pham Quoc',
    room: 'F301',
    capacity: 40,
    registeredCount: 0,
    price: 0,
    startTime: new Date('2026-08-15T09:00:00Z'),
    endTime: new Date('2026-08-15T11:30:00Z'),
    status: 'published',
    floorMapUrl: null,
  },
];

WORKSHOPS.push(...MORE_WORKSHOPS);

const PAYMENTS = [
  {
    id: 'b2145ff1-1336-4842-bfd7-b2036732fd97',
    registrationId: '9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4',
    provider: 'mock',
    providerRef: 'mock_paid_ai_career_21127001',
    idempotencyKey: 'seed-payment-success-21127001-ai-career',
    amount: 50000,
    currency: 'VND',
    status: 'paid',
    requestedAt: new Date('2026-05-13T01:50:00Z'),
    completedAt: new Date('2026-05-13T02:00:00Z'),
  },
  {
    id: '6ed952e5-df1c-4ded-80cb-b00b357cb5de',
    registrationId: '93807f56-48d8-4f0b-aa5f-b6274955b69d',
    provider: 'mock',
    providerRef: null,
    idempotencyKey: 'seed-payment-pending-21127003-ai-career',
    amount: 50000,
    currency: 'VND',
    status: 'pending',
    requestedAt: new Date('2026-05-13T02:10:00Z'),
    completedAt: null,
  },
  {
    id: 'c4fe18cc-75ae-4577-a9b4-070c3226f8d9',
    registrationId: 'c8fbd186-6762-43d0-88ee-0b1f40f7d662',
    provider: 'mock',
    providerRef: 'mock_refund_cloud_security_21127004',
    idempotencyKey: 'seed-payment-refunded-21127004-cloud-security',
    amount: 75000,
    currency: 'VND',
    status: 'refunded',
    requestedAt: new Date('2026-05-11T03:50:00Z'),
    completedAt: new Date('2026-05-11T04:00:00Z'),
  },
];

const CHECKINS = [
  {
    id: '3a2c9e1a-52b7-4f6f-9e06-6d52af48e5a6',
    mssv: '21127001',
    workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
    registrationId: '9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4',
    deviceEventId: 'device-event-ai-career-21127001',
    checkedInAt: new Date('2026-06-02T07:55:00Z'),
    syncedAt: new Date('2026-06-02T07:56:00Z'),
    syncStatus: 'synced',
  },
];

const ASSIGNMENTS = [
  {
    id: '8a9ef7c1-080c-4647-95f8-3fa1153f9073',
    workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
    status: 'active',
  },
  {
    id: 'a85c96a8-f36f-4707-b083-f53b7ebcf95a',
    workshopId: '6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8',
    status: 'active',
  },
  {
    id: 'b1026784-d82a-4b84-9f97-e91f88418fee',
    workshopId: 'c25795a3-32a5-4fe7-8a8d-64d3f75d3d02',
    status: 'inactive',
  },
];

const DOCUMENTS = [
  {
    id: '658c67df-17b0-46a8-bfff-f92de85d3355',
    workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
    fileUrl:
      'https://storage.unihub.local/workshops/ai-career-growth/slide-deck.pdf',
    fileName: 'ai-career-growth-slides.pdf',
    processingStatus: 'completed',
  },
  {
    id: '42628af8-0b3c-4268-a8f8-f1d0ddb0310d',
    workshopId: '6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8',
    fileUrl:
      'https://storage.unihub.local/workshops/startup-finance/handout.pdf',
    fileName: 'startup-finance-handout.pdf',
    processingStatus: 'failed',
  },
];

const SUMMARY_JOBS = [
  {
    id: '27ec47f1-07f5-4665-bc03-364897c205b5',
    documentId: '658c67df-17b0-46a8-bfff-f92de85d3355',
    summaryText:
      'Career workshop covers CV tailoring, networking prompts, and interview preparation with AI assistants.',
    status: 'completed',
    retryCount: 0,
  },
  {
    id: '6f70a998-c360-4a1f-960f-91620cfd89da',
    documentId: '42628af8-0b3c-4268-a8f8-f1d0ddb0310d',
    summaryText: null,
    status: 'failed',
    retryCount: 1,
  },
];

const CSV_BATCHES = [
  {
    id: 'f6c6e213-7d0f-4f1e-8b25-2f16d62c52d9',
    sourceFile: CSV_FIXTURE_PATH,
    totalRecords: 4,
    successfulRecords: 2,
    failedRecords: 1,
    conflictRecords: 1,
    status: 'completed',
    completedAt: new Date('2026-05-13T03:00:00Z'),
  },
  {
    id: '4f0b291d-acf3-4ea4-9527-9fd3ebb80593',
    sourceFile: path.resolve(__dirname, 'fixtures', 'missing-file.csv'),
    totalRecords: 0,
    successfulRecords: 0,
    failedRecords: 0,
    conflictRecords: 0,
    status: 'failed',
    completedAt: new Date('2026-05-13T03:30:00Z'),
  },
];

const CSV_ERRORS = [
  {
    id: '8b29798c-72f6-4b3f-8389-7761fd634f99',
    batchId: 'f6c6e213-7d0f-4f1e-8b25-2f16d62c52d9',
    rowNumber: 4,
    message: 'EMAIL_INVALID',
    rawRow: {
      mssv: '21127100',
      email: 'invalid-email',
      fullName: 'Invalid Email Student',
      phone: '0901000099',
      faculty: 'Testing',
      className: 'QA2026',
      status: 'active',
    },
  },
  {
    id: 'c95a01d3-44c9-4af1-9a8c-7cc3a099035f',
    batchId: '4f0b291d-acf3-4ea4-9527-9fd3ebb80593',
    rowNumber: 1,
    message: 'CHUNK_UPSERT_FAILED',
    rawRow: { sourceFile: 'missing-file.csv' },
  },
];

async function getPasswordHash(password) {
  const cryptoModulePath = pathToFileURL(
    path.resolve(
      __dirname,
      '..',
      'apps',
      'api',
      'node_modules',
      'better-auth',
      'dist',
      'crypto',
      'index.mjs',
    ),
  ).href;
  const { hashPassword } = await import(cryptoModulePath);
  return hashPassword(password);
}

async function ensureCredentialAccount(userId, passwordHash) {
  const existing = await prisma.betterAuthAccount.findFirst({
    where: {
      userId,
      providerId: 'credential',
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
      providerId: 'credential',
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
        csvSyncedAt: new Date('2026-05-13T02:30:00Z'),
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
        csvSyncedAt: new Date('2026-05-13T02:30:00Z'),
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

  const notificationSeeds = [
    {
      eventKey: 'seed-notify-student-workshop-confirmed',
      userId: studentUser.id,
      type: 'workshop_registration_confirmed',
      title: 'Workshop registration confirmed',
      body: 'Your registration for AI for Career Growth is confirmed.',
      data: {
        registrationId: '9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4',
        workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
        workshopTitle: 'AI for Career Growth',
      },
      channel: 'email',
      status: 'sent',
      sentAt: new Date('2026-05-13T04:00:00Z'),
    },
    {
      eventKey: 'seed-notify-organizer-summary-ready',
      userId: organizer.id,
      type: 'custom',
      title: 'Workshop summary ready',
      body: 'The AI summary for AI for Career Growth is ready to review.',
      data: {
        documentId: '658c67df-17b0-46a8-bfff-f92de85d3355',
        workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
      },
      channel: 'in_app',
      status: 'pending',
      sentAt: null,
    },
    {
      eventKey: 'seed-notify-staff-sync-failed',
      userId: checkinStaff.id,
      type: 'custom',
      title: 'Check-in sync failed',
      body: 'A check-in synchronization event requires attention.',
      data: {
        checkinId: '3a2c9e1a-52b7-4f6f-9e06-6d52af48e5a6',
        workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
      },
      channel: 'telegram',
      status: 'failed',
      sentAt: null,
    },
  ];

  for (const notificationSeed of notificationSeeds) {
    const notification = await prisma.notification.upsert({
      where: { eventKey: notificationSeed.eventKey },
      update: {
        userId: notificationSeed.userId,
        type: notificationSeed.type,
        title: notificationSeed.title,
        body: notificationSeed.body,
        data: notificationSeed.data,
      },
      create: {
        userId: notificationSeed.userId,
        type: notificationSeed.type,
        title: notificationSeed.title,
        body: notificationSeed.body,
        data: notificationSeed.data,
        eventKey: notificationSeed.eventKey,
      },
    });

    await prisma.notificationDelivery.upsert({
      where: { dedupeKey: notificationSeed.eventKey },
      update: {
        notificationId: notification.id,
        channel: notificationSeed.channel,
        status: notificationSeed.status,
        sentAt: notificationSeed.sentAt,
      },
      create: {
        notificationId: notification.id,
        channel: notificationSeed.channel,
        status: notificationSeed.status,
        dedupeKey: notificationSeed.eventKey,
        sentAt: notificationSeed.sentAt,
      },
    });
  }

  const auditLogs = [
    {
      id: '41c80811-5ddb-47e3-b237-b69d90289326',
      actorUserId: organizer.id,
      action: 'workshop.created',
      resourceType: 'workshop',
      resourceId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
      metadata: {
        title: 'AI for Career Growth',
        source: 'seed',
      },
    },
    {
      id: '7ce8cc84-8ca2-4656-9202-b78618217ec6',
      actorUserId: studentUser.id,
      action: 'registration.created',
      resourceType: 'registration',
      resourceId: '9b5ef0f0-3e22-4b66-90e0-65c4c413b6b4',
      metadata: {
        workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
      },
    },
    {
      id: 'af6378b4-7df0-48b3-aa3e-d4d9ce5f1885',
      actorUserId: checkinStaff.id,
      action: 'checkin.confirmed',
      resourceType: 'checkin',
      resourceId: '3a2c9e1a-52b7-4f6f-9e06-6d52af48e5a6',
      metadata: {
        workshopId: '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142',
        deviceEventId: 'device-event-ai-career-21127001',
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

  console.log('Seed data created.');
  console.log('');
  console.log('Sample accounts:');
  console.log(`- Student   : ${ACCOUNTS.student.email} / ${SAMPLE_PASSWORD}`);
  console.log(`- Organizer : ${ACCOUNTS.organizer.email} / ${SAMPLE_PASSWORD}`);
  console.log(`- Check-in  : ${ACCOUNTS.staff.email} / ${SAMPLE_PASSWORD}`);
  console.log('');
  console.log(`CSV fixture : ${CSV_FIXTURE_PATH}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
