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
  const { instance: msalInstance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('App.js: Checking user session...');
        const allAccounts = msalInstance.getAllAccounts();
        if (!allAccounts.length) {
          console.log('App.js: No active accounts found.');
          setIsLoading(false);
          return;
        }

        const account = msalInstance.getActiveAccount() || allAccounts[0];
        msalInstance.setActiveAccount(account); // Set the active account
        if (account) {
          console.log('App.js: Account found:', account);
          setIsAuthenticated(true);
          setUserName(account.idTokenClaims.name);

          const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
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
        }
      } catch (error) {
        console.error('App.js: Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [msalInstance]);

  const handleLogout = async () => {
    try {
      console.log('App.js: Logging out...');
      await msalInstance.logoutPopup();
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setAccessToken('');
      setGroupNames([]);
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
