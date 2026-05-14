import { NavLink } from 'react-router-dom';

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

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img src={imgAdminAvatar} alt="Admin avatar" />
        <div>
          <h2>Admin Panel</h2>
          <p>Workshop Management</p>
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
          className={({ isActive }) => (isActive ? 'active' : undefined)}
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
        <a href="#">
          <img src={imgNavLogout} alt="" aria-hidden="true" />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
