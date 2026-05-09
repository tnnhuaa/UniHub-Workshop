// This file is the temporary mock transport layer. Swap these handlers for real HTTP calls later.
const DEFAULT_BASE_URL = "http://localhost:3000/api/v1";

export type MockHttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type MockRequestSnapshot = {
  method: MockHttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

export type MockApiSuccess<TData> = {
  ok: true;
  data: TData;
  request: MockRequestSnapshot;
};

export type MockApiFailure = {
  ok: false;
  error: string;
  request: MockRequestSnapshot;
};

export type MockApiResult<TData> = MockApiSuccess<TData> | MockApiFailure;

export type WorkshopStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "checked-in";

export type MockWorkshopSummary = {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speakerTitle: string;
  speakerAvatar: string;
  room: string;
  startTime: string;
  endTime: string;
  price: number;
  capacity: number;
  registeredCount: number;
  status: WorkshopStatus;
  coverImage: string;
  category: string;
};

export type MockWorkshopDetail = MockWorkshopSummary & {
  summary: string;
  about: string;
  takeaways: string[];
  locationLabel: string;
  floorMapImage: string;
  speakerBio: string;
};

export type MockStudentProfile = {
  mssv: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  major: string;
  year: string;
  avatar: string;
  verified: boolean;
};

export type MockProfileUpdatePayload = {
  fullName: string;
  phone: string;
  bio: string;
  avatar: string;
};

export type MockRegistration = {
  id: string;
  mssv: string;
  workshopId: string;
  workshopTitle: string;
  speaker: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
  status: RegistrationStatus;
  registrationCode: string;
  qrCode: string;
  coverImage: string;
  instructorImage: string;
  instructorName: string;
};

export type MockRegistrationPayload = {
  mssv: string;
  workshopId: string;
  attendee: {
    firstName: string;
    lastName: string;
    email: string;
  };
  payment: {
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
  };
  idempotencyKey: string;
};

export type MockQrCodeResponse = {
  registrationId: string;
  qrCode: string;
};

type MockWorkshopQuery = {
  q?: string;
  status?: WorkshopStatus;
  startFrom?: string;
  startTo?: string;
  page?: number;
  pageSize?: number;
};

const workshopImages = {
  studentProfile:
    "https://www.figma.com/api/mcp/asset/22492359-f12d-464a-b95a-fb292c891cc8",
  speaker:
    "https://www.figma.com/api/mcp/asset/2ee92fe2-f247-4654-8897-051b1d405acb",
  reactSpeaker:
    "https://www.figma.com/api/mcp/asset/d068b264-bedc-481e-99ad-9b6f92676680",
  mapLocation:
    "https://www.figma.com/api/mcp/asset/2bdc588e-4301-40b3-8b99-53cbc5b02add",
  checkoutHeader:
    "https://www.figma.com/api/mcp/asset/1b8cc43f-4e00-42b2-9a62-ff2bb6e5389a",
  profileAvatar:
    "https://www.figma.com/api/mcp/asset/8b5490f6-451d-4c0e-b17e-9b43a0619761",
  strategyWorkshop:
    "https://www.figma.com/api/mcp/asset/9b0e9b49-856f-47e4-9ac5-2de62892ba6e",
  pythonWorkshop:
    "https://www.figma.com/api/mcp/asset/64a58b45-b300-48f9-995e-2293793f2b53",
  designWorkshop:
    "https://www.figma.com/api/mcp/asset/0847573c-09b5-4b5f-99f0-8cc62fb92523",
  qrCode:
    "https://www.figma.com/api/mcp/asset/5c679e98-021a-4ac3-a67b-e57df7f69bfb",
  instructor:
    "https://www.figma.com/api/mcp/asset/2b82168d-29d3-4c5e-9069-76b377aabbc7",
};

const mockWorkshops: MockWorkshopDetail[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Advanced UI Patterns in React",
    description:
      "Explore scalable component architecture, design systems, and premium UI implementation patterns.",
    speaker: "Dr. Elena Rostova",
    speakerTitle: "Lead Frontend Architect, TechGlobal",
    speakerAvatar: workshopImages.reactSpeaker,
    room: "Innovation Hub, Room 402",
    startTime: "2026-10-24T14:00:00.000Z",
    endTime: "2026-10-24T16:00:00.000Z",
    price: 149,
    capacity: 30,
    registeredCount: 12,
    status: "published",
    coverImage: workshopImages.checkoutHeader,
    category: "Tech & Innovation",
    summary:
      "This workshop focuses on high-level frontend development strategies. Key takeaways include advanced component composition, scalable state design, and accessible interaction patterns.",
    about:
      "Join us for an intensive session where we break down the most popular UI patterns for modern React applications. The workshop blends theory with hands-on implementation so attendees can leave with practical building blocks.",
    takeaways: [
      "Building responsive bento-style layouts",
      "Designing scalable state boundaries",
      "Advanced Tailwind and component composition",
      "Accessibility in complex interfaces",
    ],
    locationLabel: "North Campus, Building B",
    floorMapImage: workshopImages.mapLocation,
    speakerBio:
      "Elena leads frontend architecture initiatives for enterprise applications and design systems.",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Data Analysis with Python Basics",
    description:
      "Learn practical Python workflows for datasets, charts, and beginner-friendly analysis pipelines.",
    speaker: "Prof. Michael Chang",
    speakerTitle: "Data Science Lecturer",
    speakerAvatar: workshopImages.speaker,
    room: "Tech Hub, Lab 2",
    startTime: "2026-10-25T07:00:00.000Z",
    endTime: "2026-10-25T09:00:00.000Z",
    price: 15,
    capacity: 20,
    registeredCount: 18,
    status: "published",
    coverImage: workshopImages.pythonWorkshop,
    category: "Data & Analytics",
    summary:
      "Hands-on introduction to Python data workflows, visualization, and exploratory analysis.",
    about:
      "This workshop helps students move from spreadsheets to code-first analysis using accessible datasets and practical notebook exercises.",
    takeaways: [
      "Reading and cleaning CSV data",
      "Plotting quick visual summaries",
      "Simple feature exploration",
      "Reusable notebook habits",
    ],
    locationLabel: "Engineering Annex",
    floorMapImage: workshopImages.mapLocation,
    speakerBio: "Michael teaches applied analytics with a focus on practical tooling.",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Effective Time Management",
    description:
      "Practical strategies for prioritization, focus, and sustainable semester planning.",
    speaker: "Emma Richards",
    speakerTitle: "Academic Coach",
    speakerAvatar: workshopImages.speaker,
    room: "Student Center, Room 101",
    startTime: "2026-10-26T04:00:00.000Z",
    endTime: "2026-10-26T06:00:00.000Z",
    price: 0,
    capacity: 25,
    registeredCount: 25,
    status: "published",
    coverImage: workshopImages.strategyWorkshop,
    category: "Personal Development",
    summary:
      "A structured session on building study routines, priority systems, and anti-procrastination habits.",
    about:
      "Students will review common planning mistakes, then build a realistic weekly operating system for school work.",
    takeaways: [
      "Weekly planning systems",
      "Task prioritization models",
      "Focus management",
      "Avoiding burnout",
    ],
    locationLabel: "Student Center",
    floorMapImage: workshopImages.mapLocation,
    speakerBio: "Emma supports students in study planning and academic sustainability.",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Public Speaking 101",
    description:
      "Foundations for structuring short talks and presenting ideas with clarity.",
    speaker: "Dr. Alan Grant",
    speakerTitle: "Communications Trainer",
    speakerAvatar: workshopImages.speaker,
    room: "Seminar Hall C",
    startTime: "2026-10-28T08:30:00.000Z",
    endTime: "2026-10-28T10:00:00.000Z",
    price: 0,
    capacity: 40,
    registeredCount: 0,
    status: "cancelled",
    coverImage: workshopImages.designWorkshop,
    category: "Communication",
    summary: "Cancelled session kept in mock data to support status handling.",
    about: "This workshop is unavailable.",
    takeaways: [],
    locationLabel: "Seminar Hall C",
    floorMapImage: workshopImages.mapLocation,
    speakerBio: "Alan trains student presenters.",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    title: "Introduction to Machine Learning Models",
    description:
      "A practical overview of common ML model families and when to use them.",
    speaker: "Dr. Elena Rostova",
    speakerTitle: "Lead Frontend Architect, TechGlobal",
    speakerAvatar: workshopImages.reactSpeaker,
    room: "Engineering Building, Hall A",
    startTime: "2026-11-02T02:00:00.000Z",
    endTime: "2026-11-02T05:00:00.000Z",
    price: 25,
    capacity: 60,
    registeredCount: 15,
    status: "published",
    coverImage: workshopImages.checkoutHeader,
    category: "AI & Machine Learning",
    summary:
      "A survey of supervised learning, model evaluation, and project framing.",
    about:
      "This session introduces model intuition without overwhelming mathematical detail.",
    takeaways: [
      "Model categories",
      "Basic evaluation thinking",
      "Common pitfalls",
      "Project scoping",
    ],
    locationLabel: "Engineering Building, Hall A",
    floorMapImage: workshopImages.mapLocation,
    speakerBio: "Elena frequently mentors technical teams on emerging technologies.",
  },
];

