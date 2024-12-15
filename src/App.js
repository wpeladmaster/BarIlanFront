import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './style/global.scss';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';

import fetchGroupNames from './utils/fetchGroupNames'; // Import the updated fetchGroupNames
import { loginRequest } from './authConfig';

const App = () => {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]); // State to store fetched group names

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("App.js: Checking user session...");
  
        // Ensure MSAL instance is initialized
        if (!instance) {
          console.error("App.js: MSAL instance is not initialized.");
          return;
        }
  
        // Check if there are any active accounts
        const allAccounts = instance.getAllAccounts();
        if (!allAccounts.length) {
          console.log("App.js: No active accounts found.");
          setIsLoading(false);
          return;
        }
  
        const account = instance.getActiveAccount() || allAccounts[0];
        if (account) {
          console.log("App.js: Account found:", account);
          console.log("App.js: User account found:", account.idTokenClaims.name);
          setIsAuthenticated(true);
          setUserName(account.idTokenClaims.name);
  
          // Fetch token silently
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ["user.read"],
            account,
          });
  
          if (tokenResponse.accessToken) {
            console.log("App.js: Access token acquired.");
            setAccessToken(tokenResponse.accessToken);
          } else {
            console.log("App.js: No access token available.");
          }
  
          const roles = account?.idTokenClaims?.groups || [];
          console.log("App.js: User roles:", roles);
  
          setUserRole(roles);
  
          // Fetch group names using group IDs from the roles (or modify this if needed)
          const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
          console.log("App.js: Group names fetched:", groupNames);
          setGroupNames(groupNames);
        } else {
          console.log("App.js: No active account.");
        }
      } catch (error) {
        console.error("App.js: Error during session check:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkSession();
  }, [instance]);
  

  useEffect(() => {
    console.log("App.js: User Role Updated:", userRole); // Log user roles when updated
    console.log("App.js: Group Names Updated:", groupNames); // Log group names when updated
  }, [userRole, groupNames]);

  const handleLogout = async () => {
    try {
      console.log('App.js: Logging out...');
      await instance.logoutPopup();
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setAccessToken('');
      setGroupNames([]); // Clear group names on logout
      console.log("App.js: Logout successful, state cleared.");
    } catch (error) {
      console.error('App.js: Logout error:', error);
    }
  };

  if (isLoading) {
    console.log("App.js: Loading state is active.");
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
