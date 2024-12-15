import axios from 'axios';

const fetchGroupNames = async (groupIds, accessToken) => {
  const groupNames = [];

  if (!groupIds || groupIds.length === 0) {
    console.log("No group IDs found.");
    return groupNames;
  }

  try {
    console.log("Fetching group names for group IDs:", groupIds);

    for (const groupId of groupIds) {
      try {
        const response = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(`Group Name for ID ${groupId}:`, response.data.displayName);
        groupNames.push(response.data.displayName);
      } catch (error) {
        console.error(`Error fetching group name for ID ${groupId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching group names:", error);
  }

  return groupNames;
};

export default fetchGroupNames;
