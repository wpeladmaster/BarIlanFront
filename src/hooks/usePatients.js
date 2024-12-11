import { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

const usePatients = () => {
  const [patients, setPatients] = useState([]);

  const fetchPatients = async (therapistCodeStudent) => {


    try {
      const msalConfig = {
        auth: {
          clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
          authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
          redirectUri: "http://localhost:3000"
        }
      };
      
      const msalInstance = new PublicClientApplication(msalConfig);
      const token = (await msalInstance.acquireTokenSilent({
        scopes: ["api://your_api_app_id/access_as_user"] // Replace with your API's app ID URI
      })).accessToken;
      
      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const fullUrl = `${apiUrl}/fetchpatients?therapistCodeStudent=${therapistCodeStudent}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      console.log('Fetched students data:', data);

      const patientCodes = data.unique_patients_codes || [];
      setPatients(patientCodes);

      if (patientCodes.length === 0) {
        console.warn(`No patients found for therapistCodeStudent: ${therapistCodeStudent}`);
      }

    } catch (error) {
      console.error('Error fetching patients:', error);
    }


  };

  return { patients, fetchPatients };
};

export default usePatients;
