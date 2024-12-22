import { useState, useCallback } from "react";
import { useMsal } from "@azure/msal-react";

const usePatients = () => {
  const { instance } = useMsal();
  const [patients, setPatients] = useState([]);

  const fetchPatients = useCallback(async (userRole) => {
    if (!userRole) {
      console.warn("fetchPatients: userRole is undefined");
      return;
    }

    try {
      console.log("Fetching patients for role:", userRole);
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [
          "openid", "profile", "email", "User.Read",
          "api://saml_barilan/user_impersonation/user_impersonation"
        ],
      });
      const token = tokenResponse.accessToken;

      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const fullUrl = `${apiUrl}/fetchpatients?therapistCodeStudent=${userRole}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      console.log("Fetched patients data:", data);

      const patientCodes = data.unique_patients_codes || [];
      setPatients(patientCodes);

      if (patientCodes.length === 0) {
        console.warn(`No patients found for therapistCodeStudent: ${userRole}`);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  }, [instance]);

  return { patients, fetchPatients };
};

export default usePatients;
