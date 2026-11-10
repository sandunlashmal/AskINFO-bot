import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import Layout from '../components/Layout';
import Status from '../components/Status';
import ServicesPopup from '../components/ServicesPopup';
import { useApi } from '../api';
import { TEXTS } from '../texts';

// page 2: the division menu
function DivisionsPage() {
  // the language comes from the URL, e.g. /si
  const { lang } = useParams();
  const { data: divisions, loading, error } = useApi(`api/divisions.php?lang=${lang}`);

  // the division whose popup is open (null = no popup)
  const [openDivision, setOpenDivision] = useState(null);

  // unknown language in the URL: go to the first page
  if (!TEXTS[lang]) {
    return <Navigate to="/" />;
  }
  const t = TEXTS[lang];

  return (
    <Layout lang={lang} backTo="/" backText={t.changeLanguage}>
      <h2 className="question division-question">{t.chooseDivision}</h2>
      <Status lang={lang} loading={loading} error={error} />

      <div className="division-list">
        {divisions?.map((division, index) => (
          <button key={division.id} className="division-button" onClick={() => setOpenDivision(division)}>
            {/* the number of the division in a circle */}
            <span className="division-number">{index + 1}</span>
            <span className="division-text">
              <strong>{division.name}</strong>
              {/* the short description, only if the staff added one */}
              {division.description && <small>{division.description}</small>}
            </span>
            <span className="division-arrow">›</span>
          </button>
        ))}
      </div>

      {openDivision && (
        <ServicesPopup lang={lang} division={openDivision} onClose={() => setOpenDivision(null)} />
      )}
    </Layout>
  );
}

export default DivisionsPage;
