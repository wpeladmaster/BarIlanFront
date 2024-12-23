import { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { groupVideosBySession } from '../utils/videoUtils';

const useVideos = (patientCode) => {
  const { instance } = useMsal();
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async (patientCode) => {
    if (!patientCode) {
      console.warn("fetchVideos: patientCode is undefined or null");
      return;
    }
  
    setLoading(true);
    setError(null);
    setVideos([]);
    setGroupedVideos({});
  
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
  
  useEffect(() => {
    if (patientCode) {
      fetchVideos(patientCode);
    }
  }, [patientCode, instance]);

  return { videoList, groupedVideos, loading, error, fetchVideos };
};

export default useVideos;

