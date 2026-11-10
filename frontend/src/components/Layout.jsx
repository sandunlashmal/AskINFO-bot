import { NavLink } from 'react-router';
import { TEXTS } from '../texts';

// the frame of every page: header, back link and the page content
function Layout({ lang = 'en', backTo, backText, smallBack, children }) {
  const t = TEXTS[lang];

  return (
    <div className="page">
      <header className="page-header">
        {/* the emblem of Sri Lanka (file: frontend/public/emblem.svg) */}
        <div className="brand">
          <img src="/emblem.svg" alt="Emblem of Sri Lanka" className="emblem" />
          <div>
            <h1>Ask INFO bot</h1>
            <p>{t.office}</p>
          </div>
        </div>
      </header>

      <main className="page-body">
        {backTo && (
          <NavLink to={backTo} className={smallBack ? 'back back-small' : 'back'}>
            {/* a thick left arrow */}
            <svg className="back-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M20 12H5M11 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backText || t.back}
          </NavLink>
        )}
        {children}
      </main>

      {/* footer: office name and the link for the office staff */}
      <footer className="page-footer">
        <span>© Rattota Divisional Secretariat</span>
        <span>රත්තොට ප්‍රාදේශීය ලේකම් කාර්යාලය</span>
        <NavLink to="/admin" className="staff-login">
          {/* a small lock icon */}
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          Staff login (කාර්ය මණ්ඩල පිවිසුම) →
        </NavLink>
      </footer>
    </div>
  );
}

export default Layout;
