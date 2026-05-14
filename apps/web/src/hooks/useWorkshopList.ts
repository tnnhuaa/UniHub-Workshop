import { useEffect, useMemo, useState } from 'react';
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
export type WorkshopAvailabilityFilter = 'all' | 'open' | 'almost-full';
export type WorkshopSortFilter = 'event-date' | 'newest';

export type WorkshopCardData = {
  id: string;
  variant: WorkshopCardVariant;
  className?: string;
  isNew?: boolean;
  isRegistered?: boolean;
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

const PAGE_SIZE = 9;

const filterByPrice = (
  workshops: WorkshopApiDto[],
  filters: WorkshopPriceFilter[],
) => {
  if (filters.length === 0 || filters.length === 2) {
    return workshops;
  }

  return workshops.filter((workshop) => {
    const numericPrice = Number(workshop.price);
    const priceType = numericPrice === 0 ? 'free' : 'paid';

    return filters.includes(priceType);
  });
};

const filterByAvailability = (
  workshops: WorkshopApiDto[],
  availability: WorkshopAvailabilityFilter,
) => {
  if (availability === 'all') {
    return workshops.filter((workshop) => {
      const remainingSeats = Math.max(
        workshop.capacity - workshop.registeredCount,
        0,
      );

      return workshop.status === 'published' && remainingSeats > 0;
    });
  }

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

const filterByDate = (
  workshops: WorkshopApiDto[],
  filter: WorkshopDateFilter,
) => {
  const now = new Date();

  return workshops.filter((workshop) => {
    const start = new Date(workshop.startTime);

    if (filter === 'this-week') {
      const end = new Date(now);
      end.setDate(now.getDate() + 7);
      return start >= now && start <= end;
    }

    if (filter === 'next-month') {
      const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        0,
        23,
        59,
        59,
        999,
      );
      return start >= startNextMonth && start <= endNextMonth;
    }

    return start >= now;
  });
};

const filterBySearch = (workshops: WorkshopApiDto[], searchTerm: string) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return workshops;
  }

  return workshops.filter((workshop) => {
    const haystacks = [
      workshop.title,
      workshop.description ?? '',
      workshop.speaker ?? '',
      workshop.room ?? '',
    ];

    return haystacks.some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );
  });
};

const sortWorkshops = (
  workshops: WorkshopApiDto[],
  sortBy: WorkshopSortFilter,
) => {
  const items = [...workshops];

  items.sort((left, right) => {
    if (sortBy === 'newest') {
      return (
        new Date(right.createdAt ?? right.startTime).getTime() -
        new Date(left.createdAt ?? left.startTime).getTime()
      );
    }

    return (
      new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
    );
  });

  return items;
};

const useWorkshopList = (registeredWorkshopIds: string[] = []) => {
  const [rawWorkshops, setRawWorkshops] = useState<WorkshopApiDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<WorkshopDateFilter>('upcoming');
  const [priceFilters, setPriceFilters] = useState<WorkshopPriceFilter[]>([
    'free',
    'paid',
  ]);
  const [availability, setAvailability] =
    useState<WorkshopAvailabilityFilter>('all');
  const [sortBy, setSortBy] = useState<WorkshopSortFilter>('event-date');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkshops = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchWorkshops({
      status: 'published' satisfies WorkshopStatus,
      page: 1,
      pageSize: 100,
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

  const filteredWorkshops = useMemo(
    () =>
      sortWorkshops(
        filterByAvailability(
          filterByPrice(
            filterByDate(filterBySearch(rawWorkshops, searchTerm), dateFilter),
            priceFilters,
          ),
          availability,
        ),
        sortBy,
      ),
    [availability, dateFilter, priceFilters, rawWorkshops, searchTerm, sortBy],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkshops.length / PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const newestWorkshopId = useMemo(() => {
    if (filteredWorkshops.length === 0) {
      return null;
    }

    return filteredWorkshops.reduce((latestWorkshop, workshop) => {
      const latestTimestamp = new Date(
        latestWorkshop.createdAt ?? latestWorkshop.startTime,
      ).getTime();
      const workshopTimestamp = new Date(
        workshop.createdAt ?? workshop.startTime,
      ).getTime();

      return workshopTimestamp > latestTimestamp ? workshop : latestWorkshop;
    }, filteredWorkshops[0]).id;
  }, [filteredWorkshops]);

  const paginatedWorkshops = useMemo(
    () =>
      filteredWorkshops
        .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        .map((workshop, index) =>
          mapWorkshopToCard(workshop, index, {
            isNew: workshop.id === newestWorkshopId,
            isRegistered: registeredWorkshopIds.includes(workshop.id),
          }),
        ),
    [currentPage, filteredWorkshops, newestWorkshopId, registeredWorkshopIds],
  );

  const togglePriceFilter = (price: WorkshopPriceFilter) => {
    setPriceFilters((current) => {
      if (current.includes(price)) {
        return current.filter((item) => item !== price);
      }

      return [...current, price];
    });
  };

  return {
    workshops: paginatedWorkshops,
    totalResults: filteredWorkshops.length,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setCurrentPage,
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
    sortBy,
    setSortBy,
    resetFilters: () => {
      setSearchTerm('');
      setDateFilter('upcoming');
      setPriceFilters(['free', 'paid']);
      setAvailability('all');
      setSortBy('event-date');
      setCurrentPage(1);
    },
  };
};

export default useWorkshopList;
