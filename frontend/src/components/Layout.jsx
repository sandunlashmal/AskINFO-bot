import { NavLink } from 'react-router';
import { TEXTS } from '../texts';

// the frame of every page: header, back link and the page content
function Layout({ lang = 'en', backTo, backText, children }) {
  const t = TEXTS[lang];

  return (
    <div className="page">
      <header className="page-header">
        <h1>Ask INFO bot</h1>
        <p>{t.office}</p>
      </header>

      <main className="page-body">
        {backTo && (
          <NavLink to={backTo} className="back">
            ← {backText || t.back}
          </NavLink>
        )}
        {children}
      </main>
    </div>
  );
}

export default Layout;