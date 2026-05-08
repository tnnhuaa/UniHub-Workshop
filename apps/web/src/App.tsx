import { Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import WorkshopList from "./pages/WorkshopList.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workshops" replace />} />
      <Route path="/workshops" element={<WorkshopList />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/workshops" replace />} />
    </Routes>
  );
};

export default App;
