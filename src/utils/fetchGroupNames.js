import axios from 'axios';

const fetchGroupNames = async (groupIds, accessToken) => {
  const groupNames = [];

  if (!groupIds || groupIds.length === 0) {
    console.log("No group IDs found in fetchGroupNames.");
    return groupNames;
  }

  console.log("Starting to fetch group names...");

  try {
    for (const groupId of groupIds) {
      console.log(`Fetching group info for groupId: ${groupId}`);  // Log each group ID
      const response = await axios.get(`https://graph.microsoft.com/v1.0/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(`Group Name for ID ${groupId}: ${response.data.displayName}`);
      groupNames.push(response.data.displayName);
    }
  } catch (error) {
    console.error("Error fetching group names:", error);
  }

  return groupNames;
};

export default fetchGroupNames;
