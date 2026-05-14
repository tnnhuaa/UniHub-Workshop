import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { fetchAuthSession, signOut } from '../lib/authClient.ts';

const imgAdminAvatar =
  'https://www.figma.com/api/mcp/asset/42495168-978f-40e2-a3d5-907b4c5a9554';
const imgNavDashboard =
  'https://www.figma.com/api/mcp/asset/c3696c49-ed29-492f-9f00-ec04f06c80d3';
const imgNavWorkshops =
  'https://www.figma.com/api/mcp/asset/1577639d-1c2e-4a57-a1b8-a631613991c3';
const imgNavSettings =
  'https://www.figma.com/api/mcp/asset/ae27d1cc-cf71-49ea-bbe0-46927cba9e10';
const imgNavLogout =
  'https://www.figma.com/api/mcp/asset/dc86654a-6ad1-4cd3-9c5d-953234a9bebb';

type AdminIdentity = {
  name: string;
  email: string | null;
  avatar: string | null;
};

const getSessionIdentity = (payload: unknown): AdminIdentity | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as {
    user?: unknown;
    session?: { user?: unknown } | null;
  };
  const candidate = root.user ?? root.session?.user;

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const user = candidate as {
    name?: unknown;
    email?: unknown;
    image?: unknown;
  };
  const name = typeof user.name === 'string' ? user.name.trim() : '';
  const email = typeof user.email === 'string' ? user.email.trim() : '';
  const avatar = typeof user.image === 'string' ? user.image.trim() : '';

  return {
    name: name || 'Admin Panel',
    email: email || null,
    avatar: avatar || null,
  };
};

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const result = await fetchAuthSession();
      if (!result.ok || !result.data) {
        return;
      }

      setAdmin(getSessionIdentity(result.data));
    };

    void loadSession();
  }, []);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.error) {
      return;
    }

    navigate('/sign-in');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img src={admin?.avatar ?? imgAdminAvatar} alt="Admin avatar" />
        <div>
          <h2>{admin?.name ?? 'Admin Panel'}</h2>
          <p>{admin?.email ?? 'Workshop Management'}</p>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          <img src={imgNavDashboard} alt="" aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/schedule"
          className={() =>
            location.pathname.startsWith('/admin/schedule') ||
            location.pathname.startsWith('/admin/workshops/')
              ? 'active'
              : undefined
          }
        >
          <img src={imgNavWorkshops} alt="" aria-hidden="true" />
          <span>Schedule</span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <a href="#">
          <img src={imgNavSettings} alt="" aria-hidden="true" />
          <span>Settings</span>
        </a>
        <a
          href="/sign-in"
          onClick={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <img src={imgNavLogout} alt="" aria-hidden="true" />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
