import { Calendar, Check, Clock, MapPin, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import WorkshopHeader from "../components/WorkshopHeader.tsx";

const imgStudentProfile =
  "https://www.figma.com/api/mcp/asset/22492359-f12d-464a-b95a-fb292c891cc8";
const imgSpeakerProfile =
  "https://www.figma.com/api/mcp/asset/d068b264-bedc-481e-99ad-9b6f92676680";
const imgMapLocation =
  "https://www.figma.com/api/mcp/asset/2bdc588e-4301-40b3-8b99-53cbc5b02add";

const WorkshopDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? "featured";

  return (
    <div className="workshop-detail-page">
      <WorkshopHeader
        variant="list"
        activeTab="workshops"
        profileImage={imgStudentProfile}
      />

      <main className="workshop-detail-main">
        <div className="detail-grid">
          <section className="detail-left">
            <a className="detail-back" href="/workshops">
              &larr; Back to Workshops
            </a>
            <div className="detail-hero">
              <div className="detail-hero-tags">
                <span className="detail-pill">Open</span>
                <span className="detail-tag">Tech &amp; Innovation</span>
              </div>
              <h1>Advanced UI Patterns in React</h1>
              <p>
                Explore complex component architectures, state management for
                large scale applications, and modern styling techniques using
                Tailwind CSS.
              </p>
            </div>

            <section className="detail-summary">
              <div className="summary-icon">
                <Sparkles className="icon" aria-hidden="true" />
              </div>
              <div>
                <h2>AI Summary</h2>
                <p>
                  This workshop focuses on high-level frontend development
                  strategies. Key takeaways include implementing Bento Grids,
                  utilizing Glassmorphism effectively, and structuring complex
                  React applications for scalability. Ideal for intermediate
                  developers looking to refine their UI/UX implementation skills.
                </p>
              </div>
            </section>

            <section className="detail-speaker">
              <div className="speaker-avatar">
                <img src={imgSpeakerProfile} alt="Dr. Elena Rostova" />
              </div>
              <div>
                <h3>Dr. Elena Rostova</h3>
                <p>Lead Frontend Architect, TechGlobal</p>
              </div>
            </section>

            <section className="detail-about">
              <h2>About this Workshop</h2>
              <p>
                Join us for an intensive session where we break down the most
                popular UI patterns of 2024. We will start with a theoretical
                overview and quickly move into hands-on coding exercises. You
                will leave this session with practical code snippets and a deeper
                understanding of how to build premium user interfaces.
              </p>
              <ul>
                <li>Building responsive Bento Grids</li>
                <li>Implementing performant Glassmorphism</li>
                <li>Advanced Tailwind CSS configuration</li>
                <li>Accessibility in complex UI components</li>
              </ul>
            </section>
          </section>

          <aside className="detail-right">
            <section className="detail-card action-card">
              <div className="action-top">
                <div>
                  <h3>Free</h3>
                  <span>For Students</span>
                </div>
                <div className="action-seats">
                  <span>12 / 30 Seats</span>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
              <div className="action-meta">
                <div>
                  <Calendar className="icon icon-md" aria-hidden="true" />
                  Oct 24, 2024
                </div>
                <div>
                  <Clock className="icon icon-md" aria-hidden="true" />
                  2:00 PM - 4:00 PM
                </div>
                <div>
                  <MapPin className="icon icon-md" aria-hidden="true" />
                  Innovation Hub, Room 402
                </div>
              </div>
              <button
                type="button"
                className="detail-register"
                onClick={() => navigate(`/workshops/${workshopId}/register`)}
              >
                <Check className="icon icon-md" aria-hidden="true" />
                Register Now
              </button>
            </section>

            <section className="detail-card map-card">
              <span className="map-label">Location</span>
              <div className="map-preview">
                <img src={imgMapLocation} alt="" />
                <div className="map-pin">
                  <MapPin className="icon" aria-hidden="true" />
                </div>
              </div>
              <p>North Campus, Building B</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkshopDetail;
