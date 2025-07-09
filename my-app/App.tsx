
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ClientApp from './components/ClientApp';
import HRDashboard from './components/HRDashboard';
import './styles/theme.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/hr" element={<LoginPage userType="hr" />} />
        <Route path="/login/client" element={<LoginPage userType="client" />} />
        <Route path="/app-client" element={<ClientApp />} />
        <Route path="/hr" element={<HRDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
