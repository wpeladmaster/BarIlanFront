import React, { useState, useEffect } from 'react'; // Import useState hook
import { Link } from 'react-router-dom';
import '../style/Header.scss'; // Adjust your styles accordingly
import { PublicClientApplication } from '@azure/msal-browser';


const Header = ({ setMsalInstance, isAuthenticated, onLogout, setUserRole }) => {
  const [isAuthenticatedState, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  // Move MSAL configuration outside the component
  const msalConfig = {
    auth: {
      clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
      authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
      redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com"
    }
  };

  //const [msalInstance, setMsalInstance] = useState(null);

  useEffect(() => {
    const initializeMsal = async () => {
      const newMsalInstance = new PublicClientApplication(msalConfig);
      await newMsalInstance.initialize(msalConfig);
      setMsalInstance(newMsalInstance);
    };

    initializeMsal();
  }, []);

  console.log('msalInstance:', setMsalInstance);

  // Pass MSAL instance as a prop (assuming initialization happens elsewhere)
  const handleLogin = async (msalInstance) => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["user.read"] // Add necessary scopes
      });

      console.error('loginResponse:', loginResponse);

      setUserName(loginResponse.name);
      setUserRole(loginResponse.idTokenClaims.groups || []);
      setIsAuthenticated(true);
      console.log('Iam logged in');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async (msalInstance) => {
    try {
      msalInstance.logout();
      onLogout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header>
      <div className="auth-wrap">
        {isAuthenticatedState ? (
          <div className='inner'>
            <button onClick={() => handleLogout(setMsalInstance)}>Logout</button>
            <span>Welcome, {userName}</span>
          </div>
        ) : (
          <div className='inner'>
            <button onClick={() => handleLogin(setMsalInstance)}>Login</button>
          </div>
        )}
      </div>
      <div className='logo'>
        <img src='../../images/bar-ilan-logo.png' alt='Logo' />
      </div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {/* {userRole && userRole.includes('Admins') && (
            <li><Link to="/admin-search">Admin Search</Link></li>
          )} */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
