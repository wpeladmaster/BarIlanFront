import axios from 'axios';

const fetchGroupNames = async (groupIds, accessToken) => {
  const groupNames = [];

  try {
    for (const groupId of groupIds) {
      const response = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      groupNames.push(response.data.displayName);
    }
  } catch (error) {
    console.error("Error fetching group names:", error);
  }

  return groupNames;
};

export default fetchGroupNames;
