const fetchGroupNames = async (apiUrl, token, email) => {
  console.log("fetchGroupNames.js: apiUrl:", apiUrl);
  console.log("fetchGroupNames.js: token:", token);
  console.log("fetchGroupNames.js: email:", email);

  try {
    const response = await fetch(`${apiUrl}/fetchgroups`, {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    // Log the response status and headers for debugging
    console.log("fetchGroupNames.js: Response status:", response.status);
    console.log("fetchGroupNames.js: Response headers:", JSON.stringify([...response.headers]));

    if (!response.ok) {
      // Log the entire response text for detailed failure information
      const errorText = await response.text();
      console.error("fetchGroupNames.js: Response error text:", errorText);
      throw new Error(`Failed to fetch groups: ${response.statusText} (${response.status})`);
    }

    // Log if the JSON parsing starts
    console.log("fetchGroupNames.js: Parsing response JSON...");
    const data = await response.json();

    // Log the parsed data
    console.log("fetchGroupNames.js: Fetched groups data:", data);
    return data.groups || [];
  } catch (error) {
    // Log detailed error information
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
