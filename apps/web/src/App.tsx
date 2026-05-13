import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminSchedule from "./pages/AdminSchedule.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import WorkshopCheckout from "./pages/WorkshopCheckout.tsx";
import WorkshopList from "./pages/WorkshopList.tsx";
import WorkshopDetail from "./pages/WorkshopDetail.tsx";
import WorkshopSchedule from "./pages/WorkshopSchedule.tsx";
import UserProfile from "./pages/UserProfile.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workshops" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/schedule" element={<AdminSchedule />} />
      <Route path="/workshops" element={<WorkshopList />} />
      <Route path="/schedule" element={<WorkshopSchedule />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/workshops/:id/register" element={<WorkshopCheckout />} />
      <Route path="/workshops/:id" element={<WorkshopDetail />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/workshops" replace />} />
    </Routes>
  );
};

export default App;
