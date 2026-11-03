import { useState } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { sendJSON, useApi } from '../api';

// admin page 1: login with email and password
function AdminLoginPage() {
  const navigate = useNavigate();
  // a message sent from another page, e.g. after changing the password
  const doneMessage = useLocation().state?.message;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // already logged in? then me.php gives the admin
  const { data: admin, loading } = useApi('admin/me.php');

  if (loading) {
    return (
      <AdminLayout>
        <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>
      </AdminLayout>
    );
  }
  if (admin) {
    return <Navigate to="/admin/home" />;
  }

  // the login form was sent
  function login(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setMessage('');
    setBusy(true);

    sendJSON('admin/login.php', 'POST', { email, password })
      .then(() => navigate('/admin/home'))
      .catch((error) => {
        if (error.status === 401) {
          setMessage('Wrong email or password. (ඊමේල් ලිපිනය හෝ මුරපදය වැරදිය.)');
          setPassword(''); // empty the password box to type it again
        } else if (error.status === 400) {
          setMessage('Please enter the email and the password. (කරුණාකර ඊමේල් ලිපිනය සහ මුරපදය ඇතුළත් කරන්න.)');
        } else {
          setMessage('Could not connect. Please try again. (සම්බන්ධ වීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.)');
        }
      })
      .finally(() => setBusy(false));
  }

  return (
    <AdminLayout>
      {/* tell the public that this page is not for them */}
      <div className="staff-notice">
        <p>
          ⚠️ <b>This page is only for the staff of the Rattota Divisional Secretariat.</b>
        </p>
        <p>
          <b>මෙම පිටුව රත්තොට ප්‍රාදේශීය ලේකම් කාර්යාලයේ කාර්ය මණ්ඩලය සඳහා පමණි.</b>
        </p>
        <p>
          <b>இந்தப் பக்கம் இரத்தோட்டை பிரதேச செயலக ஊழியர்களுக்கு மட்டுமே.</b>
        </p>
        <NavLink to="/" className="notice-back">
          ← Back to chatbot / චැට්බොට් වෙත ආපසු / சாட்போட்டுக்கு
        </NavLink>
      </div>

      <form className="login-form" onSubmit={login}>
        <h2 className="title">Login (ඇතුළු වන්න)</h2>
        {doneMessage && !message && <p className="note success">{doneMessage}</p>}

        <label>
          Email (ඊමේල් ලිපිනය)
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password (මුරපදය)
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {/* let the user see what is in the password box */}
        <label className="show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password (මුරපදය පෙන්වන්න)
        </label>

        {message && <p className="note error">{message}</p>}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Login (ඇතුළු වන්න)'}
        </button>
      </form>
    </AdminLayout>
  );
}

export default AdminLoginPage;
