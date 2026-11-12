import { useState } from 'react';
import { NavLink } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { sendJSON, useApi } from '../api';

// admin page: "Forgot password?" - a reset link goes to the office email
function AdminForgotPage() {
  // is the office email saved? to = the office email, partly hidden (r•••s@gmail.com)
  const { data: setup, loading } = useApi('admin/forgot.php');

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  function send(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    sendJSON('admin/forgot.php', 'POST', { email })
      .then(() => setSent(true))
      .catch((error) => {
        if (error.status === 503) {
          setMessage({ ok: false, text: notSetUpText });
        } else {
          setMessage({ ok: false, text: error.message });
        }
      })
      .finally(() => setBusy(false));
  }

  return (
    <AdminLayout>
      <div className="login-page">
        <NavLink to="/admin" className="back login-back">
          <svg className="back-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 12H5M11 5l-7 7 7 7" />
          </svg>
          Back to login (පිවිසුම වෙත ආපසු)
        </NavLink>

        <form className="login-form" onSubmit={send}>
          {/* a key in a navy circle on top */}
          <span className="login-lock">
            <Icon path="M15 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M11.5 12.5L3 21 M6 18l2 2 M8 16l2 2" size={26} />
          </span>
          <h2 className="login-title">Forgot password?</h2>
          <p className="login-sub">මුරපදය අමතකද?</p>

          {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}

          {/* no office email in "Email settings" yet */}
          {setup && !setup.ready && <p className="note error">{notSetUpText}</p>}

          {/* the link was sent */}
          {sent && (
            <div className="sent-box">
              <span className="sent-icon">
                <Icon path="M3 6h18v12H3z M3 7l9 6 9-6" size={26} />
              </span>
              <b>Check the office email</b>
              <span className="sent-to">{setup?.to}</span>
              <p>
                If the login email was right, a reset link was sent. It works for 30 minutes. Look in Spam too.
                <br />
                පිවිසුම් ඊමේල් ලිපිනය නිවැරදි නම්, සබැඳියක් යවා ඇත. එය මිනිත්තු 30ක් වලංගු වේ. Spam ද පරීක්ෂා කරන්න.
              </p>
            </div>
          )}

          {setup?.ready && !sent && (
            <>
              {/* where the link will go */}
              <p className="forgot-info">
                A reset link will be sent to the office email
                <span className="sent-to">{setup.to}</span>
                නැවත සැකසීමේ සබැඳිය කාර්යාලයේ ඊමේල් ලිපිනයට යවනු ලැබේ.
              </p>

              <label className="login-label">
                Staff login email (පිවිසුම් ඊමේල් ලිපිනය)
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

              {message && <p className="note error login-error">{message.text}</p>}

              <button className="primary login-button" type="submit" disabled={busy}>
                {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Send reset link (සබැඳිය යවන්න)'}
              </button>
            </>
          )}
        </form>
      </div>
    </AdminLayout>
  );
}

const notSetUpText =
  'Reset by email is not set up yet. Please contact the IT officer. (ඊමේල් මගින් නැවත සැකසීම තවමත් සකසා නොමැත. කරුණාකර IT නිලධාරියා අමතන්න.)';

// a small line icon
function Icon({ path, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default AdminForgotPage;
