import { Navigate, NavLink } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { useApi } from '../api';

// small line pictures for the menu cards
const ICONS = {
  services: 'M9 4h6v3H9z M7 5H5v16h14V5h-2 M8 11h8 M8 15h8 M8 19h5',
  divisions: 'M4 21V4h10v17 M14 9h6v12 M2 21h20 M7 8h4 M7 12h4 M7 16h4 M17 13h0 M17 17h0',
  officers: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
  forms: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h6',
  email: 'M3 6h18v12H3z M3 7l9 6 9-6',
  password: 'M15 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M11.5 12.5L3 21 M6 18l2 2 M8 16l2 2',
};

// the admin pages
const ADMIN_MENU = [
  { icon: 'services', en: 'Services', si: 'සේවා', to: '/admin/services' },
  { icon: 'divisions', en: 'Divisions', si: 'අංශ', to: '/admin/divisions' },
  { icon: 'officers', en: 'Officers', si: 'නිලධාරීන්', to: '/admin/officers' },
  { icon: 'forms', en: 'PDF forms', si: 'අයදුම්පත්', to: '/admin/forms' },
  { icon: 'email', en: 'Email settings', si: 'ඊමේල් සැකසුම්', to: '/admin/email' },
  { icon: 'password', en: 'Change password', si: 'මුරපදය වෙනස් කිරීම', to: '/admin/password' },
];

// admin page 2: the menu after login
function AdminHomePage() {
  // who is logged in? (401 = not logged in)
  const { data: admin, loading, error } = useApi('admin/me.php');

  // not logged in: go to the login page
  if (error) {
    return <Navigate to="/admin" />;
  }

  return (
    <AdminLayout adminName={admin?.name}>
      {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}

      {admin && (
        <>
          {/* a light blue welcome box in the middle, with the admin's name */}
          <div className="admin-welcome">
            <span className="admin-avatar">{admin.name.charAt(0).toUpperCase()}</span>
            <h2>Welcome, {admin.name}! (ආයුබෝවන්!)</h2>
            <p>What do you want to do? (ඔබට කුමක් කිරීමට අවශ්‍යද?)</p>
          </div>

          <div className="admin-menu">
            {ADMIN_MENU.map((item) => (
              <NavLink key={item.en} to={item.to} className="admin-card">
                <span className="admin-card-icon">
                  <Icon path={ICONS[item.icon]} size={22} />
                </span>
                <span className="admin-card-text">
                  <strong>{item.en}</strong>
                  <small>{item.si}</small>
                </span>
                <span className="admin-card-arrow">›</span>
              </NavLink>
            ))}
          </div>

          {/* see the chatbot as the public sees it (you stay logged in) */}
          <div className="admin-back-row">
            <NavLink to="/" className="back admin-back">
              {/* a thick arrow, it goes gold under the mouse */}
              <svg className="back-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 12H5M11 5l-7 7 7 7" />
              </svg>
              Back to chatbot (චැට්බොට් වෙත ආපසු)
            </NavLink>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

// a small line icon
function Icon({ path, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default AdminHomePage;
