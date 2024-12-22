import { useState } from 'react';
import { useMsal } from "@azure/msal-react";

const usePatients = () => {
  const { instance } = useMsal();
  const [patients, setPatients] = useState([]);

  const fetchPatients = async (userRole) => {

    try {
      const token = (await instance.acquireTokenSilent({ scopes: ["openid", "profile", "email", "User.Read", "api://saml_barilan/user_impersonation/user_impersonation"] })).accessToken;
      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const fullUrl = `${apiUrl}/fetchpatients?therapistCodeStudent=${userRole}`;

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
        console.warn(`No patients found for therapistCodeStudent: ${userRole}`);
      }

    } catch (error) {
      console.error('Error fetching patients:', error);
    }


  };

  return { patients, fetchPatients };
};

export default usePatients;
