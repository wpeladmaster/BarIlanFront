const fetchGroupNames = async (apiUrl, token, therapist_code) => {
  console.log("fetchGroupNames.js: apiUrl:", apiUrl);
  console.log("fetchGroupNames.js: token:", token);
  console.log("fetchGroupNames.js: therapist_code:", therapist_code);

  try {
    const fullUrl = `${apiUrl}/fetchgroups?therapist_code=${therapist_code}`;
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

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

    // Extract and normalize the groups
    const groups = data.groups_names || [];
    const normalizedGroups = groups
      .flatMap(innerArray =>
        Array.isArray(innerArray)
          ? innerArray.flatMap(groupString =>
              typeof groupString === 'string'
                ? groupString.replace(/[{}"]/g, '').split(',')
                : []
            )
          : []
      );

    console.log("fetchGroupNames.js: Normalized groups:", normalizedGroups);
    return normalizedGroups;
  } catch (error) {
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
