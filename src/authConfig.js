export const msalConfig = {
    auth: {
        clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
        authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
        redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage"
    },
    cache: {
      cacheLocation: 'sessionStorage', // Cache location can be localStorage or sessionStorage
      storeAuthStateInCookie: false,
    },
  };
  export const loginRequest = {
    scopes: ["email","openid","profile", "User.Read", "User.ReadBasic.All", "GroupMember.Read.All"],
  };
  