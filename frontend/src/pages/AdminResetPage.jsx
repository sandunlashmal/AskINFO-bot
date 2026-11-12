import { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { sendJSON } from '../api';

// admin page: choose a new password with the link from the email
function AdminResetPage() {
  const navigate = useNavigate();
  // the code from the link: /admin/reset?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [again, setAgain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [linkOld, setLinkOld] = useState(false);
  const [busy, setBusy] = useState(false);

  function save(event) {
    event.preventDefault();

    // check in the browser first
    if (newPassword.length < 8) {
      setMessage('The new password must have at least 8 characters. (නව මුරපදයේ අවම වශයෙන් අක්ෂර 8ක් තිබිය යුතුය.)');
      return;
    }
    if (newPassword !== again) {
      setMessage('The two new passwords are not the same. (නව මුරපද දෙක සමාන නොවේ.)');
      setAgain('');
      return;
    }

    setBusy(true);
    setMessage('');
    sendJSON('admin/reset.php', 'POST', { token, new_password: newPassword })
      .then(() =>
        navigate('/admin', {
          state: { message: 'Password changed. Please log in with the new password. (මුරපදය වෙනස් කරන ලදී. කරුණාකර නව මුරපදයෙන් ඇතුළු වන්න.)' },
        }),
      )
      .catch((error) => {
        if (error.status === 410) {
          setLinkOld(true);
        } else {
          setMessage(error.message);
        }
      })
      .finally(() => setBusy(false));
  }

  // the eye button inside a password box
  const eye = (
    <button
      type="button"
      className="eye-button"
      onClick={() => setShowPassword(!showPassword)}
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
  );

  return (
    <AdminLayout>
      <div className="login-page">
        <div className="login-form">
          <span className="login-lock">
            <Icon path="M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3" size={26} />
          </span>
          <h2 className="login-title">New password</h2>
          <p className="login-sub">නව මුරපදයක් සකසන්න</p>

          {/* a wrong or old link: ask for a new one */}
          {!token || linkOld ? (
            <>
              <p className="note error">
                This link is wrong or too old (30 minutes). Please ask for a new one. (මෙම සබැඳිය වැරදි හෝ පැරණි ය. කරුණාකර නව
                සබැඳියක් ඉල්ලන්න.)
              </p>
              <NavLink to="/admin/forgot" className="primary login-button link-button">
                Get a new link (නව සබැඳියක් ලබා ගන්න)
              </NavLink>
            </>
          ) : (
            <form onSubmit={save}>
              <label className="login-label">
                New password, at least 8 characters (නව මුරපදය, අවම අක්ෂර 8)
                <span className="input-box">
                  <Icon path="M7 11h10v9H7z M9 11V8a3 3 0 0 1 6 0v3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  {eye}
                </span>
              </label>

              <label className="login-label">
                New password again (නව මුරපදය නැවත)
                <span className="input-box">
                  <Icon path="M7 11h10v9H7z M9 11V8a3 3 0 0 1 6 0v3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={again}
                    onChange={(event) => setAgain(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </span>
              </label>

              {/* let the user see what is in the password boxes */}
              <label className="show-password">
                <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
                Show password (මුරපදය පෙන්වන්න)
              </label>

              {message && <p className="note error login-error">{message}</p>}

              <button className="primary login-button" type="submit" disabled={busy}>
                {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Save new password (සුරකින්න)'}
              </button>
            </form>
          )}
        </div>
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

export default AdminResetPage;
