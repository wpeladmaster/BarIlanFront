export const msalConfig = {
    auth: {
      clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD app's client ID
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your Azure AD tenant ID
      redirectUri: 'http://localhost:3000', // Match your app's redirect URI
    },
    cache: {
      cacheLocation: 'localStorage', // Cache location can be localStorage or sessionStorage
      storeAuthStateInCookie: false, // Set to true for IE 11 or older browsers
    },
  };
  