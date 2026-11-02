import { useEffect } from 'react';
import { NavLink } from 'react-router';
import Status from './Status';
import { useApi } from '../api';
import { TEXTS } from '../texts';

// popup with the services of one division
function ServicesPopup({ lang, division, onClose }) {
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
          <h2 className="title">{division.name}</h2>
          <button className="popup-close" onClick={onClose}>
            ✕ {t.close}
          </button>
        </div>

        <p className="question">{t.chooseService}</p>
        <Status lang={lang} loading={loading} error={error} />

        {/* the list loaded but it is empty */}
        {services?.length === 0 && <p className="note">{t.noServices}</p>}

        <div className="menu">
          {services?.map((service) => (
            <NavLink key={service.id} to={`/${lang}/services/${service.id}`} className="menu-item">
              {service.title}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServicesPopup;