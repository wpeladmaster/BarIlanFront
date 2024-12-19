const fetchGroupNames = async (apiUrl, token, therapist_code) => {
  console.log("fetchGroupNames.js: apiUrl:", apiUrl);
  console.log("fetchGroupNames.js: token:", token);
  console.log("fetchGroupNames.js: therapist_code:", therapist_code);

  try {
    const fullUrl = `${apiUrl}/fetchgroups?therapist_code=${therapist_code}`;
    const response = await fetch(fullUrl, {
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
      const errorText = await response.text();
      console.error("fetchGroupNames.js: Response error text:", errorText);
      throw new Error(`Failed to fetch groups: ${response.statusText} (${response.status})`);
    }

    console.log("fetchGroupNames.js: Parsing response JSON...");
    const data = await response.json();

    console.log("fetchGroupNames.js: Fetched groups data:", data);

    // Safely transform the groups to strings and normalize them
    const groups = data.groups_names || [];
    const normalizedGroups = groups
      .map(group => (typeof group === 'string' ? group.replace(/[{}"]/g, '') : group))
      .flatMap(group => (typeof group === 'string' ? group.split(',') : []));

    console.log("fetchGroupNames.js: Normalized groups:", normalizedGroups);
    return normalizedGroups;
  } catch (error) {
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
