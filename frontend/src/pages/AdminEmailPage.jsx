import { useState } from 'react';
import AdminPage from '../components/AdminPage';
import ConfirmDelete from '../components/ConfirmDelete';
import { sendJSON, useApi } from '../api';

// admin page: the office email for "Forgot password"
// the reset link is sent from this Gmail to this same Gmail
function AdminEmailPage() {
  // reload = a number that changes, so the settings load again after a change
  const [reload, setReload] = useState(0);
  const { data: saved, loading } = useApi(`admin/email-settings.php?reload=${reload}`);

  // the form boxes
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // true = the form is open to change a saved email
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);
  const [askRemove, setAskRemove] = useState(false);

  // an email and its App password are saved
  const isSet = Boolean(saved?.email && saved?.has_password);
  // same email as the saved one: the App password box can stay empty
  const sameEmail = isSet && email.trim().toLowerCase() === saved.email.toLowerCase();

  function openForm() {
    setEmail(saved?.email ?? '');
    setAppPassword('');
    setMessage(null);
    setChanging(true);
  }

  function closeForm() {
    setChanging(false);
    setAppPassword('');
    setMessage(null);
  }

  function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    sendJSON('admin/email-settings.php', 'POST', { email, app_password: appPassword })
      .then(() => {
        setChanging(false);
        setAppPassword('');
        setReload(reload + 1);
        setMessage({ ok: true, text: 'Saved. Now click "Send test email". (සුරකින ලදී. දැන් "Send test email" ක්ලික් කරන්න.)' });
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setBusy(false));
  }

  function sendTest() {
    setBusy(true);
    setMessage(null);
    sendJSON('admin/email-settings.php?test=1', 'POST')
      .then((answer) =>
        setMessage({ ok: true, text: `${answer.message} Check the inbox, also Spam. (ඊමේල් පරීක්ෂා කරන්න, Spam ද බලන්න.)` }),
      )
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setBusy(false));
  }

  function remove() {
    setBusy(true);
    sendJSON('admin/email-settings.php', 'DELETE')
      .then(() => {
        setReload(reload + 1);
        setEmail('');
        setMessage({ ok: true, text: 'The email was removed. "Forgot password" is off now. (ඊමේල් ලිපිනය ඉවත් කරන ලදී.)' });
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => {
        setBusy(false);
        setAskRemove(false);
      });
  }

  const showForm = !loading && (!isSet || changing);

  return (
    <AdminPage title="Email settings (ඊමේල් සැකසුම්)">
      <p className="note">
        When the staff password is forgotten, the reset link comes to this email. (මුරපදය අමතක වූ විට, නැවත සැකසීමේ සබැඳිය
        ලැබෙන්නේ මෙම ඊමේල් ලිපිනයටයි.)
      </p>

      {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}

      {/* the saved email, or "no email yet" */}
      {!loading && (
        <div className={isSet ? 'email-status on' : 'email-status off'}>
          <span className="email-status-icon">
            <Icon path={isSet ? 'M3 6h18v12H3z M3 7l9 6 9-6' : 'M12 3l10 18H2z M12 10v5 M12 18h.01'} size={24} />
          </span>
          <div className="email-status-text">
            {isSet ? (
              <>
                <small>Reset links go to (සබැඳිය ලැබෙන ඊමේල් ලිපිනය)</small>
                <b>{saved.email}</b>
                <span className="email-status-tag">✓ Forgot password is on (සක්‍රියයි)</span>
              </>
            ) : (
              <>
                <b>No email yet. (තවමත් ඊමේල් ලිපිනයක් නැත.)</b>
                <small>"Forgot password" is off until you add one. (ඊමේල් ලිපිනයක් එක් කරන තුරු "මුරපදය අමතකද?" ක්‍රියා නොකරයි.)</small>
              </>
            )}
          </div>
        </div>
      )}

      {/* buttons for a saved email */}
      {isSet && !changing && (
        <div className="email-buttons">
          <button className="primary" type="button" onClick={sendTest} disabled={busy}>
            <Icon path="M22 2L11 13 M22 2l-7 20-4-9-9-4z" size={18} />
            {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Send test email (පරීක්ෂණ ඊමේල්)'}
          </button>
          <button className="secondary" type="button" onClick={openForm} disabled={busy}>
            <Icon path="M4 20h4L19 9l-4-4L4 16z M14 6l4 4" size={18} />
            Change (වෙනස් කරන්න)
          </button>
          <button className="danger" type="button" onClick={() => setAskRemove(true)} disabled={busy}>
            <Icon path="M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3" size={18} />
            Remove (ඉවත් කරන්න)
          </button>
        </div>
      )}

      {message && !showForm && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>}

      {/* add an email, or change the saved one */}
      {showForm && (
        <form className="admin-form" onSubmit={save}>
          <h3 className="form-part">{isSet ? 'Change the email (ඊමේල් ලිපිනය වෙනස් කිරීම)' : 'Add an email (ඊමේල් ලිපිනයක් එක් කිරීම)'}</h3>

          <label className="field">
            Gmail address (Gmail ලිපිනය) *
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="rattotads@gmail.com"
              autoComplete="off"
              required
            />
          </label>

          <label className="field">
            App password, 16 letters (App password, අකුරු 16) {!sameEmail && '*'}
            <span className="input-box">
              <input
                type={showPassword ? 'text' : 'password'}
                value={appPassword}
                onChange={(event) => setAppPassword(event.target.value)}
                placeholder="abcd efgh ijkl mnop"
                autoComplete="new-password"
                required={!sameEmail}
              />
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
            </span>
            <small className="field-help">
              {sameEmail
                ? 'Leave empty to keep the saved App password. (සුරකින ලද App password එක තබා ගැනීමට හිස්ව තබන්න.)'
                : 'Not the normal Gmail password. See the steps below. (සාමාන්‍ය Gmail මුරපදය නොවේ. පහත පියවර බලන්න.)'}
            </small>
          </label>

          {message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>}

          <div className="form-buttons">
            <button className="primary" type="submit" disabled={busy}>
              {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Save (සුරකින්න)'}
            </button>
            {changing && (
              <button className="secondary" type="button" onClick={closeForm} disabled={busy}>
                Cancel (අවලංගු කරන්න)
              </button>
            )}
          </div>
        </form>
      )}

      {/* how to get an App password from Google */}
      <div className="admin-form email-help">
        <h3 className="form-part">How to get an App password (App password ලබා ගන්නා ආකාරය)</h3>
        <ol className="email-steps">
          <li>
            Log in to the Gmail. Open <b>myaccount.google.com</b> → Security.
            <small>Gmail ගිණුමට ඇතුළු වී myaccount.google.com → Security විවෘත කරන්න.</small>
          </li>
          <li>
            Turn on <b>2-Step Verification</b>.
            <small>2-Step Verification සක්‍රිය කරන්න.</small>
          </li>
          <li>
            Open <b>myaccount.google.com/apppasswords</b>
            <small>myaccount.google.com/apppasswords විවෘත කරන්න.</small>
          </li>
          <li>
            App name: <b>Ask INFO bot</b> → Create.
            <small>නමක් ලෙස "Ask INFO bot" ඇතුළත් කර Create ක්ලික් කරන්න.</small>
          </li>
          <li>
            Copy the 16 letters and paste them above.
            <small>පෙන්වන අකුරු 16 පිටපත් කර ඉහත කොටුවේ ඇතුළත් කරන්න.</small>
          </li>
        </ol>
      </div>

      {askRemove && (
        <ConfirmDelete
          title="Remove this email?"
          titleSi="මෙම ඊමේල් ලිපිනය ඉවත් කරන්නද?"
          name={saved?.email}
          note={'"Forgot password" will not work until you add an email again. ("මුරපදය අමතකද?" ක්‍රියා නොකරයි.)'}
          busy={busy}
          onYes={remove}
          onNo={() => setAskRemove(false)}
        />
      )}
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

export default AdminEmailPage;
