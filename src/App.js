import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './style/global.scss';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import { PublicClientApplication } from '@azure/msal-browser';
import fetchGroupNames from './utils/fetchGroupNames'; // Import the updated fetchGroupNames
import { loginRequest } from './authConfig';

const App = () => {
  const { accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]); // State to store fetched group names
  const [msalInstance, setMsalInstance] = useState(null);

  const msalConfig = {
    auth: {
      clientId: 'aadb3f2f-d35f-4080-bc72-2ee32b741120',
      authority: 'https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2',
      redirectUri: 'https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage',
    },
  };

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const newMsalInstance = new PublicClientApplication(msalConfig);
        setMsalInstance(newMsalInstance);
      } catch (error) {
        console.error('Error initializing MSAL:', error);
      }
    };

    initializeMsal();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('App.js: Checking user session...');
        if (!msalInstance) {
          console.error('App.js: MSAL instance is not initialized.');
          return;
        }

        const allAccounts = msalInstance.getAllAccounts();
        if (!allAccounts.length) {
          console.log('App.js: No active accounts found.');
          setIsLoading(false);
          return;
        }

        const account = msalInstance.getActiveAccount() || allAccounts[0];
        if (account) {
          console.log('App.js: Account found:', account);
          setIsAuthenticated(true);
          setUserName(account.idTokenClaims.name);

          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['user.read'],
            account,
          });

          if (tokenResponse.accessToken) {
            console.log('App.js: Access token acquired.');
            setAccessToken(tokenResponse.accessToken);
          }

          const roles = account?.idTokenClaims?.groups || [];
          console.log('App.js: User roles:', roles);
          setUserRole(roles);

          const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
          console.log('App.js: Group names fetched:', groupNames);
          setGroupNames(groupNames);
        } else {
          console.log('App.js: No active account.');
        }
      } catch (error) {
        console.error('App.js: Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Wait until the MSAL instance is set before checking the session
    if (msalInstance) {
      checkSession();
    }
  }, [msalInstance]);

  const handleLogout = async () => {
    try {
      console.log('App.js: Logging out...');
      if (msalInstance) {
        await msalInstance.logoutPopup();
      }
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setAccessToken('');
      setGroupNames([]); // Clear group names on logout
      console.log('App.js: Logout successful, state cleared.');
    } catch (error) {
      console.error('App.js: Logout error:', error);
    }
  };

  if (isLoading) {
    console.log('App.js: Loading state is active.');
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <main>
        <Header
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          userName={userName}
          userRole={userRole}
        />
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />}
          />
          <Route
            path="/homepage"
            element={isAuthenticated ? <HomePage userRole={userRole} groupNames={groupNames} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin-search"
            element={
              isAuthenticated && userRole.includes('Admins') ? (
                <AdminSearch groupNames={groupNames} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
};

export default App;