let mockStudentProfile: MockStudentProfile = {
  mssv: "STU-84920",
  fullName: "Michael Chen",
  email: "m.chen@university.edu",
  phone: "+84 912 345 678",
  bio: "Third-year computer science student. Passionate about AI and software development.",
  major: "Computer Science",
  year: "Year 3",
  avatar: workshopImages.profileAvatar,
  verified: true,
};

let mockRegistrations: MockRegistration[] = [
  {
    id: "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    mssv: "STU-84920",
    workshopId: "11111111-1111-4111-8111-111111111111",
    workshopTitle: "Advanced Corporate Strategy",
    speaker: "Prof. Eleanor Vance",
    location: "Business Hall A, Main Campus",
    dateLabel: "Oct 24, 2026",
    timeLabel: "14:00 - 16:00",
    priceLabel: "Free",
    status: "confirmed",
    registrationCode: "REG-492-X",
    qrCode: workshopImages.qrCode,
    coverImage: workshopImages.strategyWorkshop,
    instructorImage: workshopImages.instructor,
    instructorName: "Prof. Eleanor Vance",
  },
  {
    id: "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    mssv: "STU-84920",
    workshopId: "22222222-2222-4222-8222-222222222222",
    workshopTitle: "Introduction to Python",
    speaker: "Dr. Alan Turing",
    location: "Lab 4B",
    dateLabel: "Oct 22, 2026",
    timeLabel: "09:00 - 12:00",
    priceLabel: "Free",
    status: "checked-in",
    registrationCode: "REG-318-K",
    qrCode: workshopImages.qrCode,
    coverImage: workshopImages.pythonWorkshop,
    instructorImage: workshopImages.instructor,
    instructorName: "Dr. Alan Turing",
  },
  {
    id: "aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    mssv: "STU-84920",
    workshopId: "55555555-5555-4555-8555-555555555555",
    workshopTitle: "UX/UI Principles",
    speaker: "Sarah Jenkins",
    location: "Studio 2",
    dateLabel: "Nov 05, 2026",
    timeLabel: "10:00 - 12:00",
    priceLabel: "$45.00",
    status: "pending",
    registrationCode: "REG-611-P",
    qrCode: workshopImages.qrCode,
    coverImage: workshopImages.designWorkshop,
    instructorImage: workshopImages.instructor,
    instructorName: "Sarah Jenkins",
  },
];

