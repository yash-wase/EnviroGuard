import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import CounterMeasures from './pages/CounterMeasures';
import Ranking from './pages/Ranking';
import Guidelines from './pages/Guidelines';

function App() {
  return (
    <AppProvider>
      <Router>
        <Topbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/counter" element={<CounterMeasures />} />
          <Route path="/dashboard/ranking" element={<Ranking />} />
          <Route path="/dashboard/guidelines" element={<Guidelines />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
