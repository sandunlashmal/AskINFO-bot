import { useState } from 'react';
import AdminPage from '../components/AdminPage';
import Field from '../components/Field';
import { sendJSON, uploadFile, useApi } from '../api';

// admin page: upload and delete the PDF forms of a service
function AdminFormsPage() {
  // the service we are working on ('' = none chosen yet)
  const [serviceId, setServiceId] = useState('');
  const { data: services } = useApi('admin/services.php');

  // change this number to load the list again
  const [reload, setReload] = useState(0);
  // the forms of the chosen service (no service = no request)
  const formsPath = serviceId ? `admin/forms.php?service_id=${serviceId}&reload=${reload}` : 'admin/me.php';
  const { data, loading, error } = useApi(formsPath);
  const forms = serviceId ? data : null;

  // the upload form
  const [title, setTitle] = useState({ en: '', si: '', ta: '' });
  const [file, setFile] = useState(null);
  // a new number empties the file box after an upload
  const [fileBoxKey, setFileBoxKey] = useState(0);
  const [message, setMessage] = useState(null); // { ok: true/false, text: '...' }
  const [busy, setBusy] = useState(false);

  function chooseService(value) {
    setServiceId(value);
    setMessage(null);
  }

  function upload(event) {
    event.preventDefault();
    setMessage(null);

    // check in the browser first
    if (!file || file.type !== 'application/pdf') {
      setMessage({ ok: false, text: 'Please choose a PDF file. (කරුණාකර PDF ගොනුවක් තෝරන්න.)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ ok: false, text: 'The PDF must be smaller than 5 MB. (PDF ගොනුව 5 MB ට වඩා කුඩා විය යුතුය.)' });
      return;
    }

    // the text and the file go together as form data
    const formData = new FormData();
    formData.append('service_id', serviceId);
    formData.append('title', title.en);
    formData.append('title_si', title.si);
    formData.append('title_ta', title.ta);
    formData.append('file', file);

    setBusy(true);
    uploadFile('admin/forms.php', formData)
      .then(() => {
        setMessage({ ok: true, text: 'Uploaded. (උඩුගත කරන ලදී.)' });
        setTitle({ en: '', si: '', ta: '' });
        setFile(null);
        setFileBoxKey(fileBoxKey + 1);
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setBusy(false));
  }

  function remove(form) {
    // ask first, a delete can not be undone
    if (!window.confirm(`Delete "${form.title}"? (මෙම අයදුම්පත ඉවත් කරන්නද?)`)) {
      return;
    }
    setMessage(null);
    sendJSON(`admin/forms.php?id=${form.id}`, 'DELETE')
      .then(() => {
        setMessage({ ok: true, text: 'Deleted. (ඉවත් කරන ලදී.)' });
        setReload(reload + 1);
      })
      .catch((error) => setMessage({ ok: false, text: error.message }));
  }

  // the services as { value, label }, e.g. "Registrar · Birth certificate copy"
  const serviceOptions = (services ?? []).map((service) => ({
    value: service.id,
    label: `${service.division_name} · ${service.title}`,
  }));

  return (
    <AdminPage title="PDF forms (අයදුම්පත්)">
      <div className="admin-form list-filter">
        <Field label="Service (සේවාව)" type="select" options={serviceOptions} value={serviceId} onChange={chooseService} />
      </div>

      {!serviceId && (
        <p className="note">First choose a service. (පළමුව සේවාවක් තෝරන්න.)</p>
      )}

      {message && <p className={message.ok ? 'note success' : 'note error'}>{message.text}</p>}

      {serviceId && (
        <>
          {/* the forms of this service */}
          {loading && <p className="note">Please wait... (කරුණාකර රැඳී සිටින්න...)</p>}
          {error && <p className="note error">Could not load the forms. (අයදුම්පත් ලබා ගැනීමට නොහැකි විය.)</p>}
          {forms && forms.length === 0 && (
            <p className="note">No PDF forms for this service yet. (මෙම සේවාවට තවමත් අයදුම්පත් ඇතුළත් කර නොමැත.)</p>
          )}
          {forms && forms.length > 0 && (
            <div className="admin-list">
              {forms.map((form) => (
                <div key={form.id} className="admin-row">
                  <div className="admin-row-text">
                    <strong>📄 {form.title}</strong>
                    <small>{form.title_si || '⚠ No Sinhala name (සිංහල නම නැත)'}</small>
                    <small>{form.title_ta || '⚠ No Tamil name (දෙමළ නම නැත)'}</small>
                  </div>
                  <div className="admin-row-buttons">
                    <a className="secondary" href={form.url} target="_blank" rel="noreferrer">
                      Open (විවෘත කරන්න)
                    </a>
                    <button className="danger" type="button" onClick={() => remove(form)}>
                      Delete (ඉවත් කරන්න)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* upload a new form */}
          <form className="admin-form" onSubmit={upload}>
            <h3 className="form-part">Upload a new PDF form (නව අයදුම්පතක් උඩුගත කිරීම)</h3>
            <Field label="Form name in English (අයදුම්පතේ නම ඉංග්‍රීසියෙන්) *" value={title.en} onChange={(value) => setTitle({ ...title, en: value })} required />
            <Field label="Form name in Sinhala (අයදුම්පතේ නම සිංහලෙන්)" value={title.si} onChange={(value) => setTitle({ ...title, si: value })} translate={{ from: title.en, to: 'si' }} />
            <Field label="Form name in Tamil (අයදුම්පතේ නම දෙමළෙන්)" value={title.ta} onChange={(value) => setTitle({ ...title, ta: value })} translate={{ from: title.en, to: 'ta' }} />

            <label className="field">
              PDF file, max 5 MB (PDF ගොනුව, උපරිම 5 MB) *
              <input
                key={fileBoxKey}
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files[0] ?? null)}
                required
              />
            </label>

            <button className="primary" type="submit" disabled={busy}>
              {busy ? 'Please wait... (රැඳී සිටින්න...)' : 'Upload (උඩුගත කරන්න)'}
            </button>
          </form>
        </>
      )}
    </AdminPage>
  );
}

export default AdminFormsPage;
