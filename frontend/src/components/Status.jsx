import { TEXTS } from '../texts';

// "loading" or "error" message while data comes from the API
function Status({ lang, loading, error }) {
  const t = TEXTS[lang];

  if (loading) {
    return <p className="note">{t.loading}</p>;
  }
  if (error) {
    return <p className="note error">{t.error}</p>;
  }
  return null;
}

export default Status;