import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

const App = () => {
  const { instance, accounts } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("App.js: Checking user session...");
        const activeAccounts = instance.getAllAccounts();
        
        if (!activeAccounts.length) {
          console.log("App.js: No active accounts found.");
          return;
        }

        const account = instance.getActiveAccount() || activeAccounts[0];
        if (account) {
          console.log("App.js: User account found:", account.username);
          setIsAuthenticated(true);
          setUserName(account.username);

          // Acquire token silently
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ["user.read"],
            account,
          });

          if (tokenResponse.accessToken) {
            console.log("App.js: Access token acquired.");
            setAccessToken(tokenResponse.accessToken);

            // Example: Fetch roles from token
            const roles = tokenResponse.idTokenClaims?.roles || [];
            setUserRole(roles);
          } else {
            console.log("App.js: No access token available.");
          }
        } else {
          console.log("App.js: No active account.");
        }
      } catch (error) {
        console.error("App.js: Error during session check:", error);
      }
    };

    checkSession();
  }, [instance]);

  return (
    <div>
      <h1>Welcome to the App</h1>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: {userName}</p>
      <p>Role: {userRole.join(", ")}</p>
      <p>Access Token: {accessToken ? "Available" : "Not Available"}</p>
    </div>
  );
};

export default App;
