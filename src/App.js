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
import { loginRequest } from './authConfig';

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
    
        if (accounts.length === 0) {
          console.warn("App.js: No user accounts found, attempting login...");
          const loginResponse = await instance.loginPopup(loginRequest);  // Pass the loginRequest object here
          console.log("App.js: Login successful:", loginResponse);
          const newAccounts = instance.getAllAccounts();
          if (newAccounts.length > 0) {
            console.log("App.js: New user account found:", newAccounts[0]);
            // Continue your logic to acquire token and handle groups
          }
        } else {
          const userAccount = accounts[0];
          console.log("App.js: User Account Found:", userAccount);
          // Your existing logic to acquire token and handle groups
        }
      } catch (err) {
        console.error("App.js: Error checking session:", err);
        console.error("App.js: Error during login:", err);
        setIsAuthenticated(false);
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
