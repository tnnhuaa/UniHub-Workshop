import { useNavigate } from 'react-router-dom';
import type {
  WorkshopBadgeTone,
  WorkshopCardData,
} from '../hooks/useWorkshopList.ts';

const getActionClassName = (variant: WorkshopCardData['action']['variant']) => {
  if (variant === 'ghost-muted') {
    return 'ghost-button muted';
  }
  if (variant === 'ghost') {
    return 'ghost-button';
  }
  return 'action-button';
};

const getStatusTextClassName = (tone?: WorkshopBadgeTone) => {
  if (!tone) {
    return 'status-text';
  }
  return `status-text ${tone}`;
};

const WorkshopCard = ({ workshop }: { workshop: WorkshopCardData }) => {
  const navigate = useNavigate();
  const StatusIcon = workshop.status.icon;
  const cardClassName = [
    'workshop-card',
    'is-clickable',
    workshop.variant === 'featured' ? 'featured' : '',
    workshop.className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const metaClassName = [
    'card-meta',
    workshop.variant === 'featured' ? '' : 'stack',
    workshop.metaFaded ? 'faded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClassName}
      role="link"
      tabIndex={0}
      aria-label={`Open workshop ${workshop.title}`}
      onClick={() => navigate(`/workshops/${workshop.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/workshops/${workshop.id}`);
        }
      }}
    >
      <div className="card-top">
        <span className={`badge ${workshop.status.tone}`}>
          <StatusIcon className="icon icon-xs" aria-hidden="true" />
          {workshop.status.label}
        </span>
        <span
          className={`badge price${
            workshop.price.highlight ? ' highlight' : ''
          }`}
        >
          {workshop.price.label}
        </span>
      </div>
      <div className="card-body">
        <h3 className={workshop.strikeTitle ? 'strike' : undefined}>
          {workshop.title}
        </h3>
        {workshop.description ? <p>{workshop.description}</p> : null}
        <div className={metaClassName}>
          {workshop.meta.map((item) => (
            <div key={`${workshop.id}-${item.label}`}>
              <item.icon className="icon icon-sm" aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        {workshop.speaker ? (
          <div className="speaker">
            <img src={workshop.speaker.avatar} alt={workshop.speaker.name} />
            <div>
              <strong>{workshop.speaker.name}</strong>
              <span>{workshop.speaker.title}</span>
            </div>
          </div>
        ) : null}
        {workshop.seats ? (
          workshop.seats.progress !== undefined ? (
            <div className="seats">
              <span>{workshop.seats.label}</span>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${workshop.seats.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <span className={getStatusTextClassName(workshop.seats.tone)}>
              {workshop.seats.label}
            </span>
          )
        ) : null}
        <button
          type="button"
          className={getActionClassName(workshop.action.variant)}
          disabled={workshop.action.disabled}
        >
          {workshop.action.label}
        </button>
      </div>
    </article>
  );
};

export default WorkshopCard;
