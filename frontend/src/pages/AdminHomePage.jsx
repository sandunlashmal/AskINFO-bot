import { Navigate, NavLink } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { useApi } from '../api';

// the admin pages (an item without "to" is not ready yet)
const ADMIN_MENU = [
  { icon: '📋', en: 'Services', si: 'සේවා' },
  { icon: '🏢', en: 'Divisions', si: 'අංශ' },
  { icon: '👤', en: 'Officers', si: 'නිලධාරීන්' },
  { icon: '📄', en: 'PDF forms', si: 'අයදුම්පත්' },
  { icon: '🔑', en: 'Change password', si: 'මුරපදය වෙනස් කිරීම', to: '/admin/password' },
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
          <h2 className="title">Welcome, {admin.name}! (ආයුබෝවන්!)</h2>
          <p className="question">What do you want to do? (ඔබට කුමක් කිරීමට අවශ්‍යද?)</p>

          <div className="menu">
            {ADMIN_MENU.map((item) =>
              item.to ? (
                <NavLink key={item.en} to={item.to} className="menu-item">
                  {item.icon} {item.en} <small>({item.si})</small>
                </NavLink>
              ) : (
                <div key={item.en} className="menu-item soon">
                  {item.icon} {item.en} <small>({item.si})</small>
                </div>
              ),
            )}
          </div>
          <p className="note">Grey items come soon. (අළු පැහැති අයිතම ඉක්මනින් එකතු කෙරේ.)</p>

          {/* see the chatbot as the public sees it (you stay logged in) */}
          <NavLink to="/" className="back">
            ← Back to chatbot (චැට්බොට් වෙත ආපසු)
          </NavLink>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminHomePage;