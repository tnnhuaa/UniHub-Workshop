import { useEffect, useState } from "react";
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
import {
  formatMockRequestAlert,
  getMockWorkshops,
  type MockWorkshopSummary,
  type WorkshopStatus,
} from "../lib/mockApi.ts";

type IconType = ComponentType<{ className?: string }>;

export type WorkshopBadgeTone = "success" | "warning" | "neutral" | "danger";
export type WorkshopCardVariant = "featured" | "standard";
export type WorkshopDateFilter = "upcoming" | "this-week" | "next-month";
export type WorkshopPriceFilter = "free" | "paid";
export type WorkshopAvailabilityFilter = "open" | "almost-full";

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

const getDateRange = (filter: WorkshopDateFilter) => {
  const now = new Date();
  const start = now.toISOString();

  if (filter === "this-week") {
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return { startFrom: start, startTo: end.toISOString() };
  }

  if (filter === "next-month") {
    const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      startFrom: startNextMonth.toISOString(),
      startTo: endNextMonth.toISOString(),
    };
  }

  return { startFrom: start, startTo: undefined };
};

const getWorkshopStatusMeta = (
  workshop: MockWorkshopSummary,
): WorkshopCardData["status"] => {
  const remainingSeats = Math.max(workshop.capacity - workshop.registeredCount, 0);

  if (workshop.status === "cancelled") {
    return {
      label: "Cancelled",
      tone: "danger",
      icon: XCircle,
    };
  }

  if (remainingSeats === 0) {
    return {
      label: "Full",
      tone: "neutral",
      icon: Users,
    };
  }

  if (remainingSeats <= 2) {
    return {
      label: "Almost Full",
      tone: "warning",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Open",
    tone: "success",
    icon: CheckCircle2,
  };
};

const mapWorkshopToCard = (
  workshop: MockWorkshopSummary,
  index: number,
): WorkshopCardData => {
  const remainingSeats = Math.max(workshop.capacity - workshop.registeredCount, 0);
  const status = getWorkshopStatusMeta(workshop);
  const isFeatured = index === 0;

  const defaultAction =
    workshop.status === "cancelled"
      ? {
          label: "Unavailable",
          variant: "ghost-muted" as const,
          disabled: true,
        }
      : remainingSeats === 0
        ? {
            label: "Join Waitlist",
            variant: "ghost" as const,
          }
        : {
            label: isFeatured ? "Register Now" : "Register",
            variant: "primary" as const,
          };

  return {
    id: workshop.id,
    variant: isFeatured ? "featured" : "standard",
    className: workshop.status === "cancelled" ? "cancelled" : undefined,
    status,
    price: {
      label: workshop.price === 0 ? "Free" : `$${workshop.price.toFixed(2)}`,
      highlight: workshop.price > 0,
    },
    title: workshop.title,
    description: isFeatured ? workshop.description : undefined,
    meta: [
      {
        icon: Calendar,
        label: new Date(workshop.startTime).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
        }),
      },
      {
        icon: isFeatured ? MapPin : User,
        label: isFeatured ? workshop.room : workshop.speaker,
      },
      ...(isFeatured
        ? []
        : [
            {
              icon: MapPin,
              label: workshop.room,
            },
          ]),
    ],
    speaker: isFeatured
      ? {
          name: workshop.speaker,
          title: workshop.speakerTitle,
          avatar: workshop.speakerAvatar,
        }
      : undefined,
    seats:
      workshop.status === "cancelled"
        ? {
            label: "Session Cancelled",
            tone: "danger",
          }
        : isFeatured
          ? {
              label: `${remainingSeats} seats left`,
              tone: remainingSeats <= 2 ? "warning" : "success",
              progress:
                workshop.capacity === 0
                  ? 0
                  : Math.round((workshop.registeredCount / workshop.capacity) * 100),
            }
          : {
              label:
                remainingSeats === 0
                  ? "0 seats left"
                  : remainingSeats <= 2
                    ? `Only ${remainingSeats} seats left`
                    : `${remainingSeats} seats left`,
              tone:
                remainingSeats === 0
                  ? "neutral"
                  : remainingSeats <= 2
                    ? "warning"
                    : "success",
            },
    action: defaultAction,
    strikeTitle: workshop.status === "cancelled",
    metaFaded: workshop.status === "cancelled",
  };
};

const filterByPrice = (
  workshops: MockWorkshopSummary[],
  filters: WorkshopPriceFilter[],
) => {
  if (filters.length === 0 || filters.length === 2) {
    return workshops;
  }

  return workshops.filter((workshop) =>
    filters.includes(workshop.price === 0 ? "free" : "paid"),
  );
};

const filterByAvailability = (
  workshops: MockWorkshopSummary[],
  availability: WorkshopAvailabilityFilter,
) => {
  return workshops.filter((workshop) => {
    const remainingSeats = Math.max(workshop.capacity - workshop.registeredCount, 0);

    if (availability === "almost-full") {
      return remainingSeats > 0 && remainingSeats <= 2;
    }

    return workshop.status === "published" && remainingSeats > 2;
  });
};

const useWorkshopList = () => {
  const [rawWorkshops, setRawWorkshops] = useState<MockWorkshopSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<WorkshopDateFilter>("upcoming");
  const [priceFilters, setPriceFilters] = useState<WorkshopPriceFilter[]>([
    "free",
    "paid",
  ]);
  const [availability, setAvailability] =
    useState<WorkshopAvailabilityFilter>("open");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkshops = async (showAlert = false) => {
    setIsLoading(true);
    setError(null);

    const dateRange = getDateRange(dateFilter);
    const result = await getMockWorkshops({
      q: searchTerm.trim() || undefined,
      status: "published" satisfies WorkshopStatus,
      startFrom: dateRange.startFrom,
      startTo: dateRange.startTo,
      page: 1,
      pageSize: 20,
    });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setRawWorkshops(result.data);

    if (showAlert) {
      window.alert(formatMockRequestAlert(result.request));
    }
  };

  useEffect(() => {
    void loadWorkshops(false);
  }, []);

  const workshops = filterByAvailability(
    filterByPrice(rawWorkshops, priceFilters),
    availability,
  ).map((workshop, index) => mapWorkshopToCard(workshop, index));

  const togglePriceFilter = (price: WorkshopPriceFilter) => {
    setPriceFilters((current) => {
      if (current.includes(price)) {
        return current.filter((item) => item !== price);
      }

      return [...current, price];
    });
  };

  return {
    workshops,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    priceFilters,
    togglePriceFilter,
    availability,
    setAvailability,
    applyFilters: () => loadWorkshops(true),
  };
};

export default useWorkshopList;
