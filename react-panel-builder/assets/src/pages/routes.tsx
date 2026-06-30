import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginPage from "./auth/login";
import SignupPage from "./auth/signup";
import ForgetPasswordPage from "./auth/forget-password";
import ResetPasswordPage from "./auth/reset-password";
import AuthLayout from "../components/auth/AuthLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "./dashboard/dashboard";
import ListingPage from "./listing";
import CreateListingPage from "./listing/create";
import ProfilePage from "./profile";
import { useUserContext } from "../context/user-context";
import _404 from "./_404";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<_404 />} />

        {/* Index Route */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Dashboard Routes */}
        <Route path="/" element={<PrivateRoute layout={<DashboardLayout />} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/listing" element={<ListingPage />} />
          <Route path="/listing/:id" element={<CreateListingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthRoute layout={<AuthLayout />} />}>
          <Route path="/auth" element={<Navigate to="/auth/login" />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forget-password" element={<ForgetPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

const PrivateRoute = ({ layout }: { layout: React.ReactNode }) => {
  const { token } = useUserContext();
  return !!token ? layout : <Navigate to="/auth/login" />;
};

const AuthRoute = ({ layout }: { layout: React.ReactNode }) => {
  const { token } = useUserContext();
  return !!token ? <Navigate to="/dashboard" /> : layout;
};
