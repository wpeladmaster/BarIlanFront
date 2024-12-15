import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss';
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'aadb3f2f-d35f-4080-bc72-2ee32b741120',
    authority: 'https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7',
    redirectUri: 'https://main.d3u5rxv1b6pn2o.amplifyapp.com',
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const Header = ({ setIsAuthenticated, setUserName, setUserRole, setUserCustomId }) => {
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const accounts = msalInstance.getAllAccounts();
        const userAccount = accounts[0];

        if (userAccount) {
          const claims = userAccount.idTokenClaims;
          setUserName(userAccount.name);
          setUserRole(claims.groups || []);
          setUserCustomId(claims.extension_CustomID || ''); // Example of custom claim
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session Check Error:', err);
        setIsAuthenticated(false);
      }
    };

    checkUserSession();
  }, [setIsAuthenticated, setUserName, setUserRole, setUserCustomId]);

  const handleLogin = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['user.read', 'openid', 'profile'], // Add required scopes
      });
      const claims = loginResponse.idTokenClaims;
      setUserName(loginResponse.account.name);
      setUserRole(claims.groups || []);
      setUserCustomId(claims.extension_CustomID || '');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await msalInstance.logoutPopup();
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setUserCustomId('');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <header>
      <div className="auth-wrap">
        {msalInstance.getAllAccounts().length > 0 ? (
          <div className="inner">
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="inner">
            <button onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>
      <div className="logo">
        <img src="../../images/bar-ilan-logo.png" alt="Logo" />
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
