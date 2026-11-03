import { Routes, Route, Navigate } from 'react-router';
import LanguagePage from './pages/LanguagePage';
import DivisionsPage from './pages/DivisionsPage';
import ServicePage from './pages/ServicePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminHomePage from './pages/AdminHomePage';
import AdminPasswordPage from './pages/AdminPasswordPage';
import AdminDivisionsPage from './pages/AdminDivisionsPage';
import AdminOfficersPage from './pages/AdminOfficersPage';
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
      <Route path="/admin/divisions" element={<AdminDivisionsPage />} />
      <Route path="/admin/officers" element={<AdminOfficersPage />} />
      {/* any other URL goes back to the first page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
