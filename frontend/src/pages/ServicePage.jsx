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

// the word on the PDF download button
const DOWNLOAD = { en: 'Download', si: 'බාගත කරන්න', ta: 'பதிவிறக்கவும்' };

// small line icons for the box headings (24 x 24 drawings)
const ICONS = {
  steps: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  documents: 'M7 3h7l5 5v13H7z M14 3v5h5',
  forms: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  officer: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
  fee: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
  time: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
};

function Icon({ name, size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={ICONS[name]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// a box heading with its icon
function BoxTitle({ icon, children }) {
  return (
    <h3 className="box-title">
      <span className="box-icon"><Icon name={icon} /></span>
      {children}
    </h3>
  );
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
    <Layout lang={lang} backTo={`/${lang}`} backText={t.backToDivisions} smallBack>
      <Status lang={lang} loading={loading} error={error} />

      {service && (
        <>
          {/* the division as a small tag, then the service name */}
          <span className="division-tag">{service.division_name}</span>
          <h2 className="title service-title-big">{service.title}</h2>
          {service.description && <p className="description">{service.description}</p>}

          {noDetails && <p className="note">{t.noDetails}</p>}

          {/* the steps, numbered 1, 2, 3 ... */}
          {steps.length > 0 && (
            <section className="box">
              <BoxTitle icon="steps">{t.steps}</BoxTitle>
              <ol className="steps">
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {documents.length > 0 && (
            <section className="box">
              <BoxTitle icon="documents">{t.documents}</BoxTitle>
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
                  <span className="fact-icon"><Icon name="fee" /></span>
                  <span>{t.fee}</span>
                  <b>{service.fee}</b>
                </div>
              )}
              {service.processing_time && (
                <div className="fact">
                  <span className="fact-icon"><Icon name="time" /></span>
                  <span>{t.time}</span>
                  <b>{service.processing_time}</b>
                </div>
              )}
            </div>
          )}

          {/* PDF forms: each one opens or downloads the file */}
          {forms.length > 0 && (
            <section className="box">
              <BoxTitle icon="forms">{t.forms}</BoxTitle>
              <div className="downloads">
                {forms.map((form) => (
                  <a key={form.id} href={form.url} target="_blank" rel="noreferrer" className="download">
                    {/* a red PDF file picture */}
                    <span className="pdf-icon">PDF</span>
                    <span className="download-name">{form.title}</span>
                    <span className="download-button">
                      <Icon name="forms" size={16} />
                      {DOWNLOAD[lang]}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {officer && (
            <section className="box">
              <BoxTitle icon="officer">{t.officer}</BoxTitle>
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

          <NavLink to={`/${lang}`} className="back bottom-back">
            <svg className="back-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M20 12H5M11 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.backToDivisions}
          </NavLink>
        </>
      )}
    </Layout>
  );
}

export default ServicePage;
