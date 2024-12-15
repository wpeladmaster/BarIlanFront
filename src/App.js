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
      try {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          const userAccount = accounts[0];
          console.log("App.js: User Account Found:", userAccount);
  
          const tokenResponse = await instance.acquireTokenSilent({
            account: userAccount,
            scopes: ["https://graph.microsoft.com/.default"],
          });
  
          setAccessToken(tokenResponse.accessToken);
  
          const groupIds = userAccount.idTokenClaims.groups || [];
          console.log("App.js: User Groups (IDs):", groupIds);  // Log the group IDs here
  
          // If groupIds is empty, there's likely a problem retrieving it
          if (groupIds.length === 0) {
            console.error("No groups found for the user.");
          }
  
          const groupNames = await fetchGroupNames(groupIds, tokenResponse.accessToken);
          console.log("App.js: User Groups (Names):", groupNames);  // Log group names after fetching
  
          // Extract user details
          setUserName(userAccount.name || "User");
          setUserRole(groupNames || []);
          console.log("App.js: Updated userName:", userAccount.name);
          console.log("App.js: Updated userRole:", groupNames);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("App.js: Error checking session:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkUserSession();
  }, [instance]);
  
  
  if (isLoading) {
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
