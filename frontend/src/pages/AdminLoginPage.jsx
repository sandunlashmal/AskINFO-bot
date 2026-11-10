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
      <div className="login-page">
        {/* tell the public that this page is not for them */}
        <div className="staff-notice">
          <span className="notice-icon">
            <Icon path="M12 3l10 18H2z M12 10v5 M12 18h.01" />
          </span>
          <div className="notice-text">
            <b>This page is only for the staff of the Rattota Divisional Secretariat.</b>
            <span>මෙම පිටුව රත්තොට ප්‍රාදේශීය ලේකම් කාර්යාලයේ කාර්ය මණ්ඩලය සඳහා පමණි.</span>
            <span>இந்தப் பக்கம் இரத்தோட்டை பிரதேச செயலக ஊழியர்களுக்கு மட்டுமே.</span>
            <NavLink to="/" className="notice-back">
              <Icon path="M20 12H5M11 5l-7 7 7 7" size={18} />
              <span>Back to chatbot / චැට්බොට් වෙත ආපසු / சாட்போட்டுக்கு</span>
            </NavLink>
          </div>
        </div>

        <form className="login-form" onSubmit={login}>
          {/* a lock in a navy circle on top of the form */}
          <span className="login-lock">
            <Icon path="M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3" size={26} />
          </span>
          <h2 className="login-title">Staff login</h2>
          <p className="login-sub">කාර්ය මණ්ඩල පිවිසුම</p>

          {doneMessage && !message && <p className="note success">{doneMessage}</p>}

          <label className="login-label">
            Email (ඊමේල් ලිපිනය)
            <span className="input-box">
              <Icon path="M3 6h18v12H3z M3 7l9 6 9-6" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="name@rattotads.lk"
                required
              />
            </span>
          </label>

          <label className="login-label">
            Password (මුරපදය)
            <span className="input-box">
              <Icon path="M7 11h10v9H7z M9 11V8a3 3 0 0 1 6 0v3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              {/* eye button: show or hide the password (works with the tick box) */}
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password (මුරපදය සඟවන්න)' : 'Show password (මුරපදය පෙන්වන්න)'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon
                  path={
                    showPassword
                      ? 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M4 4l16 16'
                      : 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'
                  }
                />
              </button>
            </span>
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

          {message && <p className="note error login-error">{message}</p>}

          <button className="primary login-button" type="submit" disabled={busy}>
            {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Login (ඇතුළු වන්න)'}
          </button>

        </form>
      </div>
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

export default AdminLoginPage;
