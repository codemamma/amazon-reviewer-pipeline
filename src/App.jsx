import { Routes, Route, Navigate } from 'react-router-dom';
import AuthorSetupPage from './pages/AuthorSetupPage';
import ReaderReviewPage from './pages/ReaderReviewPage';
import AuthorDashboardPage from './pages/AuthorDashboardPage';
import './App.css';
import './components/Dashboard.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/create" replace />} />
      <Route path="/create" element={<AuthorSetupPage />} />
      <Route path="/review/:slug" element={<ReaderReviewPage />} />
      <Route path="/dashboard/:slug" element={<AuthorDashboardPage />} />
    </Routes>
  );
}

export default App;
