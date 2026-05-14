import { useEffect, useState } from 'react';
import { Calendar, Check, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { mapWorkshopToDetailViewModel } from '../lib/unihubAdapters.ts';
import { fetchWorkshop } from '../lib/unihubApi.ts';
import type { WorkshopDetailViewModel } from '../lib/unihubAdapters.ts';

const imgStudentProfile =
  'https://www.figma.com/api/mcp/asset/22492359-f12d-464a-b95a-fb292c891cc8';
const imgSpeakerProfile =
  'https://www.figma.com/api/mcp/asset/d068b264-bedc-481e-99ad-9b6f92676680';
const imgMapLocation =
  'https://www.figma.com/api/mcp/asset/2bdc588e-4301-40b3-8b99-53cbc5b02add';

const defaultWorkshopId = '1f5b7b88-2f2a-4ff0-9fb8-0f8b51a58f01';

const WorkshopDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const workshopId = id ?? defaultWorkshopId;
  const [workshop, setWorkshop] = useState<WorkshopDetailViewModel | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkshop = async () => {
      setIsLoading(true);
      setError(null);

      const result = await fetchWorkshop(workshopId);
      setIsLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setWorkshop(mapWorkshopToDetailViewModel(result.data));
    };

    void loadWorkshop();
  }, [workshopId]);

  if (isLoading) {
    return (
      <div className="workshop-detail-page">
        <WorkshopHeader
          activeTab="workshops"
          profileImage={imgStudentProfile}
          profileLink="/profile"
        />
        <main className="workshop-detail-main">
          <LoadingSpinner label="Loading workshop details..." />
        </main>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="workshop-detail-page">
        <WorkshopHeader
          activeTab="workshops"
          profileImage={imgStudentProfile}
          profileLink="/profile"
        />
        <main className="workshop-detail-main">
          <p className="helper-text">{error ?? 'Workshop not found.'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="workshop-detail-page">
      <WorkshopHeader
        activeTab="workshops"
        profileImage={imgStudentProfile}
        profileLink="/profile"
      />

      <main className="workshop-detail-main">
        <div className="detail-grid">
          <section className="detail-left">
            <Link className="detail-back" to="/workshops">
              &larr; Back to Workshops
            </Link>
            <div className="detail-hero">
              <div className="detail-hero-tags">
                <span className="detail-pill">
                  {workshop.status === 'cancelled'
                    ? 'Cancelled'
                    : workshop.registeredCount < workshop.capacity
                      ? 'Open'
                      : 'Full'}
                </span>
                <span className="detail-tag">{workshop.category}</span>
              </div>
              <h1>{workshop.title}</h1>
              <p>{workshop.description}</p>
            </div>

            <section className="detail-summary">
              <div className="summary-icon">
                <Sparkles className="icon" aria-hidden="true" />
              </div>
              <div>
                <h2>AI Summary</h2>
                <p>{workshop.summary}</p>
              </div>
            </section>

            <section className="detail-speaker">
              <div className="speaker-avatar">
                <img
                  src={workshop.speakerAvatar ?? imgSpeakerProfile}
                  alt={workshop.speaker}
                />
              </div>
              <div>
                <h3>{workshop.speaker}</h3>
                <p>{workshop.speakerTitle}</p>
              </div>
            </section>

            <section className="detail-about">
              <h2>About this Workshop</h2>
              <p>{workshop.about}</p>
              <ul>
                {workshop.takeaways.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </section>

          <aside className="detail-right">
            <section className="detail-card action-card">
              <div className="action-top">
                <div>
                  <h3>
                    {workshop.price === 0
                      ? 'Free'
                      : `$${workshop.price.toFixed(2)}`}
                  </h3>
                  <span>
                    {workshop.price === 0 ? 'For Students' : 'Paid Workshop'}
                  </span>
                </div>
                <div className="action-seats">
                  <span>
                    {workshop.registeredCount} / {workshop.capacity} Seats
                  </span>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.round(
                          (workshop.registeredCount / workshop.capacity) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="action-meta">
                <div>
                  <Calendar className="icon icon-md" aria-hidden="true" />
                  {new Date(workshop.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                <div>
                  <Clock className="icon icon-md" aria-hidden="true" />
                  {new Date(workshop.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(workshop.endTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div>
                  <MapPin className="icon icon-md" aria-hidden="true" />
                  {workshop.room}
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
                <img src={workshop.floorMapImage ?? imgMapLocation} alt="" />
                <div className="map-pin">
                  <MapPin className="icon" aria-hidden="true" />
                </div>
              </div>
              <p>{workshop.locationLabel}</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkshopDetail;
