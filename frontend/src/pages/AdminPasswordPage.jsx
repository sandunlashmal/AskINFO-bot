import { useState } from 'react';
import { useNavigate } from 'react-router';
import AdminPage from '../components/AdminPage';
import Field from '../components/Field';
import { sendJSON } from '../api';

// admin page: change my password
function AdminPasswordPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [again, setAgain] = useState('');
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // empty the boxes (all 3, or only the 2 new ones)
  function clearBoxes(all) {
    if (all) {
      setCurrent('');
    }
    setNewPassword('');
    setAgain('');
  }

  function save(event) {
    event.preventDefault();

    // check in the browser first
    if (newPassword.length < 8) {
      setMessage({ ok: false, text: 'The new password must have at least 8 characters. (නව මුරපදයේ අවම වශයෙන් අක්ෂර 8ක් තිබිය යුතුය.)' });
      clearBoxes(false);
      return;
    }
    if (newPassword !== again) {
      setMessage({ ok: false, text: 'The two new passwords are not the same. (නව මුරපද දෙක සමාන නොවේ.)' });
      clearBoxes(false);
      return;
    }

    setBusy(true);
    setMessage(null);
    sendJSON('admin/password.php', 'POST', { current_password: current, new_password: newPassword })
      // log out and log in again with the new password (this also checks it)
      .then(() => sendJSON('admin/logout.php', 'POST'))
      .then(() =>
        navigate('/admin', {
          state: { message: 'Password changed. Please log in with the new password. (මුරපදය වෙනස් කරන ලදී. කරුණාකර නව මුරපදයෙන් ඇතුළු වන්න.)' },
        }),
      )
      .catch((error) => {
        if (error.message === 'Please log in first.') {
          navigate('/admin'); // the login has ended
        } else if (error.status === 401) {
          setMessage({ ok: false, text: 'Your current password is wrong. (වත්මන් මුරපදය වැරදිය.)' });
          clearBoxes(true);
        } else {
          setMessage({ ok: false, text: error.message });
        }
      })
      .finally(() => setBusy(false));
  }

  return (
    <AdminPage title="Change password (මුරපදය වෙනස් කිරීම)">
      <form className="admin-form" onSubmit={save}>
        <Field
          label="Current password (වත්මන් මුරපදය)"
          type={showPassword ? 'text' : 'password'}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          required
        />
        <Field
          label="New password, at least 8 characters (නව මුරපදය, අවම අක්ෂර 8)"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          required
        />
        <Field
          label="New password again (නව මුරපදය නැවත)"
          type={showPassword ? 'text' : 'password'}
          value={again}
          onChange={setAgain}
          autoComplete="new-password"
          required
        />

        {/* let the user see what is in the password box */}
        <label className="show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password (මුරපදය පෙන්වන්න)
        </label>

        {message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Save (සුරකින්න)'}
        </button>
      </form>
    </AdminPage>
  );
}

export default AdminPasswordPage;
