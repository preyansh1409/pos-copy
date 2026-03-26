import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <h1>Welcome to Garment ERP</h1>
      <div className="login-options">
        <button onClick={() => navigate('/login')}>User Login</button>
        <button onClick={() => navigate('/superadmin-login')}>Super Admin Login</button>
      </div>
    </div>
  );
};

export default LandingPage;
