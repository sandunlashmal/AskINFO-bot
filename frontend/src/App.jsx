import { useState } from 'react';
import { getJSON } from './api';
import { TEXTS } from './texts';
import './App.css';

function App() {
  // chosen language: null until the user picks one
  const [lang, setLang] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // texts of the chosen language (English before choosing)
  const t = TEXTS[lang || 'en'];

  // user clicked a language button
  function chooseLanguage(code) {
    setLang(code);
    setDivisions([]);
    setError(false);
    setLoading(true);

    // load the division menu in that language
    getJSON(`api/divisions.php?lang=${code}`)
      .then((data) => setDivisions(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <h1>Ask INFO bot</h1>
        <p>{t.office}</p>
      </header>

      <main className="chat-body">
        {/* first message in all 3 languages */}
        <div className="bubble bot">
          Please choose your language.
          <br />
          කරුණාකර භාෂාව තෝරන්න.
          <br />
          தயவுசெய்து மொழியைத் தேர்ந்தெடுக்கவும்.
        </div>

        <div className="options">
          {Object.keys(TEXTS).map((code) => (
            <button
              key={code}
              className={code === lang ? 'selected' : ''}
              onClick={() => chooseLanguage(code)}
            >
              {TEXTS[code].language}
            </button>
          ))}
        </div>

        {/* after a language is chosen */}
        {lang && (
          <>
            <div className="bubble user">{t.language}</div>
            <div className="bubble bot">{t.chooseDivision}</div>

            {loading && <p className="note">{t.loading}</p>}
            {error && <p className="note error">{t.error}</p>}

            <div className="options">
              {divisions.map((division) => (
                <button key={division.id}>{division.name}</button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;