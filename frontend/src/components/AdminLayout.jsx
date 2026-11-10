import { useNavigate } from 'react-router';
import { sendJSON } from '../api';

// the frame of every admin page: header with the logout button
function AdminLayout({ adminName, children }) {
  const navigate = useNavigate();

  // log out, then go back to the login page
  function logout() {
    sendJSON('admin/logout.php', 'POST')
      .catch(() => {}) // go to the login page even if this fails
      .finally(() => navigate('/admin'));
  }

  return (
    <div className="page">
      <header className="page-header admin-header">
        <div className="brand">
          <img src="/emblem.svg" alt="Emblem of Sri Lanka" className="emblem" />
          <div>
            <h1>Ask INFO bot · Admin</h1>
            <p>Admin panel (පරිපාලක පුවරුව)</p>
          </div>
        </div>
        {adminName && (
          <button className="logout" onClick={logout}>
            {/* a door with an arrow going out */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4H5v16h4 M16 8l4 4-4 4 M20 12H10" />
            </svg>
            Logout <span className="logout-si">(ඉවත් වන්න)</span>
          </button>
        )}
      </header>

      <main className="page-body">{children}</main>
    </div>
  );
}

export default AdminLayout;
