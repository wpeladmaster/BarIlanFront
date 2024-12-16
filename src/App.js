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
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]);
  const [msalInstance, setMsalInstance] = useState(null);

  const msalConfig = {
    auth: {
      clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
      authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
      redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage"
    }
  };

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        console.log("Initializing MSAL...");
        const newMsalInstance = new PublicClientApplication(msalConfig);
        setMsalInstance(newMsalInstance);
      } catch (error) {
        console.error("Error initializing MSAL:", error);
      }
    };

    initializeMsal();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!msalInstance) {
          console.log("MSAL instance not initialized yet.");
          return;
        }

        const allAccounts = msalInstance.getAllAccounts();
        if (!allAccounts.length) {
          console.log("No active accounts found.");
          setIsLoading(false);
          return;
        }

        const account = msalInstance.getActiveAccount() || allAccounts[0];
        if (account) {
          setIsAuthenticated(true);
          setUserName(account.idTokenClaims.name);

          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ["user.read"],
            account,
          });

          if (tokenResponse.accessToken) {
            setAccessToken(tokenResponse.accessToken);
          }

          const roles = account?.idTokenClaims?.groups || [];
          setUserRole(roles);

          const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
          setGroupNames(groupNames);
        }
      } catch (error) {
        console.error("Error during session check:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [msalInstance]);

  const handleLogout = async () => {
    if (!msalInstance) return;
    try {
      await msalInstance.logoutPopup();
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setAccessToken('');
      setGroupNames([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
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
