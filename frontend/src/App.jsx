import { Routes, Route, Navigate } from 'react-router';
import LanguagePage from './pages/LanguagePage';
import DivisionsPage from './pages/DivisionsPage';
import './App.css';

// which page to show for each URL
function App() {
  return (
    <Routes>
      <Route path="/" element={<LanguagePage />} />
      <Route path="/:lang" element={<DivisionsPage />} />
      {/* any other URL goes back to the first page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;