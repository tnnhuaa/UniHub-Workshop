import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <main className="admin-main admin-schedule-main">
      <p className="helper-text">{message}</p>
    </main>
  );
};

export default AdminScheduleEntry;