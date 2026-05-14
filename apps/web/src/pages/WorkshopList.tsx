import { Check, LayoutGrid, List, Search } from 'lucide-react';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import WorkshopCard from '../components/WorkshopCard.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import useWorkshopList, {
  type WorkshopAvailabilityFilter,
  type WorkshopDateFilter,
  type WorkshopPriceFilter,
} from '../hooks/useWorkshopList.ts';

const imgStudentProfile =
  'https://www.figma.com/api/mcp/asset/065a2bff-6d30-4eb7-9d26-b63b86059f0d';

const WorkshopList = () => {
  const session = useStudentSession();
  const {
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
    applyFilters,
  } = useWorkshopList();

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
    { value: 'open', label: 'Open' },
    { value: 'almost-full', label: 'Almost Full' },
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
          <button
            type="button"
            className="primary-button"
            onClick={applyFilters}
          >
            Apply Filters
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
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <div className="view-toggle" role="group" aria-label="View toggle">
              <button
                type="button"
                className="toggle-button active"
                aria-label="Grid view"
              >
                <LayoutGrid className="icon icon-sm" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="toggle-button"
                aria-label="List view"
              >
                <List className="icon icon-sm" aria-hidden="true" />
              </button>
            </div>
          </div>

          {error ? <p className="helper-text">{error}</p> : null}
          {isLoading ? (
            <p className="helper-text">Loading workshops...</p>
          ) : null}

          <div className="workshop-grid">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkshopList;
