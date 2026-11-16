import { Navigate, Route, Routes } from "react-router";
import { RequireAuth, RequireRole } from "./auth/guards";
import Layout from "./components/Layout";
import LeaveDetail from "./pages/LeaveDetail";
import Login from "./pages/Login";
import MyLeaves from "./pages/MyLeaves";
import NotFound from "./pages/NotFound";
import TeamRequests from "./pages/TeamRequests";

// The whole route map in one place. Read it top to bottom:
//   /login is public.
//   RequireAuth: everything inside needs a signed-in user.
//   Layout: header and navigation around the page.
//   RequireRole: only a Manager gets past; others see the 403 page.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/leaves" replace />} />
          <Route path="leaves" element={<MyLeaves />} />
          <Route path="leaves/:id" element={<LeaveDetail />} />
          <Route element={<RequireRole role="Manager" />}>
            <Route path="team" element={<TeamRequests />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
