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