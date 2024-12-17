const fetchGroupNames = async (apiUrl, token, email) => {

  console.log("fetchGroupNames.js: apiUrl:", apiUrl);
  console.log("fetchGroupNames.js: token:", token);
  console.log("fetchGroupNames.js: email:", email);
  
  try {
    const response = await fetch(`${apiUrl}/fetchgroups`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }

    const data = await response.json();
    return data.groups || [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};

export default fetchGroupNames;
