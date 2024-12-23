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
    console.log("group data: ", data);
    
    // Extract and normalize the groups
    const group = data.group || []; // Assuming the new field is 'group'

    // If group is an array with a single string value, simply return that string
    const normalizedGroup = Array.isArray(group) && group.length === 1
      ? group[0] // Get the first (and only) value
      : group;
    
    return normalizedGroup;
    
    
  } catch (error) {
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
