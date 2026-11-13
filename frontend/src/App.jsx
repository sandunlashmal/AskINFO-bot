import { Routes, Route, Navigate } from 'react-router';
import LanguagePage from './pages/LanguagePage';
import DivisionsPage from './pages/DivisionsPage';
import ServicePage from './pages/ServicePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminHomePage from './pages/AdminHomePage';
import AdminPasswordPage from './pages/AdminPasswordPage';
import AdminLoginEmailPage from './pages/AdminLoginEmailPage';
import AdminDivisionsPage from './pages/AdminDivisionsPage';
import AdminOfficersPage from './pages/AdminOfficersPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminFormsPage from './pages/AdminFormsPage';
import AdminEmailPage from './pages/AdminEmailPage';
import AdminForgotPage from './pages/AdminForgotPage';
import AdminResetPage from './pages/AdminResetPage';
import './App.css';

// which page to show for each URL
function App() {
  return (
    <Routes>
      <Route path="/" element={<LanguagePage />} />
      <Route path="/:lang" element={<DivisionsPage />} />
      <Route path="/:lang/services/:serviceId" element={<ServicePage />} />
      {/* admin pages (the office staff) */}
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/home" element={<AdminHomePage />} />
      <Route path="/admin/password" element={<AdminPasswordPage />} />
      <Route path="/admin/login-email" element={<AdminLoginEmailPage />} />
      <Route path="/admin/divisions" element={<AdminDivisionsPage />} />
      <Route path="/admin/officers" element={<AdminOfficersPage />} />
      <Route path="/admin/services" element={<AdminServicesPage />} />
      <Route path="/admin/forms" element={<AdminFormsPage />} />
      <Route path="/admin/email" element={<AdminEmailPage />} />
      {/* forgot password (no login needed) */}
      <Route path="/admin/forgot" element={<AdminForgotPage />} />
      <Route path="/admin/reset" element={<AdminResetPage />} />
      {/* any other URL goes back to the first page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
