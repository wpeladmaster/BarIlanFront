import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import "./style/global.scss";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import AdminSearch from "./components/AdminSearch";

import fetchGroupNames from "./utils/fetchGroupNames";
import { loginRequest } from "./authConfig";

const App = () => {
  const { instance } = useMsal(); // MSAL instance from provider
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState("");

  // Function to handle user session checking
  const checkUserSession = async () => {
    console.log("App.js: Checking user session...");

    try {
      const accounts = instance.getAllAccounts();
      console.log("App.js: Accounts found:", accounts);

      if (accounts.length === 0) {
        console.warn("App.js: No user accounts found. Prompting login...");
        await instance.loginPopup(loginRequest); // Force login
        const newAccounts = instance.getAllAccounts();

        if (newAccounts.length === 0) {
          console.error("App.js: No accounts after login.");
          setIsAuthenticated(false);
          return;
        }
      }

      const userAccount = accounts[0] || instance.getAllAccounts()[0];
      console.log("App.js: Using account:", userAccount);

      // Acquire token
      const tokenResponse = await instance.acquireTokenSilent({
        account: userAccount,
        scopes: loginRequest.scopes,
      });

      console.log("App.js: Token Response:", tokenResponse);
      setAccessToken(tokenResponse.accessToken);

      // Fetch group names
      const groupIds = userAccount.idTokenClaims.groups || [];
      const groupNames = await fetchGroupNames(groupIds, tokenResponse.accessToken);

      console.log("App.js: Group Names:", groupNames);

      // Update state
      setUserName(userAccount.name || "User");
      setUserRole(groupNames || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("App.js: Error during session validation:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, [instance]);

  // Log user out
  const handleLogout = () => {
    console.log("App.js: Logging out...");
    instance.logoutPopup().then(() => {
      setIsAuthenticated(false);
      setUserName("");
      setUserRole([]);
      setAccessToken("");
    });
  };

  if (isLoading) {
    console.log("App.js: Loading...");
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
            element={isAuthenticated ? <HomePage userRole={userRole} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin-search"
            element={
              isAuthenticated && userRole.includes("Admins") ? (
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
