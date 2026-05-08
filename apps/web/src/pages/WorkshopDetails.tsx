const imgStudentAvatar = "http://localhost:3845/assets/261aaea95663c0d09ca899e712d57f48fad7c689.png";
const imgStudentAvatar1 = "http://localhost:3845/assets/fcb251898196450f8d2c1423e8aac2a98c67ee3e.png";

const attendees = [
  {
    name: "Elena Rostova",
    email: "elena.r@university.edu",
    avatar: imgStudentAvatar,
  },
  {
    name: "Michael Chen",
    email: "m.chen@university.edu",
    avatar: imgStudentAvatar1,
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@university.edu",
    initials: "SJ",
  },
];

const WorkshopDetails = () => {
  return (
    <div className="workshop-page">
      <div className="workshop-grid">
        <section className="workshop-left">
          <article className="workshop-card">
            <h2>Core Information</h2>
            <div className="workshop-field">
              <label htmlFor="workshop-title">Workshop Title</label>
              <div className="workshop-input">
                <input
                  id="workshop-title"
                  type="text"
                  defaultValue="Advanced Machine Learning Methodologies"
                  readOnly
                />
              </div>
            </div>
            <div className="workshop-field">
              <label htmlFor="workshop-description">Description</label>
              <div className="workshop-input">
                <textarea
                  id="workshop-description"
                  rows={4}
                  defaultValue="An in-depth exploration of modern neural network architectures, focusing on transformer models and their applications in natural language processing. Attendees should have a basic understanding of Python and PyTorch."
                  readOnly
                />
              </div>
            </div>
            <div className="workshop-two-col">
              <div className="workshop-field">
                <label htmlFor="workshop-speaker">Primary Speaker</label>
                <div className="workshop-input workshop-input--icon">
                  <i className="fa-solid fa-user" aria-hidden="true" />
                  <input
                    id="workshop-speaker"
                    type="text"
                    defaultValue="Dr. Aris Thorne"
                    readOnly
                  />
                </div>
              </div>
              <div className="workshop-field">
                <label htmlFor="workshop-room">Room Location</label>
                <div className="workshop-input workshop-input--icon">
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <input
                    id="workshop-room"
                    type="text"
                    defaultValue="Engineering Bldg, Room 402"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="workshop-card">
            <h2>Logistics &amp; Capacity</h2>
            <div className="workshop-grid-2">
              <div className="workshop-field">
                <label htmlFor="workshop-date">Date</label>
                <div className="workshop-input workshop-input--icon">
                  <i className="fa-solid fa-calendar-days" aria-hidden="true" />
                  <input
                    id="workshop-date"
                    type="text"
                    defaultValue="11/15/2023"
                    readOnly
                  />
                </div>
              </div>
              <div className="workshop-field">
                <label>Time</label>
                <div className="workshop-time">
                  <div className="workshop-input">
                    <input type="text" defaultValue="02:00 PM" readOnly />
                  </div>
                  <span>to</span>
                  <div className="workshop-input">
                    <input type="text" defaultValue="04:30 PM" readOnly />
                  </div>
                </div>
              </div>
              <div className="workshop-field">
                <label htmlFor="workshop-capacity">Max Capacity</label>
                <div className="workshop-input workshop-input--icon">
                  <i className="fa-solid fa-user-group" aria-hidden="true" />
                  <input
                    id="workshop-capacity"
                    type="text"
                    defaultValue="50"
                    readOnly
                  />
                </div>
              </div>
              <div className="workshop-field">
                <label htmlFor="workshop-price">Registration Price ($)</label>
                <div className="workshop-input workshop-input--icon">
                  <i className="fa-solid fa-dollar-sign" aria-hidden="true" />
                  <input
                    id="workshop-price"
                    type="text"
                    defaultValue="0.00"
                    readOnly
                  />
                </div>
                <p className="workshop-helper">
                  Leave as 0.00 for free workshops.
                </p>
              </div>
            </div>
          </article>

          <article className="workshop-card">
            <h2>Course Materials</h2>
            <p className="workshop-muted">
              Upload syllabus, reading lists, or prerequisite documents.
            </p>
            <div className="workshop-upload">
              <div className="workshop-upload-icon">
                <i className="fa-solid fa-file-arrow-up" aria-hidden="true" />
              </div>
              <strong>Click to upload or drag and drop</strong>
              <span>PDF, DOCX up to 10MB</span>
            </div>
            <div className="workshop-file">
              <div className="workshop-file-meta">
                <i className="fa-solid fa-file-lines" aria-hidden="true" />
                <div>
                  <strong>ML_Syllabus_Fall23.pdf</strong>
                  <span>2.4 MB</span>
                </div>
              </div>
              <button type="button" aria-label="Remove file">
                <i className="fa-solid fa-trash" aria-hidden="true" />
              </button>
            </div>
          </article>
        </section>

        <aside className="workshop-right">
          <article className="workshop-card">
            <div className="workshop-card-header">
              <div className="workshop-card-title">
                <i className="fa-solid fa-robot" aria-hidden="true" />
                <h2>AI Transcript</h2>
              </div>
              <span className="workshop-chip workshop-chip--pending">
                <i className="fa-solid fa-clock" aria-hidden="true" />
                Pending
              </span>
            </div>
            <p className="workshop-muted">
              The recording is scheduled for automated transcription and summary
              generation after the event concludes.
            </p>
            <button className="workshop-outline-button" type="button">
              Generate Summary Now
            </button>
          </article>

          <article className="workshop-card workshop-card--status">
            <h2>Registration Status</h2>
            <div className="workshop-status-row">
              <div>
                <div className="workshop-status-value">45</div>
                <span>Registered</span>
              </div>
              <div className="workshop-status-capacity">
                <div className="workshop-status-capacity-value">50</div>
                <span>Capacity</span>
              </div>
            </div>
            <div className="workshop-progress">
              <span className="workshop-progress-fill" />
            </div>
            <span className="workshop-chip workshop-chip--open">
              <span className="workshop-dot" />
              Registration Open
            </span>
          </article>

          <article className="workshop-card">
            <div className="workshop-card-header">
              <h2>Attendees</h2>
              <button className="workshop-link" type="button">
                View All
              </button>
            </div>
            <div className="workshop-attendees">
              {attendees.map((attendee) => (
                <div className="workshop-attendee" key={attendee.email}>
                  {attendee.avatar ? (
                    <img src={attendee.avatar} alt={attendee.name} />
                  ) : (
                    <div className="workshop-attendee-initials">
                      {attendee.initials}
                    </div>
                  )}
                  <div>
                    <strong>{attendee.name}</strong>
                    <span>{attendee.email}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="workshop-secondary-button" type="button">
              <i className="fa-solid fa-file-export" aria-hidden="true" />
              Export Roster
            </button>
          </article>
        </aside>
      </div>
    </div>
  );
};

export default WorkshopDetails;
