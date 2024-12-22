import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { groupVideosBySession } from '../utils/videoUtils';

const useVideos = () => {
  const { instance } = useMsal();
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch videos once, unless patientCode changes
  useEffect(() => {
    const fetchVideos = async (patientCode = null) => {
      if (!patientCode) {
        console.warn("fetchVideos: patientCode is undefined or null");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = (await instance.acquireTokenSilent({ scopes: ["openid", "profile", "email", "User.Read", "api://saml_barilan/user_impersonation/user_impersonation"] })).accessToken;
        const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
        const fullUrl = `${apiUrl}/fetchvideos?patientCode=${patientCode}`;

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }

        const data = await response.json();
        const videoList = data.unique_videos_list.map((item) => ({
          fullVideoName: item.fullVideoName,
          fileKey: item.fileKey,
          s3Url: item.s3Url,
          meetingNum: item.meetingNum,
          roomNum: item.roomNum,
          cameraName: item.cameraName,
          therapistCode: item.therapistCode,
          patientCode: item.patientCode,
          uniqueSessionName: item.uniqueSessionName,
          date: item.date,
          time: item.time,
        }));

        // Set the videos only if they change
        setVideos((prevVideos) => {
          if (JSON.stringify(prevVideos) !== JSON.stringify(videoList)) {
            return videoList;
          }
          return prevVideos;
        });

        // Group the videos based on sessions
        const grouped = groupVideosBySession(videoList);

        setGroupedVideos((prevGroupedVideos) => {
          if (JSON.stringify(prevGroupedVideos) !== JSON.stringify(grouped)) {
            return grouped;
          }
          return prevGroupedVideos;
        });

      } catch (error) {
        console.error('Error fetching videos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos(); // Call the fetch function on initial mount or when patientCode changes
  }, [instance, setVideos, setGroupedVideos]); // Dependencies: only re-fetch when necessary (e.g., patientCode)

  return { videoList, groupedVideos, loading, error };
};

export default useVideos;
