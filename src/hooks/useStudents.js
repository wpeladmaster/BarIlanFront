import { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

const useStudents = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async (therapistCodeLeader = '') => {
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

      const fullUrl = `${apiUrl}/fetchstudents?therapistCodeLeader=${therapistCodeLeader}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      console.log('response:', response);

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Fetched students data:', data);

      const studentCodes = data.unique_student_codes || [];
      setStudents(studentCodes);

      if (studentCodes.length === 0) {
        console.warn(`No students found for therapistCodeLeader: ${therapistCodeLeader}`);
      }

    } catch (error) {
      console.error('Error fetching students for therapistCodeLeader:', therapistCodeLeader, error);
    }
  };

  return { students, fetchStudents };
};

export default useStudents;
