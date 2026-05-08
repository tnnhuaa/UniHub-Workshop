import { useMemo } from "react";

const imgSpeaker =
  "https://www.figma.com/api/mcp/asset/2ee92fe2-f247-4654-8897-051b1d405acb";
const imgStatusAlmost =
  "https://www.figma.com/api/mcp/asset/068b2dc4-b19a-4317-930f-ffc7d9b5447c";
const imgCalendar =
  "https://www.figma.com/api/mcp/asset/75b30881-6a1c-44f8-b54d-75d7f509d330";
const imgInstructor =
  "https://www.figma.com/api/mcp/asset/f60f7648-b21b-4036-811f-973b9e258b60";
const imgLocation =
  "https://www.figma.com/api/mcp/asset/895e2868-0a2f-4ca4-b813-97d5b99c1a50";
const imgStatusOpen =
  "https://www.figma.com/api/mcp/asset/6a183687-7bba-4e74-b4d6-f96b16fa67fa";
const imgPlace =
  "https://www.figma.com/api/mcp/asset/39673742-a86c-46d7-9668-f8b8964fa9ae";
const imgStatusFull =
  "https://www.figma.com/api/mcp/asset/317c0c6d-c8ca-4533-8dc8-ae46cf857110";
const imgStatusCancelled =
  "https://www.figma.com/api/mcp/asset/12e0c9be-c44c-40cb-af1d-361c17ce4aba";

export type WorkshopBadgeTone = "success" | "warning" | "neutral" | "danger";

export type WorkshopCardVariant = "featured" | "standard";

export type WorkshopCardData = {
  id: string;
  variant: WorkshopCardVariant;
  className?: string;
  status: {
    label: string;
    tone: WorkshopBadgeTone;
    icon: string;
  };
  price: {
    label: string;
    highlight?: boolean;
  };
  title: string;
  description?: string;
  meta: Array<{
    icon: string;
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
          icon: imgStatusOpen,
        },
        price: {
          label: "Free",
        },
        title: "Advanced Academic Writing & Research",
        description:
          "Master the intricacies of composing high-impact academic papers, structuring arguments, and effectively navigating academic databases.",
        meta: [
          {
            icon: imgCalendar,
            label: "Oct 24 • 10:00 AM",
          },
          {
            icon: imgPlace,
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
          icon: imgStatusAlmost,
        },
        price: {
          label: "$15.00",
        },
        title: "Data Analysis with Python Basics",
        meta: [
          {
            icon: imgCalendar,
            label: "Oct 25 • 2:00 PM",
          },
          {
            icon: imgInstructor,
            label: "Prof. Michael Chang",
          },
          {
            icon: imgLocation,
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
          icon: imgStatusFull,
        },
        price: {
          label: "Free",
        },
        title: "Effective Time Management",
        meta: [
          {
            icon: imgCalendar,
            label: "Oct 26 • 11:00 AM",
          },
          {
            icon: imgInstructor,
            label: "Emma Richards",
          },
          {
            icon: imgLocation,
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
          icon: imgStatusCancelled,
        },
        price: {
          label: "Free",
        },
        title: "Public Speaking 101",
        meta: [
          {
            icon: imgCalendar,
            label: "Oct 28 • 3:30 PM",
          },
          {
            icon: imgInstructor,
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
          icon: imgStatusOpen,
        },
        price: {
          label: "$25.00",
          highlight: true,
        },
        title: "Introduction to Machine Learning Models",
        meta: [
          {
            icon: imgCalendar,
            label: "Nov 02 • 9:00 AM",
          },
          {
            icon: imgInstructor,
            label: "Dr. Elena Rostova",
          },
          {
            icon: imgLocation,
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
