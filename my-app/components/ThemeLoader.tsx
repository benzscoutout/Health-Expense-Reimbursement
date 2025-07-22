import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeLoader: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove existing theme classes
    document.body.classList.remove('theme-admin', 'theme-employee');
    
    // Add appropriate theme class based on route
    if (location.pathname.startsWith('/hr') || location.pathname.startsWith('/admin')) {
      document.body.classList.add('theme-admin');
    } else if (location.pathname.startsWith('/employee') || location.pathname.startsWith('/app-client') || location.pathname.startsWith('/client')) {
      document.body.classList.add('theme-employee');
    }
  }, [location.pathname]);

  return null;
};

export default ThemeLoader; 