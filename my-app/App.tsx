
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ClientApp from './components/ClientApp';
import HRDashboard from './components/HRDashboard';
import EmployeeApp from './components/EmployeeApp';
import ThemeLoader from './components/ThemeLoader';
import './styles/theme-admin.css';
import './styles/theme-employee.css';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeLoader />
      <Routes>
        {/* Landing and Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/hr" element={<LoginPage userType="hr" />} />
        <Route path="/login/client" element={<LoginPage userType="client" />} />
        
        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeApp />} />
        <Route path="/app-client" element={<EmployeeApp />} />
        <Route path="/client" element={<Navigate to="/employee" replace />} />
        
        {/* HR Routes */}
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/hr/analytics" element={<HRDashboard />} />
        <Route path="/hr/expenses" element={<HRDashboard />} />
        <Route path="/hr/employees" element={<HRDashboard />} />
        <Route path="/admin" element={<Navigate to="/hr" replace />} />
        <Route path="/dashboard" element={<Navigate to="/hr" replace />} />
        
        {/* Fallback Routes */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
