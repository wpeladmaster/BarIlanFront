import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { groupVideosBySession } from '../utils/videoUtils';

const useVideos = () => {
  const { instance } = useMsal();
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async (patientCode = null) => {
    if (!patientCode) {
      console.warn("fetchVideos: patientCode is undefined or null");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = (await instance.acquireTokenSilent({ 
        scopes: ["openid", "profile", "email", "User.Read", "api://saml_barilan/user_impersonation/user_impersonation"] 
      })).accessToken;
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
      const newVideoList = data.unique_videos_list.map((item) => ({
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

      // Check if video list is different before updating the state
      if (JSON.stringify(newVideoList) !== JSON.stringify(videoList)) {
        setVideos(newVideoList);
      }

      // Group videos by session and update state if necessary
      const grouped = groupVideosBySession(newVideoList);
      if (JSON.stringify(grouped) !== JSON.stringify(groupedVideos)) {
        setGroupedVideos(grouped);
      }

      console.log('Fetched and grouped videos:', grouped);

    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { videoList, fetchVideos, groupedVideos, loading, error };
};

export default useVideos;
