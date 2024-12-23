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
    const groups = data.group || '';
    console.log("groups: ", groups);
    const normalizedGroups = groups.replace(/[{}"]/g, '');
    console.log("normalizedGroups: ", normalizedGroups);
    return normalizedGroups.split(',');
    
    
  } catch (error) {
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
