import { useState, useCallback } from "react";
import { useMsal } from "@azure/msal-react";

const useStudents = () => {
  const { instance } = useMsal();
  const [students, setStudents] = useState([]);

  const fetchStudents = useCallback(
    async (userRole = "") => {
      if (!userRole) {
        console.warn("fetchStudents: userRole is undefined");
        return;
      }

      try {
        console.log("Fetching students for role:", userRole);

        // Acquire token silently
        const tokenResponse = await instance.acquireTokenSilent({
          scopes: [
            "openid",
            "profile",
            "email",
            "User.Read",
            "api://saml_barilan/user_impersonation/user_impersonation",
          ],
        });
        const token = tokenResponse.accessToken;

        // Build API URL
        const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
        const fullUrl = `${apiUrl}/fetchstudents?therapistCodeLeader=${userRole}`;

        // Fetch student data
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch students: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Fetched students data:", data);

        // Update state with fetched student codes
        const studentCodes = data.unique_student_codes || [];
        setStudents(studentCodes);

        if (studentCodes.length === 0) {
          console.warn(`No students found for therapistCodeLeader: ${userRole}`);
        }
      } catch (error) {
        console.error(
          `Error fetching students for therapistCodeLeader: ${userRole}`,
          error
        );
      }
    },
    [instance] // Dependencies for useCallback
  );

  return { students, fetchStudents };
};

export default useStudents;
