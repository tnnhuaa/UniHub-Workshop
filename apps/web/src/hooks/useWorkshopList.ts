import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { mapWorkshopToCard } from '../lib/unihubAdapters.ts';
import {
  fetchWorkshops,
  type WorkshopApiDto,
  type WorkshopStatus,
} from '../lib/unihubApi.ts';

type IconType = ComponentType<{ className?: string }>;

export type WorkshopBadgeTone = 'success' | 'warning' | 'neutral' | 'danger';
export type WorkshopCardVariant = 'featured' | 'standard';
export type WorkshopDateFilter = 'upcoming' | 'this-week' | 'next-month';
export type WorkshopPriceFilter = 'free' | 'paid';
export type WorkshopAvailabilityFilter = 'open' | 'almost-full';

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
    variant: 'primary' | 'ghost' | 'ghost-muted';
    disabled?: boolean;
  };
  strikeTitle?: boolean;
  metaFaded?: boolean;
};

const getDateRange = (filter: WorkshopDateFilter) => {
  const now = new Date();
  const start = now.toISOString();

  if (filter === 'this-week') {
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return { startFrom: start, startTo: end.toISOString() };
  }

  if (filter === 'next-month') {
    const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      startFrom: startNextMonth.toISOString(),
      startTo: endNextMonth.toISOString(),
    };
  }

  return { startFrom: start, startTo: undefined };
};

const filterByPrice = (
  workshops: WorkshopApiDto[],
  filters: WorkshopPriceFilter[],
) => {
  if (filters.length === 0 || filters.length === 2) {
    return workshops;
  }

  return workshops.filter((workshop) =>
    filters.includes(workshop.price === 0 ? 'free' : 'paid'),
  );
};

const filterByAvailability = (
  workshops: WorkshopApiDto[],
  availability: WorkshopAvailabilityFilter,
) => {
  return workshops.filter((workshop) => {
    const remainingSeats = Math.max(
      workshop.capacity - workshop.registeredCount,
      0,
    );

    if (availability === 'almost-full') {
      return remainingSeats > 0 && remainingSeats <= 2;
    }

    return workshop.status === 'published' && remainingSeats > 2;
  });
};

const useWorkshopList = () => {
  const [rawWorkshops, setRawWorkshops] = useState<WorkshopApiDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<WorkshopDateFilter>('upcoming');
  const [priceFilters, setPriceFilters] = useState<WorkshopPriceFilter[]>([
    'free',
    'paid',
  ]);
  const [availability, setAvailability] =
    useState<WorkshopAvailabilityFilter>('open');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkshops = async () => {
    setIsLoading(true);
    setError(null);

    const dateRange = getDateRange(dateFilter);
    const result = await fetchWorkshops({
      q: searchTerm.trim() || undefined,
      status: 'published' satisfies WorkshopStatus,
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
  };

  useEffect(() => {
    void loadWorkshops();
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
    applyFilters: () => loadWorkshops(),
  };
};

export default useWorkshopList;
