import { useState } from 'react';
import { useNavigate } from 'react-router';
import AdminPage from '../components/AdminPage';
import Field from '../components/Field';
import { sendJSON, useApi } from '../api';

// admin page: change the email used to log in
function AdminLoginEmailPage() {
  const navigate = useNavigate();
  // reload = a number that changes, so the email loads again after a change
  const [reload, setReload] = useState(0);
  const { data: saved } = useApi(`admin/login-email.php?reload=${reload}`);

  const [email, setEmail] = useState('');
  const [again, setAgain] = useState('');
  const [current, setCurrent] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);

  function save(event) {
    event.preventDefault();

    // check in the browser first
    const newEmail = email.trim().toLowerCase();
    if (newEmail !== again.trim().toLowerCase()) {
      setMessage({ ok: false, text: 'The two emails are not the same. (ඊමේල් ලිපින දෙක සමාන නොවේ.)' });
      setAgain('');
      return;
    }
    if (saved && newEmail === saved.email.toLowerCase()) {
      setMessage({ ok: false, text: 'This is already the login email. (මෙය දැනටමත් පිවිසුම් ඊමේල් ලිපිනයයි.)' });
      return;
    }

    setBusy(true);
    setMessage(null);
    sendJSON('admin/login-email.php', 'POST', { email: newEmail, current_password: current })
      .then(() => {
        setEmail('');
        setAgain('');
        setCurrent('');
        setReload(reload + 1);
        setMessage({
          ok: true,
          text: `Saved. Next time, log in with ${newEmail}. (සුරකින ලදී. ඊළඟ වතාවේ නව ඊමේල් ලිපිනයෙන් ඇතුළු වන්න.)`,
        });
      })
      .catch((error) => {
        if (error.message === 'Please log in first.') {
          navigate('/admin'); // the login has ended
        } else if (error.status === 401) {
          setMessage({ ok: false, text: 'Your current password is wrong. (වත්මන් මුරපදය වැරදිය.)' });
          setCurrent('');
        } else {
          setMessage({ ok: false, text: error.message });
        }
      })
      .finally(() => setBusy(false));
  }

  return (
    <AdminPage title="Change login email (පිවිසුම් ඊමේල් ලිපිනය වෙනස් කිරීම)">
      {/* the email used to log in now */}
      {saved && (
        <div className="email-status on">
          <span className="email-status-icon">
            <Icon path="M3 6h18v12H3z M3 7l9 6 9-6" size={24} />
          </span>
          <div className="email-status-text">
            <small>Login email now (වත්මන් පිවිසුම් ඊමේල් ලිපිනය)</small>
            <b>{saved.email}</b>
          </div>
        </div>
      )}

      <form className="admin-form" onSubmit={save}>
        <Field label="New login email (නව පිවිසුම් ඊමේල් ලිපිනය)" type="email" value={email} onChange={setEmail} autoComplete="off" required />
        <Field label="New login email again (නව ඊමේල් ලිපිනය නැවත)" type="email" value={again} onChange={setAgain} autoComplete="off" required />
        <Field
          label="Current password (වත්මන් මුරපදය)"
          type={showPassword ? 'text' : 'password'}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          required
        />

        {/* let the user see what is in the password box */}
        <label className="show-password">
          <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
          Show password (මුරපදය පෙන්වන්න)
        </label>

        <p className="note">
          The password does not change. Next time, log in with the new email. (මුරපදය වෙනස් නොවේ. ඊළඟ වතාවේ නව ඊමේල් ලිපිනයෙන්
          ඇතුළු වන්න.)
        </p>

        {message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Save (සුරකින්න)'}
        </button>
      </form>
    </AdminPage>
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

export default AdminLoginEmailPage;
