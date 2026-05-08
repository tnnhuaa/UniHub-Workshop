const imgStudentProfile =
  "https://www.figma.com/api/mcp/asset/065a2bff-6d30-4eb7-9d26-b63b86059f0d";
const imgSpeaker =
  "https://www.figma.com/api/mcp/asset/2ee92fe2-f247-4654-8897-051b1d405acb";
const imgSearchIcon =
  "https://www.figma.com/api/mcp/asset/1238d665-e630-4675-87ba-9353ba6dd352";
const imgBell =
  "https://www.figma.com/api/mcp/asset/04d716d3-ee1e-4049-9217-913bf2d57bb1";
const imgRadioSelected =
  "https://www.figma.com/api/mcp/asset/30461be2-71d7-4b94-83c0-8225e41a59bb";
const imgCheckboxSelected =
  "https://www.figma.com/api/mcp/asset/19811603-035a-423f-82ac-28e6e0662c77";
const imgToggleGrid =
  "https://www.figma.com/api/mcp/asset/f06e85c7-6aa8-48aa-aa79-e2755a94b67f";
const imgToggleList =
  "https://www.figma.com/api/mcp/asset/f03f15f8-92d8-4fad-88c7-0d2545933476";
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

const WorkshopList = () => {
  return (
    <div className="workshop-list-page">
      <header className="workshop-topbar">
        <div className="workshop-topbar-left">
          <div className="workshop-brand">UniHub</div>
          <label className="workshop-search" htmlFor="workshop-search-input">
            <img src={imgSearchIcon} alt="" aria-hidden="true" />
            <input
              id="workshop-search-input"
              type="search"
              placeholder="Search workshops..."
            />
          </label>
        </div>
        <nav className="workshop-topbar-nav" aria-label="Workshop navigation">
          <a className="active" href="/workshops">
            Workshops
          </a>
          <a href="/">My Schedule</a>
        </nav>
        <div className="workshop-topbar-actions">
          <button type="button" className="icon-button" aria-label="Alerts">
            <img src={imgBell} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="avatar-button" aria-label="Profile">
            <img src={imgStudentProfile} alt="Student profile" />
          </button>
        </div>
      </header>

      <main className="workshop-layout">
        <aside className="workshop-filters" aria-label="Filters">
          <h2>Filters</h2>
          <div className="filter-group">
            <span className="filter-label">Date</span>
            <div className="filter-options">
              <label className="filter-option selected">
                <span className="selection-dot">
                  <img src={imgRadioSelected} alt="" aria-hidden="true" />
                </span>
                <span>Upcoming</span>
              </label>
              <label className="filter-option">
                <span className="selection-dot" />
                <span>This Week</span>
              </label>
              <label className="filter-option">
                <span className="selection-dot" />
                <span>Next Month</span>
              </label>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Price</span>
            <div className="filter-options">
              <label className="filter-option selected square">
                <span className="selection-square">
                  <img src={imgCheckboxSelected} alt="" aria-hidden="true" />
                </span>
                <span>Free</span>
              </label>
              <label className="filter-option selected square">
                <span className="selection-square">
                  <img src={imgCheckboxSelected} alt="" aria-hidden="true" />
                </span>
                <span>Paid</span>
              </label>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Availability</span>
            <div className="filter-pill-group">
              <button type="button" className="filter-pill active">
                Open
              </button>
              <button type="button" className="filter-pill">
                Almost Full
              </button>
            </div>
          </div>
        </aside>

        <section className="workshop-grid-section">
          <div className="workshop-grid-header">
            <div>
              <h1>Explore Workshops</h1>
              <p>Discover sessions to enhance your academic journey.</p>
            </div>
            <div className="view-toggle" role="group" aria-label="View toggle">
              <button type="button" className="toggle-button active">
                <img src={imgToggleGrid} alt="Grid view" />
              </button>
              <button type="button" className="toggle-button">
                <img src={imgToggleList} alt="List view" />
              </button>
            </div>
          </div>

          <div className="workshop-grid">
            <article className="workshop-card featured">
              <div className="card-top">
                <span className="badge success">
                  <img src={imgStatusOpen} alt="" aria-hidden="true" />
                  Open
                </span>
                <span className="badge price">Free</span>
              </div>
              <div className="card-body">
                <h3>Advanced Academic Writing &amp; Research</h3>
                <p>
                  Master the intricacies of composing high-impact academic
                  papers, structuring arguments, and effectively navigating
                  academic databases.
                </p>
                <div className="card-meta">
                  <div>
                    <img src={imgCalendar} alt="" aria-hidden="true" />
                    Oct 24 • 10:00 AM
                  </div>
                  <div>
                    <img src={imgPlace} alt="" aria-hidden="true" />
                    Library, Room 4B
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="speaker">
                  <img src={imgSpeaker} alt="Dr. Sarah Jenkins" />
                  <div>
                    <strong>Dr. Sarah Jenkins</strong>
                    <span>Writing Center Director</span>
                  </div>
                </div>
                <div className="seats">
                  <span>12 seats left</span>
                  <div className="progress">
                    <div className="progress-bar" />
                  </div>
                </div>
                <button type="button" className="action-button">
                  Register Now
                </button>
              </div>
            </article>

            <article className="workshop-card">
              <div className="card-top">
                <span className="badge warning">
                  <img src={imgStatusAlmost} alt="" aria-hidden="true" />
                  Almost Full
                </span>
                <span className="badge price">$15.00</span>
              </div>
              <div className="card-body">
                <h3>Data Analysis with Python Basics</h3>
                <div className="card-meta stack">
                  <div>
                    <img src={imgCalendar} alt="" aria-hidden="true" />
                    Oct 25 • 2:00 PM
                  </div>
                  <div>
                    <img src={imgInstructor} alt="" aria-hidden="true" />
                    Prof. Michael Chang
                  </div>
                  <div>
                    <img src={imgLocation} alt="" aria-hidden="true" />
                    Tech Hub, Lab 2
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className="status-text warning">Only 2 seats left</span>
                <button type="button" className="action-button">
                  Register
                </button>
              </div>
            </article>

            <article className="workshop-card muted">
              <div className="card-top">
                <span className="badge neutral">
                  <img src={imgStatusFull} alt="" aria-hidden="true" />
                  Full
                </span>
                <span className="badge price">Free</span>
              </div>
              <div className="card-body">
                <h3>Effective Time Management</h3>
                <div className="card-meta stack">
                  <div>
                    <img src={imgCalendar} alt="" aria-hidden="true" />
                    Oct 26 • 11:00 AM
                  </div>
                  <div>
                    <img src={imgInstructor} alt="" aria-hidden="true" />
                    Emma Richards
                  </div>
                  <div>
                    <img src={imgLocation} alt="" aria-hidden="true" />
                    Student Center, Rm 101
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className="status-text">0 seats left</span>
                <button type="button" className="ghost-button">
                  Join Waitlist
                </button>
              </div>
            </article>

            <article className="workshop-card cancelled">
              <div className="card-top">
                <span className="badge danger">
                  <img src={imgStatusCancelled} alt="" aria-hidden="true" />
                  Cancelled
                </span>
                <span className="badge price">Free</span>
              </div>
              <div className="card-body">
                <h3 className="strike">Public Speaking 101</h3>
                <div className="card-meta stack faded">
                  <div>
                    <img src={imgCalendar} alt="" aria-hidden="true" />
                    Oct 28 • 3:30 PM
                  </div>
                  <div>
                    <img src={imgInstructor} alt="" aria-hidden="true" />
                    Dr. Alan Grant
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className="status-text danger">Session Cancelled</span>
                <button type="button" className="ghost-button muted">
                  Unavailable
                </button>
              </div>
            </article>

            <article className="workshop-card">
              <div className="card-top">
                <span className="badge success">
                  <img src={imgStatusOpen} alt="" aria-hidden="true" />
                  Open
                </span>
                <span className="badge price highlight">$25.00</span>
              </div>
              <div className="card-body">
                <h3>Introduction to Machine Learning Models</h3>
                <div className="card-meta stack">
                  <div>
                    <img src={imgCalendar} alt="" aria-hidden="true" />
                    Nov 02 • 9:00 AM
                  </div>
                  <div>
                    <img src={imgInstructor} alt="" aria-hidden="true" />
                    Dr. Elena Rostova
                  </div>
                  <div>
                    <img src={imgLocation} alt="" aria-hidden="true" />
                    Engineering Bldg, Hall A
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className="status-text success">45 seats left</span>
                <button type="button" className="action-button">
                  Register
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkshopList;
