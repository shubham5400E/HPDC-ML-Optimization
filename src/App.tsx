import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CadUpload from './pages/CadUpload';
import Recommendations from './pages/Recommendations';
import Feedback from './pages/Feedback';
import OptimizationHistory from './pages/OptimizationHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cad-upload" element={<CadUpload />} />
          <Route path="/recommendations/:sessionId" element={<Recommendations />} />
          <Route path="/feedback/:sessionId" element={<Feedback />} />
          <Route path="/history" element={<OptimizationHistory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
