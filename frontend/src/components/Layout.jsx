import { NavLink } from 'react-router';
import { TEXTS } from '../texts';

// the frame of every page: header, back link and the page content
function Layout({ lang = 'en', backTo, backText, children }) {
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
          <NavLink to={backTo} className="back">
            ← {backText || t.back}
          </NavLink>
        )}
        {children}
      </main>

      {/* small link for the office staff who add the data */}
      <footer className="page-footer">
        <NavLink to="/admin">🔒 Staff login (කාර්ය මණ්ඩල පිවිසුම)</NavLink>
      </footer>
    </div>
  );
}

export default Layout;
