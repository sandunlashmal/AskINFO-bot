import { NavLink } from 'react-router';
import Layout from '../components/Layout';
import { TEXTS } from '../texts';

// page 1: choose the language
function LanguagePage() {
  return (
    <Layout>
      <h2 className="question">
        Please choose your language.
        <br />
        කරුණාකර භාෂාව තෝරන්න.
        <br />
        தயவுசெய்து மொழியைத் தேர்ந்தெடுக்கவும்.
      </h2>

      <div className="menu">
        {Object.keys(TEXTS).map((code) => (
          <NavLink key={code} to={`/${code}`} className="menu-item">
            {TEXTS[code].language}
          </NavLink>
        ))}
      </div>
    </Layout>
  );
}

export default LanguagePage;