import { useEffect, useState } from 'react';

// address of our PHP backend
const API_URL = 'http://localhost/AskINFO-bot/backend';

// get JSON data from the backend
export async function getJSON(path) {
  const res = await fetch(`${API_URL}/${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
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