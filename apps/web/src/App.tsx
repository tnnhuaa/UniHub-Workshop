import { Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
};

export default App;
