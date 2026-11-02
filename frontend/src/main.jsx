import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter lets us use page URLs like /si */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);