import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.tsx";

const imgBack =
  "https://www.figma.com/api/mcp/asset/b5782a50-bb86-4df4-ad5c-eae9bec1a501";
const imgSave =
  "https://www.figma.com/api/mcp/asset/4c887932-c917-4777-ab6d-a9f718724f24";
const imgSpeaker =
  "https://www.figma.com/api/mcp/asset/71a0a35a-c9aa-455c-980e-658e90444090";
const imgLocation =
  "https://www.figma.com/api/mcp/asset/e9c1f6d1-e4dc-447e-b63a-893c755fded6";
const imgDate =
  "https://www.figma.com/api/mcp/asset/1767af85-7c7a-4f16-84e5-4fb396aa3ad9";
const imgCapacity =
  "https://www.figma.com/api/mcp/asset/597340f1-8ec4-427f-9f8e-014f2ddf90f2";
const imgPrice =
  "https://www.figma.com/api/mcp/asset/d1e11ae4-aa19-482b-a3bc-64a786fa9244";
const imgTranscript =
  "https://www.figma.com/api/mcp/asset/a5f54d4e-a0a6-436c-8a7d-746c84f09d21";
const imgTranscriptStatus =
  "https://www.figma.com/api/mcp/asset/f6847724-7a0a-44ff-9e88-efb2b6b813b7";
const imgExport =
  "https://www.figma.com/api/mcp/asset/a8559913-825d-42b5-89ee-132355562ff3";
const imgStudentA =
  "https://www.figma.com/api/mcp/asset/6ba2d58a-f19f-4796-81d3-1f114b5889d7";
const imgStudentB =
  "https://www.figma.com/api/mcp/asset/eefbc52b-1ab0-45cf-9cc6-0a027b4aa065";

const attendees = [
  {
    name: "Elena Rostova",
    email: "elena.r@university.edu",
    avatar: imgStudentA,
  },
  {
    name: "Michael Chen",
    email: "m.chen@university.edu",
    avatar: imgStudentB,
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@university.edu",
    initials: "SJ",
  },
];

