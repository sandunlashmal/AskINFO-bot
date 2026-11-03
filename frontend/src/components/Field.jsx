// one form box with its label: text, email, password, number or long text
function Field({ label, type = 'text', value, onChange, rows, required, autoComplete }) {
  return (
    <label className="field">
      {label}
      {type === 'textarea' ? (
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
    </label>
  );
}

export default Field;
