import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import type { WorkshopCardData } from '../hooks/useWorkshopList.ts';
import type {
  RegistrationApiDto,
  StudentApiDto,
  WorkshopApiDto,
  WorkshopStatus,
} from './unihubApi.ts';

export type WorkshopDetailViewModel = {
  id: string;
  title: string;
  description: string;
  category: string;
  summary: string;
  about: string;
  takeaways: string[];
  speaker: string;
  speakerTitle: string;
  speakerAvatar: string;
  room: string;
  locationLabel: string;
  floorMapImage: string;
  price: number;
  capacity: number;
  registeredCount: number;
  startTime: string;
  endTime: string;
  status: WorkshopStatus;
  coverImage: string;
};

export type UserProfileViewModel = {
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

export type ScheduleRegistrationViewModel = {
  id: string;
  workshopId: string;
  workshopTitle: string;
  speaker: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
  status: RegistrationApiDto['status'];
  registrationCode: string;
  qrCode: string | null;
  coverImage: string;
  instructorImage: string;
  instructorName: string;
  paymentStatus: RegistrationApiDto['paymentStatus'];
};

type WorkshopMetadata = {
  category: string;
  summary: string;
  about: string;
  takeaways: string[];
  locationLabel: string;
  speakerAvatar: string;
  speakerTitle: string;
  floorMapImage: string;
  coverImage: string;
};

const imageUrls = {
  speaker:
    'https://www.figma.com/api/mcp/asset/2ee92fe2-f247-4654-8897-051b1d405acb',
  reactSpeaker:
    'https://www.figma.com/api/mcp/asset/d068b264-bedc-481e-99ad-9b6f92676680',
  mapLocation:
    'https://www.figma.com/api/mcp/asset/2bdc588e-4301-40b3-8b99-53cbc5b02add',
  checkoutHeader:
    'https://www.figma.com/api/mcp/asset/1b8cc43f-4e00-42b2-9a62-ff2bb6e5389a',
  designWorkshop:
    'https://www.figma.com/api/mcp/asset/0847573c-09b5-4b5f-99f0-8cc62fb92523',
  strategyWorkshop:
    'https://www.figma.com/api/mcp/asset/9b0e9b49-856f-47e4-9ac5-2de62892ba6e',
  profileAvatar:
    'https://www.figma.com/api/mcp/asset/8b5490f6-451d-4c0e-b17e-9b43a0619761',
  instructor:
    'https://www.figma.com/api/mcp/asset/2b82168d-29d3-4c5e-9069-76b377aabbc7',
  qrCode:
    'https://www.figma.com/api/mcp/asset/5c679e98-021a-4ac3-a67b-e57df7f69bfb',
};

const workshopMetadataById: Record<string, WorkshopMetadata> = {
  '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01': {
    category: 'Design',
    summary:
      'Learn the product design workflow from problem framing to prototyping with practical examples.',
    about:
      'This workshop covers the full design loop for student teams, including discovery, sketching, user flows, and design handoff.',
    takeaways: [
      'Problem framing and user needs',
      'Low-fidelity to high-fidelity prototyping',
      'Reviewing design handoff checklists',
      'Improving critique and iteration habits',
    ],
    locationLabel: 'North Campus, Studio A',
    speakerAvatar: imageUrls.speaker,
    speakerTitle: 'Product Designer',
    floorMapImage: imageUrls.mapLocation,
    coverImage: imageUrls.designWorkshop,
  },
  '2b22c9a4-7a6c-4b04-a1c2-3f9efb8a1142': {
    category: 'Career & AI',
    summary:
      'Use practical AI workflows to improve job search materials, interview prep, and personal planning.',
    about:
      'The session blends productivity tools and AI-assisted workflows to help students work smarter during job search season.',
    takeaways: [
      'Prompting patterns for job search tasks',
      'Building a personal portfolio workflow',
      'Using AI for interview preparation',
      'Recognizing limitations and risks',
    ],
    locationLabel: 'Innovation Hub, Room 205',
    speakerAvatar: imageUrls.reactSpeaker,
    speakerTitle: 'Career Technology Mentor',
    floorMapImage: imageUrls.mapLocation,
    coverImage: imageUrls.checkoutHeader,
  },
  '6a70d2d5-0f3c-4c5a-b0f2-7c79c9a3a8e8': {
    category: 'Finance',
    summary:
      'Understand runway, cash flow, and the financial basics every student founder should know.',
    about:
      'This session is a practical introduction to budgeting and financing for student projects and early-stage startups.',
    takeaways: [
      'Reading a basic cash flow statement',
      'Estimating runway and burn rate',
      'Funding sources for student teams',
      'Avoiding common finance mistakes',
    ],
    locationLabel: 'Business Hall C',
    speakerAvatar: imageUrls.speaker,
    speakerTitle: 'Finance Lecturer',
    floorMapImage: imageUrls.mapLocation,
    coverImage: imageUrls.strategyWorkshop,
  },
  '7bf4b5fd-f0b8-4d8f-9dc9-79d0cb7bd601': {
    category: 'Operations',
    summary:
      'An internal planning session for organizers covering event sequencing and execution checklists.',
    about:
      'This workshop is kept in the dataset to support admin flows and draft workshop handling.',
    takeaways: [
      'Session sequencing',
      'Room and staffing coordination',
      'Operational checklists',
      'Admin-only lifecycle management',
    ],
    locationLabel: 'Operations Room',
    speakerAvatar: imageUrls.instructor,
    speakerTitle: 'Operations Team',
    floorMapImage: imageUrls.mapLocation,
    coverImage: imageUrls.strategyWorkshop,
  },
  'c25795a3-32a5-4fe7-8a8d-64d3f75d3d02': {
    category: 'Security',
    summary:
      'Cancelled session kept for status handling and archived workshop views.',
    about:
      'The workshop remains visible in backend data to exercise cancelled-state rendering without exposing registration actions.',
    takeaways: [
      'Cancelled status handling',
      'Archived detail view rendering',
      'Safe fallback UI states',
      'No registration actions',
    ],
    locationLabel: 'Engineering Hall E',
    speakerAvatar: imageUrls.speaker,
    speakerTitle: 'Security Instructor',
    floorMapImage: imageUrls.mapLocation,
    coverImage: imageUrls.designWorkshop,
  },
};

const getWorkshopMetadata = (workshopId: string) =>
  workshopMetadataById[workshopId] ?? {
    category: 'Workshop',
    summary: 'Workshop details provided by the backend.',
    about: 'Additional description is not available for this workshop.',
    takeaways: [],
    locationLabel: 'TBD',
    speakerAvatar: imageUrls.speaker,
    speakerTitle: 'Guest Speaker',
    floorMapImage: imageUrls.mapLocation,
    coverImage: imageUrls.checkoutHeader,
  };

const toNumber = (value: string | number) => Number(value);

const getRemainingSeats = (
  workshop: Pick<WorkshopApiDto, 'capacity' | 'registeredCount'>,
) => Math.max(workshop.capacity - workshop.registeredCount, 0);

const getStatusMeta = (
  workshop: WorkshopApiDto,
): WorkshopCardData['status'] => {
  const remainingSeats = getRemainingSeats(workshop);

  if (workshop.status === 'cancelled') {
    return {
      label: 'Cancelled',
      tone: 'danger',
      icon: XCircle,
    };
  }

  if (remainingSeats === 0) {
    return {
      label: 'Full',
      tone: 'neutral',
      icon: Users,
    };
  }

  if (remainingSeats <= 2) {
    return {
      label: 'Almost Full',
      tone: 'warning',
      icon: AlertTriangle,
    };
  }

  return {
    label: 'Open',
    tone: 'success',
    icon: CheckCircle2,
  };
};

export const mapWorkshopToCard = (
  workshop: WorkshopApiDto,
  _index: number,
  options?: {
    isNew?: boolean;
    isRegistered?: boolean;
  },
): WorkshopCardData => {
  const metadata = getWorkshopMetadata(workshop.id);
  const remainingSeats = getRemainingSeats(workshop);
  const isRegistered = options?.isRegistered ?? false;
  const classNames = [workshop.status === 'cancelled' ? 'cancelled' : '']
    .filter(Boolean)
    .join(' ');

  return {
    id: workshop.id,
    variant: 'standard',
    className: classNames || undefined,
    isNew: options?.isNew ?? false,
    isRegistered,
    status: getStatusMeta(workshop),
    price: {
      label:
        toNumber(workshop.price) === 0
          ? 'Free'
          : `$${toNumber(workshop.price).toFixed(2)}`,
      highlight: toNumber(workshop.price) > 0,
    },
    title: workshop.title,
    description: workshop.description ?? metadata.summary,
    meta: [
      {
        icon: Calendar,
        label: new Date(workshop.startTime).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
      {
        icon: User,
        label: workshop.speaker ?? metadata.speakerTitle,
      },
    ],
    speaker: undefined,
    seats:
      workshop.status === 'cancelled'
        ? {
            label: 'Session Cancelled',
            tone: 'danger',
          }
        : {
            label:
              remainingSeats === 0
                ? '0 seats left'
                : remainingSeats <= 2
                  ? `Only ${remainingSeats} seats left`
                  : `${remainingSeats} seats left`,
            tone:
              remainingSeats === 0
                ? 'neutral'
                : remainingSeats <= 2
                  ? 'warning'
                  : 'success',
          },
    action: isRegistered
      ? {
          label: 'Registered',
          variant: 'ghost-muted',
          disabled: true,
        }
      : workshop.status === 'cancelled'
        ? {
            label: 'Unavailable',
            variant: 'ghost-muted',
            disabled: true,
          }
        : remainingSeats === 0
          ? {
              label: 'Join Waitlist',
              variant: 'ghost',
            }
          : {
              label: 'Register',
              variant: 'primary',
            },
    strikeTitle: workshop.status === 'cancelled',
    metaFaded: workshop.status === 'cancelled',
  };
};

export const mapWorkshopToDetailViewModel = (
  workshop: WorkshopApiDto,
): WorkshopDetailViewModel => {
  const metadata = getWorkshopMetadata(workshop.id);

  return {
    id: workshop.id,
    title: workshop.title,
    description: workshop.description ?? '',
    category: metadata.category,
    summary: metadata.summary,
    about: metadata.about,
    takeaways: metadata.takeaways,
    speaker: workshop.speaker ?? 'Guest Speaker',
    speakerTitle: metadata.speakerTitle,
    speakerAvatar: metadata.speakerAvatar,
    room: workshop.room ?? 'TBD',
    locationLabel: metadata.locationLabel,
    floorMapImage: workshop.floorMapUrl ?? metadata.floorMapImage,
    price: toNumber(workshop.price),
    capacity: workshop.capacity,
    registeredCount: workshop.registeredCount,
    startTime: workshop.startTime,
    endTime: workshop.endTime,
    status: workshop.status,
    coverImage: metadata.coverImage,
  };
};

export const mapStudentToProfileViewModel = (
  student: StudentApiDto,
): UserProfileViewModel => {
  const defaultBio = `${student.faculty ?? 'Student'} student in ${student.className ?? 'the current cohort'}.`;

  return {
    mssv: student.mssv,
    fullName: student.fullName ?? student.mssv,
    email: student.email ?? '',
    phone: student.phone ?? '',
    bio: defaultBio,
    major: student.faculty ?? '',
    year: student.className ?? '',
    avatar: imageUrls.profileAvatar,
    verified: student.status === 'active',
  };
};

export const mapRegistrationToScheduleViewModel = (
  registration: RegistrationApiDto,
  workshop: WorkshopApiDto,
): ScheduleRegistrationViewModel => {
  const metadata = getWorkshopMetadata(workshop.id);
  const startDate = new Date(workshop.startTime);
  const endDate = new Date(workshop.endTime);
  const dateLabel = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const timeLabel = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  return {
    id: registration.id,
    workshopId: registration.workshopId,
    workshopTitle: workshop.title,
    speaker: workshop.speaker ?? metadata.speakerTitle,
    location: workshop.room ?? metadata.locationLabel,
    dateLabel,
    timeLabel,
    priceLabel:
      toNumber(workshop.price) === 0
        ? 'Free'
        : `$${toNumber(workshop.price).toFixed(2)}`,
    status: registration.status,
    registrationCode: registration.id.slice(0, 8).toUpperCase(),
    qrCode: registration.qrCode ?? null,
    coverImage: metadata.coverImage,
    instructorImage: metadata.speakerAvatar,
    instructorName: workshop.speaker ?? metadata.speakerTitle,
    paymentStatus: registration.paymentStatus,
  };
};

export const getQrImageSource = (qrCode: string | null) => {
  if (!qrCode) {
    return imageUrls.qrCode;
  }

  if (qrCode.startsWith('http://') || qrCode.startsWith('https://')) {
    return qrCode;
  }

  return `https://public-api.qr-code-generator.com/v1/create/extended?image_format=PNG&image_width=300&qr_code_text=${encodeURIComponent(qrCode)}&foreground_color=%23000000&background_color=%23FFFFFF&frame_name=no-frame`;
};
