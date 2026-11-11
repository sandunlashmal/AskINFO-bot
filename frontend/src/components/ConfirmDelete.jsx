import { useEffect } from 'react';

// a popup that asks "Delete this?" before deleting
// title = English question, titleSi = Sinhala question, name = the item,
// note = an extra warning (can be empty), onYes / onNo = what to do
function ConfirmDelete({ title, titleSi, name, note, busy, onYes, onNo }) {
  // the Esc key closes the popup
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onNo();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNo]);

  return (
    // a click on the dark part outside also closes it
    <div className="confirm-backdrop" onClick={onNo}>
      <div className="confirm-box" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        {/* a red bin in a light red circle */}
        <span className="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3" />
          </svg>
        </span>

        <h3 className="confirm-title">
          {title}
          <span>{titleSi}</span>
        </h3>
        <p className="confirm-name">{name}</p>
        {note && <p className="confirm-note">{note}</p>}
        <p className="confirm-warning">
          This can not be undone.
          <br />
          මෙය ආපසු හැරවිය නොහැක.
        </p>

        <div className="confirm-buttons">
          <button className="confirm-no" type="button" onClick={onNo} autoFocus>
            Cancel (අවලංගු කරන්න)
          </button>
          <button className="confirm-yes" type="button" onClick={onYes} disabled={busy}>
            {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Delete (ඉවත් කරන්න)'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;
