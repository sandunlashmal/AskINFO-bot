import { useState } from 'react';
import AdminPage from '../components/AdminPage';
import Field from '../components/Field';
import { sendJSON, useApi } from '../api';

// an empty form for a new division
const EMPTY_DIVISION = {
  name: '', name_si: '', name_ta: '',
  description: '', description_si: '', description_ta: '',
  sort_order: '',
};

// admin page: add, edit and delete divisions
function AdminDivisionsPage() {
  // change this number to load the list again
  const [reload, setReload] = useState(0);
  const { data: divisions, loading, error } = useApi(`admin/divisions.php?reload=${reload}`);

  // the division in the form (null = show the list)
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);

  // open the form (empty for a new one, filled for an old one)
  function openForm(division) {
    // null values from the database become empty boxes
    const values = { ...EMPTY_DIVISION };
    for (const key in values) {
      values[key] = division?.[key] ?? '';
    }
    setEditing({ id: division?.id, ...values });
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

    // new division = POST, old division = PUT with its id
    const request = editing.id
      ? sendJSON(`admin/divisions.php?id=${editing.id}`, 'PUT', editing)
      : sendJSON('admin/divisions.php', 'POST', editing);

    request
      .then(() => {
        setMessage({ ok: true, text: 'Saved. (සුරකින ලදී.)' });
        setEditing(null);
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setBusy(false));
  }

  function remove(division) {
    // ask first, a delete can not be undone
    if (!window.confirm(`Delete "${division.name}"? (මෙම අංශය ඉවත් කරන්නද?)`)) {
      return;
    }
    setMessage(null);
    sendJSON(`admin/divisions.php?id=${division.id}`, 'DELETE')
      .then(() => {
        setMessage({ ok: true, text: 'Deleted. (ඉවත් කරන ලදී.)' });
        setReload(reload + 1);
      })
      .catch((error) => {
        if (error.status === 409) {
          setMessage({
            ok: false,
            text: 'This division still has services or officers. Move or delete them first. (මෙම අංශයට තවමත් සේවා හෝ නිලධාරීන් ඇතුළත් වී ඇත. පළමුව ඒවා වෙනත් අංශයකට මාරු කරන්න, නැතහොත් ඉවත් කරන්න.)',
          });
        } else {
          setMessage({ ok: false, text: error.message });
        }
      });
  }

  const note = message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>;

  // the form (add or edit)
  if (editing) {
    return (
      <AdminPage title={editing.id ? 'Edit division (අංශය සංස්කරණය)' : 'Add division (අංශයක් එක් කිරීම)'}>
        <form className="admin-form" onSubmit={save}>
          <Field label="Name in English (නම ඉංග්‍රීසියෙන්) *" value={editing.name} onChange={(value) => change('name', value)} required />
          <Field label="Name in Sinhala (නම සිංහලෙන්)" value={editing.name_si} onChange={(value) => change('name_si', value)} translate={{ from: editing.name, to: 'si' }} />
          <Field label="Name in Tamil (නම දෙමළෙන්)" value={editing.name_ta} onChange={(value) => change('name_ta', value)} translate={{ from: editing.name, to: 'ta' }} />

          <Field label="Description in English (විස්තරය ඉංග්‍රීසියෙන්)" type="textarea" rows={3} value={editing.description} onChange={(value) => change('description', value)} />
          <Field label="Description in Sinhala (විස්තරය සිංහලෙන්)" type="textarea" rows={3} value={editing.description_si} onChange={(value) => change('description_si', value)} translate={{ from: editing.description, to: 'si' }} />
          <Field label="Description in Tamil (විස්තරය දෙමළෙන්)" type="textarea" rows={3} value={editing.description_ta} onChange={(value) => change('description_ta', value)} translate={{ from: editing.description, to: 'ta' }} />

          <Field label="Place in the menu: 1, 2, 3 ... (මෙනුවේ ස්ථානය)" type="number" value={editing.sort_order} onChange={(value) => change('sort_order', value)} />
          <p className="note">Empty = at the end. (හිස්ව තැබුවහොත් අවසානයට එක් වේ.)</p>

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
    <AdminPage title="Divisions (අංශ)">
      <button className="primary add-button" type="button" onClick={() => openForm(null)}>
        + Add division (අංශයක් එක් කරන්න)
      </button>

      {note}

      {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}
      {error && <p className="note error">Could not load the divisions. (අංශ ලබා ගැනීමට නොහැකි විය.)</p>}

      {divisions && divisions.length === 0 && (
        <p className="note">No divisions yet. (තවමත් අංශ ඇතුළත් කර නොමැත.)</p>
      )}

      {divisions && (
        <div className="admin-list">
          {divisions.map((division) => (
            <div key={division.id} className="admin-row">
              <div className="admin-row-text">
                <strong>{division.sort_order}. {division.name}</strong>
                {/* show what is missing, so the staff can fill it */}
                <small>{division.name_si || '⚠ No Sinhala name (සිංහල නම නැත)'}</small>
                <small>{division.name_ta || '⚠ No Tamil name (දෙමළ නම නැත)'}</small>
              </div>
              <div className="admin-row-buttons">
                <button className="secondary" type="button" onClick={() => openForm(division)}>
                  Edit (සංස්කරණය)
                </button>
                <button className="danger" type="button" onClick={() => remove(division)}>
                  Delete (ඉවත් කරන්න)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}

export default AdminDivisionsPage;
