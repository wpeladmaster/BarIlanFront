import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './style/global.scss';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import fetchGroupNames from './utils/fetchGroupNames';
import { loginRequest } from './authConfig';

const App = () => {
  const { instance: msalInstance, accounts } = useMsal(); // Use MSAL instance provided by MsalProvider
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]);

  console.log('MSAL instance initialized:', msalInstance);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('App.js: Checking user session...');
        const accounts = msalInstance.getAllAccounts();
        if (!accounts.length) {
          console.log('App.js: No active accounts found.');
          setIsLoading(false);
          return;
        }

        const account = msalInstance.getActiveAccount() || accounts[0];
        msalInstance.setActiveAccount(account);

        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        if (tokenResponse.accessToken) {
          console.log('App.js: Access token acquired.');
          setAccessToken(tokenResponse.accessToken);
        }

        const roles = account.idTokenClaims?.groups || [];
        setIsAuthenticated(true);
        setUserName(account.idTokenClaims.name);
        setUserRole(roles);

        const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
        setGroupNames(groupNames);
      } catch (error) {
        console.error('App.js: Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [msalInstance]);

  const handleLogout = async () => {
    await msalInstance.logoutPopup();
    setIsAuthenticated(false);
    setUserName('');
    setUserRole([]);
    setAccessToken('');
    setGroupNames([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} userName={userName} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
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
    </Router>
  );
};

export default App;
