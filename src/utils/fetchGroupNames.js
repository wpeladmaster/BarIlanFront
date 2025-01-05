const fetchGroupNames = async (apiUrl, token, therapist_code) => {

  try {
    const fullUrl = `${apiUrl}/fetchgroups?therapist_code=${therapist_code}`;


    const headers = {
      Authorization: token,
      'Content-Type': 'application/json',
    };
    if (process.env.REACT_APP_REDIRECT_URI?.includes('psyclinics.biu.ac.il')) {
      headers['x-apigw-api-id'] = 'hpser6iqwb';
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("fetchGroupNames.js: Response error text:", errorText);
      throw new Error(`Failed to fetch groups: ${response.statusText} (${response.status})`);
    }

    console.log("response:", response);
    const data = await response.json();
    console.log("data:", data);
    // Extract and normalize the groups
    const group = data.group || [];
    console.log("Group:", group);
    
    const normalizedGroup = Array.isArray(group) && group.length === 1
      ? group[0]
      : group;

    console.log("normalizedGroup:", normalizedGroup);
    return normalizedGroup;
    
    
  } catch (error) {
    console.error("fetchGroupNames.js: Error fetching user groups:", error);
    return [];
  }
};

export default fetchGroupNames;
