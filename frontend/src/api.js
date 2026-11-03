import { useEffect, useState } from 'react';

// address of our PHP backend
const API_URL = 'http://localhost/AskINFO-bot/backend';

// get JSON data from the backend
export async function getJSON(path) {
  // credentials: 'include' sends the login cookie too (needed for admin pages)
  const res = await fetch(`${API_URL}/${path}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

// send JSON data to the backend, e.g. login, add, edit, delete
export async function sendJSON(path, method, body) {
  const res = await fetch(`${API_URL}/${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  // read the answer (an empty answer becomes {})
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // keep the PHP message and the status code, e.g. 401
    const error = new Error(data.error || `Request failed: ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

// load data inside a page, e.g. useApi('api/divisions.php?lang=si')
export function useApi(path) {
  const [result, setResult] = useState({});

  // load again when the path changes
  useEffect(() => {
    getJSON(path)
      .then((data) => setResult({ path, data }))
      .catch(() => setResult({ path, error: true }));
  }, [path]);

  // the result is for this path only after it has loaded
  const ready = result.path === path;
  return {
    data: ready ? result.data : null,
    error: ready && result.error === true,
    loading: !ready,
  };
}