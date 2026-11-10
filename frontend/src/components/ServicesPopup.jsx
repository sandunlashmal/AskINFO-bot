import { useEffect } from 'react';
import { NavLink } from 'react-router';
import Status from './Status';
import { useApi } from '../api';
import { TEXTS } from '../texts';

// popup with the services of one division
function ServicesPopup({ lang, division, number, onClose }) {
  const t = TEXTS[lang];
  const { data: services, loading, error } = useApi(
    `api/services.php?division_id=${division.id}&lang=${lang}`,
  );

  // close the popup with the Esc key
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    // clicking the dark area outside the box closes the popup
    <div className="popup-backdrop" onClick={onClose}>
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-label={division.name}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="popup-head">
          <h2 className="title popup-title">
            {/* the same number as on the division button */}
            <span className="division-number">{number}</span>
            {division.name}
          </h2>
          <button className="popup-close" onClick={onClose}>
            {/* a thick X, it turns red on hover */}
            <svg className="close-x" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {t.close}
          </button>
        </div>

        <p className="question">{t.chooseService}</p>
        <Status lang={lang} loading={loading} error={error} />

        {/* the list loaded but it is empty */}
        {services?.length === 0 && <p className="note">{t.noServices}</p>}

        <div className="service-list">
          {services?.map((service) => (
            <NavLink key={service.id} to={`/${lang}/services/${service.id}`} className="service-button">
              {/* a small paper icon */}
              <span className="service-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="service-title">{service.title}</span>
              <span className="division-arrow">›</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServicesPopup;
