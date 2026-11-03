// one form box with its label: text, email, password, number, long text or a list
// options = [{ value: 1, label: 'Land' }, ...] for type="select"
// translate = { from: 'English text', to: 'si' or 'ta' } shows a Google Translate link
function Field({ label, type = 'text', value, onChange, rows, required, autoComplete, translate, options }) {
  return (
    <label className="field">
      {label}
      {type === 'select' ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
          <option value="">-- Choose (තෝරන්න) --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          rows={rows || 4}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          autoComplete={autoComplete}
        />
      )}
      {translate && <TranslateLink from={translate.from} to={translate.to} />}
    </label>
  );
}

// opens Google Translate in a new tab with the English text in it
function TranslateLink({ from, to }) {
  // nothing to translate yet
  if (!from) {
    return <small className="translate-note">🌐 Type the English first. (පළමුව ඉංග්‍රීසියෙන් ඇතුළත් කරන්න.)</small>;
  }

  const url = `https://translate.google.com/?sl=en&tl=${to}&text=${encodeURIComponent(from)}&op=translate`;
  return (
    <small className="translate-note">
      <a href={url} target="_blank" rel="noreferrer" className="translate-link">
        🌐 Google Translate
      </a>{' '}
      Copy, paste here and check the words. (පිටපත් කර මෙහි ඇතුළත් කර, පරිවර්තනය පරීක්ෂා කරන්න.)
    </small>
  );
}

export default Field;
