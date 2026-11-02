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
      <h2 className="question">{t.chooseDivision}</h2>
      <Status lang={lang} loading={loading} error={error} />

      <div className="menu">
        {divisions?.map((division) => (
          <button key={division.id} className="menu-item" onClick={() => setOpenDivision(division)}>
            {division.name}
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