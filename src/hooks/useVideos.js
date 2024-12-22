import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { groupVideosBySession } from '../utils/videoUtils';

const useVideos = (patientCode) => {
  const { instance } = useMsal();
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch videos function, moved outside of useEffect to be accessible for return
  const fetchVideos = async (patientCode) => {
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

      setVideos(videoList);
      const grouped = groupVideosBySession(videoList);
      setGroupedVideos(grouped);

    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch videos when the patientCode changes
  useEffect(() => {
    if (patientCode) {
      fetchVideos(patientCode); // Trigger fetchVideos when patientCode changes
    }
  }, [patientCode, instance]);

  return { videoList, groupedVideos, loading, error, fetchVideos }; // Return fetchVideos
};

export default useVideos;

