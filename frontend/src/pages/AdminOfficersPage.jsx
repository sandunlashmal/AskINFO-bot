import { useState } from 'react';
import AdminPage from '../components/AdminPage';
import Field from '../components/Field';
import ConfirmDelete from '../components/ConfirmDelete';
import { sendJSON, useApi } from '../api';

// an empty form for a new officer
const EMPTY_OFFICER = {
  division_id: '', name: '',
  designation: '', designation_si: '', designation_ta: '',
  phone: '', email: '',
};

// admin page: add, edit and delete officers
function AdminOfficersPage() {
  // change this number to load the list again
  const [reload, setReload] = useState(0);
  const { data: officers, loading, error } = useApi(`admin/officers.php?reload=${reload}`);
  // the divisions for the "Division" list in the form
  const { data: divisions } = useApi('admin/divisions.php');

  // the officer in the form (null = show the list)
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);
  // the officer in the "Delete?" popup (null = no popup)
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // open the form (empty for a new one, filled for an old one)
  function openForm(officer) {
    // null values from the database become empty boxes
    const values = { ...EMPTY_OFFICER };
    for (const key in values) {
      values[key] = officer?.[key] ?? '';
    }
    setEditing({ id: officer?.id, ...values });
    setMessage(null);
  }

  // change one box in the form
  function change(key, value) {
    setEditing({ ...editing, [key]: value });
  }

  function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    // new officer = POST, old officer = PUT with its id
    const request = editing.id
      ? sendJSON(`admin/officers.php?id=${editing.id}`, 'PUT', editing)
      : sendJSON('admin/officers.php', 'POST', editing);

    request
      .then(() => {
        setMessage({ ok: true, text: 'Saved. (සුරකින ලදී.)' });
        setEditing(null);
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setBusy(false));
  }

  // the user said "Delete" in the popup
  function remove(officer) {
    setMessage(null);
    setDeleting(true);
    sendJSON(`admin/officers.php?id=${officer.id}`, 'DELETE')
      .then(() => {
        setMessage({ ok: true, text: 'Deleted. (ඉවත් කරන ලදී.)' });
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => {
        setDeleting(false);
        setToDelete(null);
      });
  }

  const note = message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>;

  // the form (add or edit)
  if (editing) {
    // the divisions as { value, label } for the list
    const divisionOptions = (divisions ?? []).map((division) => ({ value: division.id, label: division.name }));

    return (
      <AdminPage title={editing.id ? 'Edit officer (නිලධාරියා සංස්කරණය)' : 'Add officer (නිලධාරියෙකු එක් කිරීම)'}>
        <form className="admin-form" onSubmit={save}>
          <Field label="Division (අංශය) *" type="select" options={divisionOptions} value={editing.division_id} onChange={(value) => change('division_id', value)} required />
          <Field label="Name (නම) *" value={editing.name} onChange={(value) => change('name', value)} required />

          <Field label="Designation in English (තනතුර ඉංග්‍රීසියෙන්) *" value={editing.designation} onChange={(value) => change('designation', value)} required />
          <Field label="Designation in Sinhala (තනතුර සිංහලෙන්)" value={editing.designation_si} onChange={(value) => change('designation_si', value)} translate={{ from: editing.designation, to: 'si' }} />
          <Field label="Designation in Tamil (තනතුර දෙමළෙන්)" value={editing.designation_ta} onChange={(value) => change('designation_ta', value)} translate={{ from: editing.designation, to: 'ta' }} />

          <Field label="Phone (දුරකථන අංකය)" type="tel" value={editing.phone} onChange={(value) => change('phone', value)} />
          <Field label="Email (ඊමේල් ලිපිනය)" type="email" value={editing.email} onChange={(value) => change('email', value)} />

          {note}

          <div className="form-buttons">
            <button className="primary" type="submit" disabled={busy}>
              {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Save (සුරකින්න)'}
            </button>
            <button className="secondary" type="button" onClick={() => setEditing(null)}>
              Cancel (අවලංගු කරන්න)
            </button>
          </div>
        </form>
      </AdminPage>
    );
  }

  // the list
  return (
    <AdminPage title="Officers (නිලධාරීන්)">
      <button className="primary add-button" type="button" onClick={() => openForm(null)}>
        + Add officer (නිලධාරියෙකු එක් කරන්න)
      </button>

      {note}

      {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}
      {error && <p className="note error">Could not load the officers. (නිලධාරීන් ලබා ගැනීමට නොහැකි විය.)</p>}

      {officers && officers.length === 0 && (
        <p className="note">No officers yet. (තවමත් නිලධාරීන් ඇතුළත් කර නොමැත.)</p>
      )}

      {officers && (
        <div className="admin-list">
          {officers.map((officer) => (
            <div key={officer.id} className="admin-row">
              <div className="admin-row-text">
                <strong>{officer.name}</strong>
                <small>
                  {officer.designation} · {officer.division_name}
                </small>
                {/* show what is missing, so the staff can fill it */}
                {(!officer.designation_si || !officer.designation_ta) && (
                  <small>⚠ No Sinhala / Tamil designation (සිංහල / දෙමළ තනතුර නැත)</small>
                )}
                {officer.phone && <small>📞 {officer.phone}</small>}
              </div>
              <div className="admin-row-buttons">
                <button className="secondary" type="button" onClick={() => openForm(officer)}>
                  <Icon path="M4 20h4L19 9l-4-4L4 16z M14 6l4 4" />
                  Edit (සංස්කරණය)
                </button>
                <button className="danger" type="button" onClick={() => setToDelete(officer)}>
                  <Icon path="M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3" />
                  Delete (ඉවත් කරන්න)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ask first, a delete can not be undone */}
      {toDelete && (
        <ConfirmDelete
          title="Delete this officer?"
          titleSi="මෙම නිලධාරියා ඉවත් කරන්නද?"
          name={toDelete.name}
          busy={deleting}
          onYes={() => remove(toDelete)}
          onNo={() => setToDelete(null)}
        />
      )}
    </AdminPage>
  );
}

// a small line icon
function Icon({ path, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default AdminOfficersPage;
