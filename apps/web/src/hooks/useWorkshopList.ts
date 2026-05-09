import { useMemo } from "react";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MapPin,
  User,
  Users,
  XCircle,
} from "lucide-react";

const imgSpeaker =
  "https://www.figma.com/api/mcp/asset/2ee92fe2-f247-4654-8897-051b1d405acb";

type IconType = ComponentType<{ className?: string }>;

export type WorkshopBadgeTone = "success" | "warning" | "neutral" | "danger";

export type WorkshopCardVariant = "featured" | "standard";

export type WorkshopCardData = {
  id: string;
  variant: WorkshopCardVariant;
  className?: string;
  status: {
    label: string;
    tone: WorkshopBadgeTone;
    icon: IconType;
  };
  price: {
    label: string;
    highlight?: boolean;
  };
  title: string;
  description?: string;
  meta: Array<{
    icon: IconType;
    label: string;
  }>;
  speaker?: {
    name: string;
    title: string;
    avatar: string;
  };
  seats?: {
    label: string;
    tone?: WorkshopBadgeTone;
    progress?: number;
  };
  action: {
    label: string;
    variant: "primary" | "ghost" | "ghost-muted";
    disabled?: boolean;
  };
  strikeTitle?: boolean;
  metaFaded?: boolean;
};

const useWorkshopList = () => {
  const workshops = useMemo<WorkshopCardData[]>(
    () => [
      {
        id: "featured",
        variant: "featured",
        status: {
          label: "Open",
          tone: "success",
          icon: CheckCircle2,
        },
        price: {
          label: "Free",
        },
        title: "Advanced Academic Writing & Research",
        description:
          "Master the intricacies of composing high-impact academic papers, structuring arguments, and effectively navigating academic databases.",
        meta: [
          {
            icon: Calendar,
            label: "Oct 24 • 10:00 AM",
          },
          {
            icon: MapPin,
            label: "Library, Room 4B",
          },
        ],
        speaker: {
          name: "Dr. Sarah Jenkins",
          title: "Writing Center Director",
          avatar: imgSpeaker,
        },
        seats: {
          label: "12 seats left",
          tone: "success",
          progress: 70,
        },
        action: {
          label: "Register Now",
          variant: "primary",
        },
      },
      {
        id: "almost-full",
        variant: "standard",
        status: {
          label: "Almost Full",
          tone: "warning",
          icon: AlertTriangle,
        },
        price: {
          label: "$15.00",
        },
        title: "Data Analysis with Python Basics",
        meta: [
          {
            icon: Calendar,
            label: "Oct 25 • 2:00 PM",
          },
          {
            icon: User,
            label: "Prof. Michael Chang",
          },
          {
            icon: MapPin,
            label: "Tech Hub, Lab 2",
          },
        ],
        seats: {
          label: "Only 2 seats left",
          tone: "warning",
        },
        action: {
          label: "Register",
          variant: "primary",
        },
      },
      {
        id: "full",
        variant: "standard",
        className: "muted",
        status: {
          label: "Full",
          tone: "neutral",
          icon: Users,
        },
        price: {
          label: "Free",
        },
        title: "Effective Time Management",
        meta: [
          {
            icon: Calendar,
            label: "Oct 26 • 11:00 AM",
          },
          {
            icon: User,
            label: "Emma Richards",
          },
          {
            icon: MapPin,
            label: "Student Center, Rm 101",
          },
        ],
        seats: {
          label: "0 seats left",
        },
        action: {
          label: "Join Waitlist",
          variant: "ghost",
        },
      },
      {
        id: "cancelled",
        variant: "standard",
        className: "cancelled",
        status: {
          label: "Cancelled",
          tone: "danger",
          icon: XCircle,
        },
        price: {
          label: "Free",
        },
        title: "Public Speaking 101",
        meta: [
          {
            icon: Calendar,
            label: "Oct 28 • 3:30 PM",
          },
          {
            icon: User,
            label: "Dr. Alan Grant",
          },
        ],
        seats: {
          label: "Session Cancelled",
          tone: "danger",
        },
        action: {
          label: "Unavailable",
          variant: "ghost-muted",
          disabled: true,
        },
        strikeTitle: true,
        metaFaded: true,
      },
      {
        id: "open-paid",
        variant: "standard",
        status: {
          label: "Open",
          tone: "success",
          icon: CheckCircle2,
        },
        price: {
          label: "$25.00",
          highlight: true,
        },
        title: "Introduction to Machine Learning Models",
        meta: [
          {
            icon: Calendar,
            label: "Nov 02 • 9:00 AM",
          },
          {
            icon: User,
            label: "Dr. Elena Rostova",
          },
          {
            icon: MapPin,
            label: "Engineering Bldg, Hall A",
          },
        ],
        seats: {
          label: "45 seats left",
          tone: "success",
        },
        action: {
          label: "Register",
          variant: "primary",
        },
      },
    ],
    [],
  );

  return {
    workshops,
    isLoading: false,
    error: null,
  };
};

export default useWorkshopList;
