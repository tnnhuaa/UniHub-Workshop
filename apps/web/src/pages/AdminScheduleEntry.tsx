import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { fetchAdminDashboard } from '../lib/unihubApi.ts';

const getLastWorkshopId = () => {
  try {
    return localStorage.getItem('admin:lastWorkshopId');
  } catch {
    return null;
  }
};

const AdminScheduleEntry = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Opening workshop editor...');

  useEffect(() => {
    const resolveWorkshopRoute = async () => {
      const lastWorkshopId = getLastWorkshopId();
      if (lastWorkshopId) {
        navigate(`/admin/workshops/${lastWorkshopId}`, { replace: true });
        return;
      }

      const result = await fetchAdminDashboard();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      const nextWorkshopId = result.data.workshops[0]?.id;
      if (!nextWorkshopId) {
        setMessage('No workshops available yet.');
        return;
      }

      navigate(`/admin/workshops/${nextWorkshopId}`, { replace: true });
    };

    void resolveWorkshopRoute();
  }, [navigate]);

  return (
    <div className="admin-page">
      <AdminSidebar />
      <main className="admin-main admin-schedule-main admin-entry-main">
        <section className="admin-entry-card">
          <span className="admin-panel-kicker">Workshop editor</span>
          <h1>Preparing your workspace</h1>
          <p>{message}</p>
          <div className="admin-entry-spinner">
            <LoadingSpinner label="Opening workshop editor..." size={28} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminScheduleEntry;
