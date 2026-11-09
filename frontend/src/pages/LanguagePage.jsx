import { NavLink } from 'react-router';
import Layout from '../components/Layout';
import { TEXTS } from '../texts';

// the order on this page: Sinhala, Tamil, English (like government boards)
const ORDER = ['si', 'ta', 'en'];

// the big letter and the small line on each language button
const BUTTONS = {
  si: { letter: 'අ', line: 'සිංහලෙන් ඉදිරියට යන්න' },
  ta: { letter: 'அ', line: 'தமிழில் தொடரவும்' },
  en: { letter: 'A', line: 'Continue in English' },
};

// page 1: choose the language
function LanguagePage() {
  return (
    <Layout>
      {/* "Welcome" in 3 languages, in one row */}
      <div className="welcome">
        <div className="welcome-words">
          <span>ආයුබෝවන්!</span>
          <span>வணக்கம்!</span>
          <span>Welcome!</span>
        </div>
      </div>

      <h2 className="question lang-question">
        කරුණාකර භාෂාව තෝරන්න.
        <br />
        தயவுசெய்து மொழியைத் தேர்ந்தெடுக்கவும்.
        <br />
        Please choose your language.
      </h2>

      <div className="lang-buttons">
        {ORDER.map((code) => (
          <NavLink key={code} to={`/${code}`} className="lang-button">
            <span className="lang-letter">{BUTTONS[code].letter}</span>
            <span className="lang-text">
              <strong>{TEXTS[code].language}</strong>
              <small>{BUTTONS[code].line}</small>
            </span>
            <span className="lang-arrow">›</span>
          </NavLink>
        ))}
      </div>
    </Layout>
  );
}

export default LanguagePage;