const wait = (duration = 250) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

const normalizeDate = (value: string) => new Date(value).getTime();

const serializeQuery = (
  query?: Record<string, string | number | boolean | undefined>,
) =>
  query
    ? Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined),
      )
    : undefined;

const createRequest = <TBody>(
  method: MockHttpMethod,
  path: string,
  body?: TBody,
  query?: Record<string, string | number | boolean | undefined>,
): MockRequestSnapshot => ({
  method,
  path: `${DEFAULT_BASE_URL}${path}`,
  query: serializeQuery(query),
  body,
});

const filterWorkshops = (query: MockWorkshopQuery) => {
  const q = query.q?.trim().toLowerCase();
  const startFrom = query.startFrom ? normalizeDate(query.startFrom) : undefined;
  const startTo = query.startTo ? normalizeDate(query.startTo) : undefined;

  return mockWorkshops.filter((workshop) => {
    if (query.status && workshop.status !== query.status) {
      return false;
    }

    if (
      q &&
      ![
        workshop.title,
        workshop.description,
        workshop.speaker,
        workshop.room,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    ) {
      return false;
    }

    const startTime = normalizeDate(workshop.startTime);
    if (startFrom && startTime < startFrom) {
      return false;
    }

    if (startTo && startTime > startTo) {
      return false;
    }

    return true;
  });
};

const performMockRequest = async <TData, TBody = undefined>(
  method: MockHttpMethod,
  path: string,
  options?: {
    body?: TBody;
    query?: Record<string, string | number | boolean | undefined>;
  },
): Promise<MockApiResult<TData>> => {
  await wait();
  const request = createRequest(method, path, options?.body, options?.query);

  if (method === "POST" && path === "/auth/sign-in/email") {
    return {
      ok: true,
      data: {
        user: {
          email: (options?.body as { email: string }).email,
          role: "student",
        },
        session: {
          remember: Boolean((options?.body as { remember?: boolean }).remember),
        },
      } as TData,
      request,
    };
  }

  if (method === "POST" && path === "/auth/sign-up/email") {
    return {
      ok: true,
      data: {
        user: {
          email: (options?.body as { email: string }).email,
          role: "student",
        },
      } as TData,
      request,
    };
  }

  if (method === "GET" && path === "/workshops") {
    return {
      ok: true,
      data: filterWorkshops((options?.query ?? {}) as MockWorkshopQuery) as TData,
      request,
    };
  }

  if (method === "GET" && path.startsWith("/workshops/")) {
    const workshopId = path.replace("/workshops/", "");
    const workshop = mockWorkshops.find((item) => item.id === workshopId);

    if (!workshop) {
      return { ok: false, error: "Workshop not found.", request };
    }

    return { ok: true, data: workshop as TData, request };
  }

  if (method === "GET" && path === "/registrations/me") {
    const requestedStatus = options?.query?.status as RegistrationStatus | undefined;
    const data = requestedStatus
      ? mockRegistrations.filter((item) => item.status === requestedStatus)
      : mockRegistrations;
    return { ok: true, data: data as TData, request };
  }

  if (method === "GET" && path.startsWith("/registrations/") && path.endsWith("/qr")) {
    const registrationId = path.replace("/registrations/", "").replace("/qr", "");
    const registration = mockRegistrations.find((item) => item.id === registrationId);

    if (!registration) {
      return { ok: false, error: "Registration not found.", request };
    }

    return {
      ok: true,
      data: {
        registrationId,
        qrCode: registration.qrCode,
      } as TData,
      request,
    };
  }

  if (method === "POST" && path === "/registrations") {
    const payload = options?.body as MockRegistrationPayload;
    const workshop = mockWorkshops.find((item) => item.id === payload.workshopId);

    if (!workshop) {
      return { ok: false, error: "Workshop not found.", request };
    }

    const registration: MockRegistration = {
      id: crypto.randomUUID(),
      mssv: payload.mssv,
      workshopId: payload.workshopId,
      workshopTitle: workshop.title,
      speaker: workshop.speaker,
      location: workshop.room,
      dateLabel: new Date(workshop.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      timeLabel: `${new Date(workshop.startTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(workshop.endTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      priceLabel: workshop.price === 0 ? "Free" : `$${workshop.price.toFixed(2)}`,
      status: workshop.price > 0 ? "pending" : "confirmed",
      registrationCode: `REG-${Math.floor(Math.random() * 900 + 100)}-${payload.attendee.firstName.charAt(0).toUpperCase()}`,
      qrCode: workshopImages.qrCode,
      coverImage: workshop.coverImage,
      instructorImage: workshopImages.instructor,
      instructorName: workshop.speaker,
    };

    mockRegistrations = [registration, ...mockRegistrations];

    return {
      ok: true,
      data: registration as TData,
      request,
    };
  }

  if (method === "GET" && path.startsWith("/students/")) {
    const mssv = path.replace("/students/", "");
    if (mssv !== mockStudentProfile.mssv) {
      return { ok: false, error: "Student not found.", request };
    }

    return {
      ok: true,
      data: mockStudentProfile as TData,
      request,
    };
  }

  if (method === "PUT" && path.startsWith("/students/")) {
    const mssv = path.replace("/students/", "");
    if (mssv !== mockStudentProfile.mssv) {
      return { ok: false, error: "Student not found.", request };
    }

    mockStudentProfile = {
      ...mockStudentProfile,
      ...(options?.body as MockProfileUpdatePayload),
    };

    return {
      ok: true,
      data: mockStudentProfile as TData,
      request,
    };
  }

  if (method === "DELETE" && path.startsWith("/registrations/")) {
    const registrationId = path.replace("/registrations/", "");
    const registration = mockRegistrations.find((item) => item.id === registrationId);

    if (!registration) {
      return { ok: false, error: "Registration not found.", request };
    }

    mockRegistrations = mockRegistrations.map((item) =>
      item.id === registrationId ? { ...item, status: "cancelled" } : item,
    );

    return {
      ok: true,
      data: { id: registrationId, status: "cancelled" } as TData,
      request,
    };
  }

  return {
    ok: false,
    error: "This mock endpoint has not been implemented yet.",
    request,
  };
};

export const formatMockRequestAlert = (request: MockRequestSnapshot) => {
  const lines = [`Mock request sent`, `${request.method} ${request.path}`];

  if (request.query && Object.keys(request.query).length > 0) {
    lines.push(`Query: ${JSON.stringify(request.query, null, 2)}`);
  }

  if (request.body !== undefined) {
    lines.push(`Body: ${JSON.stringify(request.body, null, 2)}`);
  }

  return lines.join("\n\n");
};

// Replace with a real GET /workshops request later.
export const getMockWorkshops = (query: MockWorkshopQuery) =>
  performMockRequest<MockWorkshopSummary[]>("GET", "/workshops", { query });

// Replace with a real GET /workshops/:id request later.
export const getMockWorkshopDetail = (workshopId: string) =>
  performMockRequest<MockWorkshopDetail>("GET", `/workshops/${workshopId}`);

// Replace with a real GET /students/:mssv request later.
export const getMockStudentProfile = (mssv: string) =>
  performMockRequest<MockStudentProfile>("GET", `/students/${mssv}`);

// Replace with the real student profile update endpoint when backend supports it.
export const updateMockStudentProfile = (
  mssv: string,
  payload: MockProfileUpdatePayload,
) => performMockRequest<MockStudentProfile, MockProfileUpdatePayload>("PUT", `/students/${mssv}`, { body: payload });

// Replace with a real GET /registrations/me request later.
export const getMockRegistrations = (query?: {
  status?: RegistrationStatus;
  page?: number;
  pageSize?: number;
}) => performMockRequest<MockRegistration[]>("GET", "/registrations/me", { query });

// Replace with a real POST /registrations request later.
export const createMockRegistration = (payload: MockRegistrationPayload) =>
  performMockRequest<MockRegistration, MockRegistrationPayload>("POST", "/registrations", { body: payload });

// Replace with a real GET /registrations/:id/qr request later.
export const getMockRegistrationQr = (registrationId: string) =>
  performMockRequest<MockQrCodeResponse>("GET", `/registrations/${registrationId}/qr`);

// Replace with the real cancel-registration endpoint when backend supports it.
export const deleteMockRegistration = (registrationId: string) =>
  performMockRequest<{ id: string; status: "cancelled" }>("DELETE", `/registrations/${registrationId}`);

// Replace this helper with real auth HTTP calls later.
export const postMockAuth = <TBody extends Record<string, unknown>>(
  path: "/auth/sign-in/email" | "/auth/sign-up/email",
  payload: TBody,
) => performMockRequest<{ user: { email: string; role: string } }, TBody>("POST", path, { body: payload });
