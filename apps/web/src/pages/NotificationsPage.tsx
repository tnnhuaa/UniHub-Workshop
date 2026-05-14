import { useEffect, useMemo, useState } from 'react';
import { Bell, Calendar, CheckCheck, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import SessionGate from '../components/SessionGate.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import useStudentSession from '../hooks/useStudentSession.ts';
import {
  fetchMyNotifications,
  markMyNotificationRead,
  type NotificationApiDto,
} from '../lib/unihubApi.ts';

const imgStudentProfile = '/figma-mcp/646bd94c-8822-432f-be1f-38d08a09df59.jpg';

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const session = useStudentSession();
  const [notifications, setNotifications] = useState<NotificationApiDto[]>([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      if (session.isLoading) {
        return;
      }

      if (!session.isAuthenticated) {
        setNotifications([]);
        setSelectedNotificationId(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await fetchMyNotifications({
        readStatus: 'all',
        page: 1,
        pageSize: 50,
      });

      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setNotifications(result.data);
      setSelectedNotificationId(
        (current) => current ?? result.data[0]?.id ?? null,
      );
      setIsLoading(false);
    };

    void loadNotifications();
  }, [session.isAuthenticated, session.isLoading]);

  const selectedNotification = useMemo(
    () =>
      notifications.find(
        (notification) => notification.id === selectedNotificationId,
      ) ??
      notifications[0] ??
      null,
    [notifications, selectedNotificationId],
  );

  const handleSelectNotification = async (notification: NotificationApiDto) => {
    setSelectedNotificationId(notification.id);

    if (notification.readAt) {
      return;
    }

    const result = await markMyNotificationRead(notification.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setNotifications((current) =>
      current.map((entry) =>
        entry.id === notification.id ? result.data : entry,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="notifications-page">
        <WorkshopHeader
          activeTab="notifications"
          profileImage={session.student?.avatar ?? imgStudentProfile}
          profileLink={session.isAuthenticated ? '/profile' : undefined}
        />
        <main className="notifications-main">
          <LoadingSpinner label="Loading notifications..." />
        </main>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <WorkshopHeader
        activeTab="notifications"
        profileImage={session.student?.avatar ?? imgStudentProfile}
        profileLink={session.isAuthenticated ? '/profile' : undefined}
      />

      <main className="notifications-main">
        {session.isUnauthenticated ? (
          <SessionGate
            title="Sign in to view your notifications"
            description="UniHub stores your registration confirmations and delivery history here after you log in."
            primaryActionLabel="Log in"
            primaryActionTo="/sign-in"
          />
        ) : null}

        {session.isUnauthenticated ? null : (
          <>
            <div className="notifications-header">
              <div>
                <h1>Notifications</h1>
                <p>
                  Review your registration confirmations and delivery history.
                </p>
              </div>
              <div className="notifications-count">
                <Bell className="icon icon-sm" aria-hidden="true" />
                <span>
                  {
                    notifications.filter((notification) => !notification.readAt)
                      .length
                  }{' '}
                  unread
                </span>
              </div>
            </div>

            {session.error ? (
              <p className="helper-text">{session.error}</p>
            ) : null}
            {error ? <p className="helper-text">{error}</p> : null}

            <div className="notifications-layout">
              <section className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <p className="helper-text">
                      No notifications yet. Registration confirmations will
                      appear here after you enroll in a workshop.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`notification-item${
                        selectedNotificationId === notification.id
                          ? ' is-selected'
                          : ''
                      }${notification.readAt ? '' : ' is-unread'}`}
                      onClick={() =>
                        void handleSelectNotification(notification)
                      }
                    >
                      <div className="notification-item-head">
                        <strong>{notification.title}</strong>
                        {!notification.readAt ? <span>New</span> : null}
                      </div>
                      <p>{notification.body}</p>
                      <small>{formatDateTime(notification.createdAt)}</small>
                    </button>
                  ))
                )}
              </section>

              <aside className="notification-detail">
                {selectedNotification ? (
                  <>
                    <div className="notification-detail-head">
                      <div>
                        <h2>{selectedNotification.title}</h2>
                        <p>{selectedNotification.body}</p>
                      </div>
                      {selectedNotification.readAt ? (
                        <span className="notification-status-chip">
                          <CheckCheck
                            className="icon icon-xs"
                            aria-hidden="true"
                          />
                          Read
                        </span>
                      ) : null}
                    </div>

                    <div className="notification-detail-grid">
                      <div className="notification-detail-card">
                        <span>Created</span>
                        <div>
                          <Clock className="icon icon-xs" aria-hidden="true" />
                          {formatDateTime(selectedNotification.createdAt)}
                        </div>
                      </div>
                      <div className="notification-detail-card">
                        <span>Workshop</span>
                        <div>
                          <Bell className="icon icon-xs" aria-hidden="true" />
                          {selectedNotification.data?.workshopTitle ?? 'N/A'}
                        </div>
                      </div>
                      <div className="notification-detail-card">
                        <span>Start Time</span>
                        <div>
                          <Calendar
                            className="icon icon-xs"
                            aria-hidden="true"
                          />
                          {formatDateTime(selectedNotification.data?.startTime)}
                        </div>
                      </div>
                      <div className="notification-detail-card">
                        <span>Room</span>
                        <div>
                          <MapPin className="icon icon-xs" aria-hidden="true" />
                          {selectedNotification.data?.room ?? 'TBA'}
                        </div>
                      </div>
                    </div>

                    <div className="notification-delivery-list">
                      <h3>Delivery status</h3>
                      {selectedNotification.deliveries.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="notification-delivery-item"
                        >
                          <strong>{delivery.channel}</strong>
                          <span>{delivery.status}</span>
                        </div>
                      ))}
                    </div>

                    <div className="notification-actions">
                      <button
                        type="button"
                        className="checkout-pay"
                        onClick={() => navigate('/schedule')}
                      >
                        Open My Schedule
                      </button>
                      {selectedNotification.data?.workshopId ? (
                        <button
                          type="button"
                          className="checkout-pay secondary"
                          onClick={() =>
                            navigate(
                              `/workshops/${selectedNotification.data?.workshopId}`,
                            )
                          }
                        >
                          View Workshop
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="notifications-empty">
                    <p className="helper-text">
                      Select a notification to view details.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
