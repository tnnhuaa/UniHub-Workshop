import { useEffect, useState } from 'react';
import { Check, LayoutGrid, List, Search } from 'lucide-react';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import WorkshopCard from '../components/WorkshopCard.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import useWorkshopList, {
  type WorkshopAvailabilityFilter,
  type WorkshopDateFilter,
  type WorkshopPriceFilter,
  type WorkshopSortFilter,
} from '../hooks/useWorkshopList.ts';
import { fetchMyRegistrations } from '../lib/unihubApi.ts';

const imgStudentProfile = '/figma-mcp/065a2bff-6d30-4eb7-9d26-b63b86059f0d.jpg';

const WorkshopList = () => {
  const session = useStudentSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [registeredWorkshopIds, setRegisteredWorkshopIds] = useState<string[]>(
    [],
  );
  const {
    workshops,
    totalResults,
    currentPage,
    totalPages,
    pageSize,
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
    resetFilters,
  } = useWorkshopList(registeredWorkshopIds);

  useEffect(() => {
    const loadRegisteredWorkshops = async () => {
      if (!session.isAuthenticated) {
        setRegisteredWorkshopIds([]);
        return;
      }

      const result = await fetchMyRegistrations({ page: 1, pageSize: 100 });

      if (!result.ok) {
        return;
      }

      const ids = Array.from(
        new Set(
          result.data
            .filter(
              (registration) =>
                registration.status !== 'cancelled' &&
                registration.status !== 'expired',
            )
            .map((registration) => registration.workshopId),
        ),
      );

      setRegisteredWorkshopIds(ids);
    };

    void loadRegisteredWorkshops();
  }, [session.isAuthenticated]);

  const dateOptions: Array<{ value: WorkshopDateFilter; label: string }> = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-month', label: 'Next Month' },
  ];

  const priceOptions: Array<{ value: WorkshopPriceFilter; label: string }> = [
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ];

  const availabilityOptions: Array<{
    value: WorkshopAvailabilityFilter;
    label: string;
  }> = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'almost-full', label: 'Almost Full' },
  ];

  if (isLoading) {
    return (
      <div className="workshop-list-page">
        <WorkshopHeader
          activeTab="workshops"
          profileImage={imgStudentProfile}
          profileLink="/profile"
        />
        <main className="workshop-layout">
          <LoadingSpinner label="Loading workshops..." />
        </main>
      </div>
    );
  }
  const sortOptions: Array<{ value: WorkshopSortFilter; label: string }> = [
    { value: 'event-date', label: 'Event Date' },
    { value: 'newest', label: 'Newest' },
  ];

  return (
    <div className="workshop-list-page">
      <WorkshopHeader
        activeTab="workshops"
        profileImage={session.student?.avatar ?? imgStudentProfile}
        profileLink={session.isAuthenticated ? '/profile' : undefined}
      />

      <main className="workshop-layout">
        <aside className="workshop-filters" aria-label="Filters">
          <h2>Filters</h2>
          <div className="filter-group">
            <span className="filter-label">Date</span>
            <div className="filter-options">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-option${
                    dateFilter === option.value ? ' selected' : ''
                  }`}
                  onClick={() => setDateFilter(option.value)}
                >
                  <span className="selection-dot">
                    {dateFilter === option.value ? (
                      <Check className="icon icon-xs" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Price</span>
            <div className="filter-options">
              {priceOptions.map((option) => {
                const isSelected = priceFilters.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`filter-option square${
                      isSelected ? ' selected' : ''
                    }`}
                    onClick={() => togglePriceFilter(option.value)}
                  >
                    <span className="selection-square">
                      {isSelected ? (
                        <Check className="icon icon-xs" aria-hidden="true" />
                      ) : null}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Availability</span>
            <div className="filter-pill-group">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-pill${
                    availability === option.value ? ' active' : ''
                  }`}
                  onClick={() => setAvailability(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Sort By</span>
            <div className="filter-options">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-option${
                    sortBy === option.value ? ' selected' : ''
                  }`}
                  onClick={() => setSortBy(option.value)}
                >
                  <span className="selection-dot">
                    {sortBy === option.value ? (
                      <Check className="icon icon-xs" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </aside>

        <section className="workshop-grid-section">
          <div className="workshop-grid-header">
            <div>
              <h1>Explore Workshops</h1>
              <p>Discover sessions to enhance your academic journey.</p>
            </div>
            <label className="workshop-search" htmlFor="workshop-search-input">
              <Search className="icon icon-sm" aria-hidden="true" />
              <input
                id="workshop-search-input"
                type="search"
                placeholder="Search workshops..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>
            <div className="view-toggle" role="group" aria-label="View toggle">
              <button
                type="button"
                className={`toggle-button${
                  viewMode === 'grid' ? ' active' : ''
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="icon icon-sm" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`toggle-button${
                  viewMode === 'list' ? ' active' : ''
                }`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <List className="icon icon-sm" aria-hidden="true" />
              </button>
            </div>
          </div>

          {error ? <p className="helper-text">{error}</p> : null}
          {isLoading ? (
            <div className="workshop-state-panel">
              <LoadingSpinner label="Loading workshops..." />
            </div>
          ) : (
            <>
              <div
                className={`workshop-grid${
                  viewMode === 'list' ? ' workshop-grid-list' : ''
                }`}
              >
                {workshops.map((workshop) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} />
                ))}
              </div>
              {!error && workshops.length === 0 ? (
                <div className="workshop-state-panel">
                  <p className="helper-text">
                    No workshops match your current search and filters.
                  </p>
                </div>
              ) : null}
            </>
          )}

          {!error && !isLoading ? (
            <div className="workshop-results-footer">
              <div className="workshop-results-bar">
                <p>
                  Showing{' '}
                  <strong>
                    {workshops.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                  </strong>{' '}
                  -{' '}
                  <strong>
                    {(currentPage - 1) * pageSize + workshops.length}
                  </strong>{' '}
                  of <strong>{totalResults}</strong> workshops
                </p>
              </div>
              {totalPages > 1 ? (
                <nav
                  className="workshop-pagination"
                  aria-label="Workshop pages"
                >
                  <button
                    type="button"
                    className="pagination-button"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        type="button"
                        className={`pagination-button${
                          currentPage === page ? ' active' : ''
                        }`}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="pagination-button"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default WorkshopList;
