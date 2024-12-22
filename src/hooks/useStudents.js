import { useState } from 'react';
import { useMsal } from "@azure/msal-react";

const useStudents = () => {
  const { instance } = useMsal();
  const [students, setStudents] = useState([]);

  const fetchStudents = async (userRole = '') => {

    if (!userRole) {
      console.warn("fetchStudents: userRole is undefined");
      return;
    }

    try {

      const token = (await instance.acquireTokenSilent({ scopes: ["openid", "profile", "email", "User.Read", "api://saml_barilan/user_impersonation/user_impersonation"] })).accessToken;
      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const fullUrl = `${apiUrl}/fetchstudents?therapistCodeLeader=${userRole}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      console.log("usesSudents.js: response - ", response);
      const data = await response.json();
      console.log('Fetched students data:', data);

      const studentCodes = data.unique_student_codes || [];
      setStudents(studentCodes);

      if (studentCodes.length === 0) {
        console.warn(`No students found for therapistCodeLeader: ${userRole}`);
      }

    } catch (error) {
      console.error('Error fetching students for therapistCodeLeader:', userRole, error);
    }
  };

  return { students, fetchStudents };
};

export default useStudents;
