const fetchGroupNames = async (apiUrl, token, therapist_code) => {

  try {
    const fullUrl = `${apiUrl}/fetchgroups?therapist_code=${therapist_code}`;
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("fetchGroupNames.js: Response error text:", errorText);
      throw new Error(`Failed to fetch groups: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();

    // Extract and normalize the groups
    const groups = data.group || []; // Assuming the new field is 'groups' instead of 'groups_names'

    // If the groups data is a single string (e.g., "Admins"), we wrap it in an array
    const normalizedGroups = Array.isArray(groups)
      ? groups.flatMap(groupString =>
          typeof groupString === 'string'
            ? groupString.replace(/[{}"]/g, '').split(',') // Split by commas if there are multiple groups in the string
            : []
        )
      : [groups].flatMap(groupString =>
          typeof groupString === 'string'
            ? groupString.replace(/[{}"]/g, '').split(',') // Handle the case where it's just a single string
            : []
        );
    
    return normalizedGroups;
    
    
  } catch (error) {
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
