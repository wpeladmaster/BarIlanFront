import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';

const App = ({ msalInstance }) => {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]);

  const loginRequest = {
    scopes: ["User.Read"]
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!instance) {
          setIsLoading(false);
          return;
        }

        const allAccounts = instance.getAllAccounts();
        if (!allAccounts.length) {
          setIsLoading(false);
          return;
        }

        const account = instance.getActiveAccount() || allAccounts[0];
        if (account) {
          setIsAuthenticated(true);
          setUserName(account.name || account.username);
          const email = account.username.split('@')[0]; // Extract username before '@'

          // Call AWS Lambda function to fetch groups from DynamoDB based on the email
          const response = await fetch(`https://<API-GATEWAY-ENDPOINT>/fetchGroups`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          });

          if (response.ok) {
            const data = await response.json();
            setGroupNames(data.groups);  // Assuming the API returns an array of groups
            setUserRole(data.groups);     // Set role from groups
          } else {
            throw new Error('Failed to fetch groups');
          }
        }
      } catch (error) {
        console.error('Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [instance]);

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
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
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
          <Route path="/homepage" element={isAuthenticated ? <HomePage msalInstance={msalInstance} userRole={userRole} groupNames={groupNames} /> : <Navigate to="/" />} />
          <Route path="/admin-search" element={isAuthenticated && userRole.includes('Admins') ? <AdminSearch groupNames={groupNames} /> : <Navigate to="/" />} />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
};

export default App;
