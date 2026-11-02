import { Navigate, NavLink, useParams } from 'react-router';
import Layout from '../components/Layout';
import Status from '../components/Status';
import { useApi } from '../api';
import { TEXTS } from '../texts';

// split a text into lines and drop the empty ones
function toLines(text) {
  if (!text) {
    return [];
  }
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

// page 3: full details of one service
function ServicePage() {
  // e.g. /si/services/5 gives lang = 'si' and serviceId = '5'
  const { lang, serviceId } = useParams();
  const { data: service, loading, error } = useApi(
    `api/service.php?id=${serviceId}&lang=${lang}`,
  );

  // unknown language in the URL: go to the first page
  if (!TEXTS[lang]) {
    return <Navigate to="/" />;
  }
  const t = TEXTS[lang];

  const steps = toLines(service?.procedure);
  const documents = toLines(service?.required_documents);
  const officer = service?.officer;
  const forms = service?.forms ?? [];

  // true when the admin has not added any details yet
  const noDetails =
    service &&
    !service.description &&
    steps.length === 0 &&
    documents.length === 0 &&
    !service.fee &&
    !service.processing_time &&
    !officer &&
    forms.length === 0;

  return (
    <Layout lang={lang} backTo={`/${lang}`} backText={t.backToDivisions}>
      <Status lang={lang} loading={loading} error={error} />

      {service && (
        <>
          <p className="label">{service.division_name}</p>
          <h2 className="title">{service.title}</h2>
          {service.description && <p className="description">{service.description}</p>}

          {noDetails && <p className="note">{t.noDetails}</p>}

          {/* the steps, numbered 1, 2, 3 ... */}
          {steps.length > 0 && (
            <section className="box">
              <h3>{t.steps}</h3>
              <ol className="steps">
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {documents.length > 0 && (
            <section className="box">
              <h3>{t.documents}</h3>
              <ul className="documents">
                {documents.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </section>
          )}

          {/* fee and time side by side */}
          {(service.fee || service.processing_time) && (
            <div className="facts">
              {service.fee && (
                <div className="fact">
                  <span>{t.fee}</span>
                  <b>{service.fee}</b>
                </div>
              )}
              {service.processing_time && (
                <div className="fact">
                  <span>{t.time}</span>
                  <b>{service.processing_time}</b>
                </div>
              )}
            </div>
          )}

          {/* PDF forms: each one opens or downloads the file */}
          {forms.length > 0 && (
            <section className="box">
              <h3>{t.forms}</h3>
              <div className="downloads">
                {forms.map((form) => (
                  <a key={form.id} href={form.url} target="_blank" rel="noreferrer" className="download">
                    ⬇ {form.title} (PDF)
                  </a>
                ))}
              </div>
            </section>
          )}

          {officer && (
            <section className="box">
              <h3>{t.officer}</h3>
              <p className="officer-name">{officer.name}</p>
              {officer.designation && <p className="officer-role">{officer.designation}</p>}
              {/* tel: and mailto: open the phone or email app */}
              {officer.phone && (
                <a href={`tel:${officer.phone}`} className="contact">
                  📞 {officer.phone}
                </a>
              )}
              {officer.email && (
                <a href={`mailto:${officer.email}`} className="contact">
                  ✉ {officer.email}
                </a>
              )}
            </section>
          )}

          <NavLink to={`/${lang}`} className="menu-item bottom-back">
            ← {t.backToDivisions}
          </NavLink>
        </>
      )}
    </Layout>
  );
}

export default ServicePage;