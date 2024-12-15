import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import fetchGroupNames from './utils/fetchGroupNames';
import { useMsal } from '@azure/msal-react';

const App = () => {
  const { instance } = useMsal(); // Access msalInstance from the provider
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const checkUserSession = async () => {
      console.log("App.js: Checking user session...");

      try {
        const accounts = instance.getAllAccounts();
        console.log("App.js: Accounts found:", accounts);

        if (accounts.length > 0) {
          const userAccount = accounts[0];
          console.log("App.js: User Account Found:", userAccount);

          try {
            const tokenResponse = await instance.acquireTokenSilent({
              account: userAccount,
              scopes: ["https://graph.microsoft.com/.default"],
            });
            console.log("App.js: Token Response:", tokenResponse);
            setAccessToken(tokenResponse.accessToken);

            const groupIds = userAccount.idTokenClaims.groups || [];
            console.log("App.js: User Groups (IDs):", groupIds);

            if (groupIds.length === 0) {
              console.warn("App.js: No groups found for the user.");
            }

            const groupNames = await fetchGroupNames(groupIds, tokenResponse.accessToken);
            console.log("App.js: User Groups (Names):", groupNames);

            setUserName(userAccount.name || "User");
            setUserRole(groupNames || []);
            console.log("App.js: Updated userName:", userAccount.name);
            console.log("App.js: Updated userRole:", groupNames);

            setIsAuthenticated(true);
          } catch (tokenError) {
            console.error("App.js: Error acquiring token:", tokenError);
            setIsAuthenticated(false);  // Ensure fallback on error
          }
        } else {
          console.warn("App.js: No user accounts found.");
        }
      } catch (err) {
        console.error("App.js: Error checking session:", err);
        setIsAuthenticated(false);  // Ensure fallback on error
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, [instance]);

  if (isLoading) {
    console.log("App.js: Loading...");
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <main>
        <Header
          isAuthenticated={isAuthenticated}
          onLogout={() => {
            setIsAuthenticated(false);
            setUserName('');
            setUserRole([]);
          }}
          userName={userName}
          userRole={userRole}
        />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
          <Route
            path="/homepage"
            element={isAuthenticated ? <HomePage userRole={userRole} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin-search"
            element={
              isAuthenticated && userRole.includes('Admins') ? (
                <AdminSearch />
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