const AdminSchedule = () => {
  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main admin-schedule-main">
        <div className="admin-schedule-shell">
          <header className="admin-schedule-header">
            <div className="admin-schedule-heading">
              <Link to="/admin/dashboard" className="admin-back-link">
                <img src={imgBack} alt="" aria-hidden="true" />
                <span>Back to List</span>
              </Link>
              <h1>Edit Workshop</h1>
            </div>

            <div className="admin-schedule-header-actions">
              <button type="button" className="admin-muted-button">
                Discard Changes
              </button>
              <button type="button" className="admin-primary-button">
                <img src={imgSave} alt="" aria-hidden="true" />
                <span>Save Workshop</span>
              </button>
            </div>
          </header>

          <div className="admin-schedule-grid">
            <section className="admin-schedule-form-column">
              <article className="admin-form-card">
                <h2>Core Information</h2>

                <div className="admin-form-stack">
                  <label className="admin-form-field">
                    <span>Workshop Title</span>
                    <input
                      type="text"
                      value="Advanced Machine Learning Methodologies"
                      readOnly
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>Description</span>
                    <textarea
                      rows={5}
                      value="An in-depth exploration of modern neural network architectures, focusing on transformer models and their applications in natural language processing. Attendees should have a basic understanding of Python and PyTorch."
                      readOnly
                    />
                  </label>

                  <div className="admin-form-grid two">
                    <label className="admin-form-field">
                      <span>Primary Speaker</span>
                      <div className="admin-input-with-icon">
                        <img src={imgSpeaker} alt="" aria-hidden="true" />
                        <input type="text" value="Dr. Aris Thorne" readOnly />
                      </div>
                    </label>

                    <label className="admin-form-field">
                      <span>Room Location</span>
                      <div className="admin-input-with-icon">
                        <img src={imgLocation} alt="" aria-hidden="true" />
                        <input
                          type="text"
                          value="Engineering Bldg, Room 402"
                          readOnly
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </article>

              <article className="admin-form-card">
                <h2>Logistics & Capacity</h2>

                <div className="admin-form-grid two gap-lg">
                  <label className="admin-form-field">
                    <span>Date</span>
                    <div className="admin-input-with-icon">
                      <img src={imgDate} alt="" aria-hidden="true" />
                      <input type="text" value="11/15/2023" readOnly />
                    </div>
                  </label>

                  <div className="admin-form-field">
                    <span>Time</span>
                    <div className="admin-time-row">
                      <input type="text" value="02:00 PM" readOnly />
                      <span>to</span>
                      <input type="text" value="04:30 PM" readOnly />
                    </div>
                  </div>

                  <label className="admin-form-field">
                    <span>Max Capacity</span>
                    <div className="admin-input-with-icon">
                      <img src={imgCapacity} alt="" aria-hidden="true" />
                      <input type="text" value="50" readOnly />
                    </div>
                  </label>

                  <label className="admin-form-field">
                    <span>Registration Price ($)</span>
                    <div className="admin-input-with-icon">
                      <img src={imgPrice} alt="" aria-hidden="true" />
                      <input type="text" value="0.00" readOnly />
                    </div>
                    <small>Leave as 0.00 for free workshops.</small>
                  </label>
                </div>
              </article>

              <article className="admin-form-card">
                <h2>Course Materials</h2>
                <p className="admin-card-description">
                  Upload syllabus, reading lists, or prerequisite documents.
                </p>

                <div className="admin-upload-dropzone">
                  <div className="admin-upload-icon">PDF</div>
                  <strong>Click to upload or drag and drop</strong>
                  <span>PDF, DOCX up to 10MB</span>
                </div>

                <div className="admin-upload-file">
                  <div>
                    <strong>ML_Syllabus_Fall23.pdf</strong>
                    <span>2.4 MB</span>
                  </div>
                  <button type="button" aria-label="Delete uploaded file">
                    Delete
                  </button>
                </div>
              </article>
            </section>

            <aside className="admin-schedule-side-column">
              <article className="admin-side-card admin-transcript-card">
                <div className="admin-side-title">
                  <img src={imgTranscript} alt="" aria-hidden="true" />
                  <h2>AI Transcript</h2>
                  <span className="admin-transcript-status">
                    <img src={imgTranscriptStatus} alt="" aria-hidden="true" />
                    Pending
                  </span>
                </div>

                <p className="admin-transcript-copy">
                  The recording is scheduled for automated transcription and
                  summary generation after the event concludes.
                </p>

                <button type="button" className="admin-outline-button">
                  Generate Summary Now
                </button>
              </article>

              <article className="admin-side-card admin-registration-card">
                <h2>Registration Status</h2>

                <div className="admin-registration-stats">
                  <div>
                    <strong>45</strong>
                    <span>Registered</span>
                  </div>
                  <div>
                    <strong>50</strong>
                    <span>Capacity</span>
                  </div>
                </div>

                <div className="admin-registration-bar">
                  <span />
                </div>

                <div className="admin-registration-pill">
                  <span />
                  Registration Open
                </div>
              </article>

              <article className="admin-side-card admin-attendees-card">
                <div className="admin-attendees-header">
                  <h2>Attendees</h2>
                  <a href="#">View All</a>
                </div>

                <div className="admin-attendees-list">
                  {attendees.map((attendee) => (
                    <div key={attendee.email} className="admin-attendee-row">
                      {attendee.avatar ? (
                        <img src={attendee.avatar} alt={attendee.name} />
                      ) : (
                        <div className="admin-attendee-initials">
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

                <button type="button" className="admin-export-button">
                  <img src={imgExport} alt="" aria-hidden="true" />
                  <span>Export Roster</span>
                </button>
              </article>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSchedule;
