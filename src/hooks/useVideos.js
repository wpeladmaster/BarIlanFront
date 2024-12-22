import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { groupVideosBySession } from '../utils/videoUtils';

const useVideos = (patientCode) => { // Add patientCode as a parameter
  const { instance } = useMsal();
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch videos when patientCode changes
  useEffect(() => {
    const fetchVideos = async () => {
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

        // Update video list
        setVideos(videoList);

        // Group the videos based on sessions
        const grouped = groupVideosBySession(videoList);
        setGroupedVideos(grouped);

      } catch (error) {
        console.error('Error fetching videos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos(); // Call the fetch function whenever patientCode changes
  }, [patientCode, instance]); // Now it re-runs every time patientCode changes

  return { videoList, groupedVideos, loading, error };
};

export default useVideos;
