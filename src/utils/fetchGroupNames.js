const fetchGroupNames = async (apiUrl, token, therapistCode) => {
  try {
    const fullUrl = `${apiUrl}/fetchgroups?therapist_code=${therapistCode}`;
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
