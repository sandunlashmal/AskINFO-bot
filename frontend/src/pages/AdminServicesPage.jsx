import { useState } from 'react';
import AdminPage from '../components/AdminPage';
import Field from '../components/Field';
import { getJSON, sendJSON, useApi } from '../api';

// an empty form for a new service
const EMPTY_SERVICE = {
  division_id: '', officer_id: '',
  title: '', title_si: '', title_ta: '',
  description: '', description_si: '', description_ta: '',
  procedure: '', procedure_si: '', procedure_ta: '',
  required_documents: '', required_documents_si: '', required_documents_ta: '',
  fee: '',
  processing_time: '', processing_time_si: '', processing_time_ta: '',
};

// admin page: add, edit and delete services
function AdminServicesPage() {
  // show the services of one division only ('' = all)
  const [filter, setFilter] = useState('');
  // change this number to load the list again
  const [reload, setReload] = useState(0);
  const { data: services, loading, error } = useApi(`admin/services.php?reload=${reload}`);
  // for the "Division" and "Officer" lists in the form
  const { data: divisions } = useApi('admin/divisions.php');
  const { data: officers } = useApi(`admin/officers.php?reload=${reload}`);

  // the service in the form (null = show the list)
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);

  // open the form (empty for a new one, filled for an old one)
  function openForm(service) {
    // null values from the database become empty boxes
    const values = { ...EMPTY_SERVICE };
    for (const key in values) {
      values[key] = service?.[key] ?? '';
    }
    // a new service starts in the division of the filter
    if (!service) {
      values.division_id = filter;
    }
    setEditing({ id: service?.id, ...values });
    setMessage(null);
  }

  // the list has only the title, so load all the languages first
  function editService(id) {
    setMessage(null);
    getJSON(`admin/services.php?id=${id}`)
      .then((service) => openForm(service))
      .catch(() => setMessage({ ok: false, text: 'Could not load the service. (සේවාව ලබා ගැනීමට නොහැකි විය.)' }));
  }

  // change one box in the form
  function change(key, value) {
    const next = { ...editing, [key]: value };
    // a new division: the officer must be from that division
    if (key === 'division_id') {
      const officer = (officers ?? []).find((item) => String(item.id) === String(next.officer_id));
      if (officer && String(officer.division_id) !== String(value)) {
        next.officer_id = '';
      }
    }
    setEditing(next);
  }

  function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    // new service = POST, old service = PUT with its id
    const request = editing.id
      ? sendJSON(`admin/services.php?id=${editing.id}`, 'PUT', editing)
      : sendJSON('admin/services.php', 'POST', editing);

    request
      .then(() => {
        setMessage({ ok: true, text: 'Saved. (සුරකින ලදී.)' });
        setEditing(null);
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setBusy(false));
  }

  function remove(service) {
    // ask first, a delete can not be undone (its PDF forms go too)
    if (!window.confirm(`Delete "${service.title}" and its PDF forms? (මෙම සේවාව සහ එහි අයදුම්පත් ඉවත් කරන්නද?)`)) {
      return;
    }
    setMessage(null);
    sendJSON(`admin/services.php?id=${service.id}`, 'DELETE')
      .then(() => {
        setMessage({ ok: true, text: 'Deleted. (ඉවත් කරන ලදී.)' });
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }));
  }

  const note = message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>;
  // the divisions as { value, label } for the lists
  const divisionOptions = (divisions ?? []).map((division) => ({ value: division.id, label: division.name }));

  // the form (add or edit)
  if (editing) {
    // only the officers of the chosen division
    const officerOptions = (officers ?? [])
      .filter((officer) => String(officer.division_id) === String(editing.division_id))
      .map((officer) => ({ value: officer.id, label: `${officer.name} (${officer.designation})` }));

    // one box for each language, with Google Translate under SI and TA
    function threeLanguages(key, label, labelSi, type) {
      return (
        <>
          <Field label={`${label} in English (${labelSi} ඉංග්‍රීසියෙන්)`} type={type} value={editing[key]} onChange={(value) => change(key, value)} required={key === 'title'} />
          <Field label={`${label} in Sinhala (${labelSi} සිංහලෙන්)`} type={type} value={editing[`${key}_si`]} onChange={(value) => change(`${key}_si`, value)} translate={{ from: editing[key], to: 'si' }} />
          <Field label={`${label} in Tamil (${labelSi} දෙමළෙන්)`} type={type} value={editing[`${key}_ta`]} onChange={(value) => change(`${key}_ta`, value)} translate={{ from: editing[key], to: 'ta' }} />
        </>
      );
    }

    return (
      <AdminPage title={editing.id ? 'Edit service (සේවාව සංස්කරණය)' : 'Add service (සේවාවක් එක් කිරීම)'}>
        <form className="admin-form" onSubmit={save}>
          <Field label="Division (අංශය) *" type="select" options={divisionOptions} value={editing.division_id} onChange={(value) => change('division_id', value)} required />
          <Field label="Officer (නිලධාරියා)" type="select" options={officerOptions} emptyLabel="-- No officer (නිලධාරියෙකු නැත) --" value={editing.officer_id} onChange={(value) => change('officer_id', value)} />
          <p className="note">Only the officers of the chosen division are shown. (තෝරාගත් අංශයේ නිලධාරීන් පමණක් පෙන්වයි.)</p>

          <h3 className="form-part">1. Name (නම)</h3>
          {threeLanguages('title', 'Name', 'නම', 'text')}

          <h3 className="form-part">2. Description (විස්තරය)</h3>
          {threeLanguages('description', 'Description', 'විස්තරය', 'textarea')}

          <h3 className="form-part">3. Steps (අනුගමනය කළ යුතු පියවර)</h3>
          <p className="note">One step on one line. Press Enter for the next step. (එක් පේළියකට එක් පියවරක් බැගින්.)</p>
          {threeLanguages('procedure', 'Steps', 'පියවර', 'textarea')}

          <h3 className="form-part">4. Documents (ඉදිරිපත් කළ යුතු ලේඛන)</h3>
          <p className="note">One document on one line. (එක් පේළියකට එක් ලේඛනයක් බැගින්.)</p>
          {threeLanguages('required_documents', 'Documents', 'ලේඛන', 'textarea')}

          <h3 className="form-part">5. Fee and time (ගාස්තුව සහ කාලය)</h3>
          <Field label="Fee, e.g. Rs. 100 or Free (ගාස්තුව)" value={editing.fee} onChange={(value) => change('fee', value)} />
          {threeLanguages('processing_time', 'Time', 'කාලය', 'text')}

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

  // the services of the chosen division (or all)
  const shown = (services ?? []).filter((service) => !filter || String(service.division_id) === String(filter));

  // the list
  return (
    <AdminPage title="Services (සේවා)">
      <button className="primary add-button" type="button" onClick={() => openForm(null)}>
        + Add service (සේවාවක් එක් කරන්න)
      </button>

      <div className="admin-form list-filter">
        <Field label="Show division (අංශය පෙන්වන්න)" type="select" options={divisionOptions} value={filter} onChange={setFilter} emptyLabel="All divisions (සියලු අංශ)" />
      </div>

      {note}

      {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}
      {error && <p className="note error">Could not load the services. (සේවා ලබා ගැනීමට නොහැකි විය.)</p>}

      {services && shown.length === 0 && (
        <p className="note">No services yet. (තවමත් සේවා ඇතුළත් කර නොමැත.)</p>
      )}

      {services && (
        <div className="admin-list">
          {shown.map((service) => (
            <div key={service.id} className="admin-row">
              <div className="admin-row-text">
                <strong>{service.title}</strong>
                <small>{service.division_name}</small>
              </div>
              <div className="admin-row-buttons">
                <button className="secondary" type="button" onClick={() => editService(service.id)}>
                  Edit (සංස්කරණය)
                </button>
                <button className="danger" type="button" onClick={() => remove(service)}>
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

export default AdminServicesPage;
