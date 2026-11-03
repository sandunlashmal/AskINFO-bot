import { Navigate, NavLink } from 'react-router';
import AdminLayout from './AdminLayout';
import { useApi } from '../api';

// the frame of every admin page after login:
// checks the login, shows the title and a link back to the menu
function AdminPage({ title, children }) {
  // who is logged in? (401 = not logged in)
  const { data: admin, loading, error } = useApi('admin/me.php');

  // not logged in: go to the login page
  if (error) {
    return <Navigate to="/admin" />;
  }

  return (
    <AdminLayout adminName={admin?.name}>
      <NavLink to="/admin/home" className="back">
        ← Back to menu (මෙනුව වෙත ආපසු)
      </NavLink>
      <h2 className="title">{title}</h2>

      {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}
      {admin && children}
    </AdminLayout>
  );
}

export default AdminPage;