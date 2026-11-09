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
            Logout (ඉවත් වන්න)
          </button>
        )}
      </header>

      <main className="page-body">{children}</main>
    </div>
  );
}

export default AdminLayout;
