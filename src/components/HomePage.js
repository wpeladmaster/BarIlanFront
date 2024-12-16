import React, { useState, useEffect, useMemo } from 'react';
//import { PublicClientApplication } from '@azure/msal-browser';
import InstructorsList from './lists/InstructorsList';
import StudentsList from './lists/StudentsList';
import PatientsList from './lists/PatientsList';
import VideosList from './lists/VideosList';
import useStudents from '../hooks/useStudents';
import usePatients from '../hooks/usePatients';
import useVideos from '../hooks/useVideos';
import VideoModal from './VideoModal';
import Loader from './Loader';
import CommandForm2 from './CommandForm2';
import fetchGroupNames from '../utils/fetchGroupNames';
import '../style/HomePage.scss';

const HomePage = ({ userRole, userCustomId }) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [videoTimes, setVideoTimes] = useState({});
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [groupNames, setGroupNames] = useState([]);
  const [msalInstance, setMsalInstance] = useState(null);

  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos, groupedVideos } = useVideos();

  const isAdmin = useMemo(() => userRole.includes('Admins'), [userRole]);
  const isInstructor = useMemo(() => userRole.includes('Instructors'), [userRole]);
  const isStudent = useMemo(() => userRole.includes('Students'), [userRole]);

  console.log("userRole: ", userRole);

  // const msalConfig = {
  //   auth: {
  //     clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
  //     authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
  //     redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage"
  //   }
  // };

  // useEffect(() => {
  //   const initializeMsal = async () => {
  //     const newMsalInstance = new PublicClientApplication(msalConfig);
  //     await newMsalInstance.initialize();
  //     setMsalInstance(newMsalInstance);
  //   };

  //   initializeMsal();
  // }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!msalInstance) return;

      try {
        const token = (await msalInstance.acquireTokenSilent({
          scopes: ["api://aadb3f2f-d35f-4080-bc72-2ee32b741120/access_as_user"]
        })).accessToken;

        console.log("token: ", token);
        
        const groupIds = userRole.filter(role => role.includes('Group')).map(role => role.split('-')[1]);

        console.log("groupIds: ", groupIds);

        const groupNamesFetched = await fetchGroupNames(groupIds, token);

        console.log("groupNamesFetched: ", groupNamesFetched);
        
        setGroupNames(groupNamesFetched);
      } catch (error) {
        console.error('Error fetching group names:', error);
      }
    };

    if (msalInstance) {
      fetchGroups();
    }
  }, [msalInstance, userRole]);

  useEffect(() => {
    if (isAdmin) {
      const fetchInstructors = async () => {
        setLoadingInstructors(true);
        try {
          const token = (await msalInstance.acquireTokenSilent({
            scopes: ["api://aadb3f2f-d35f-4080-bc72-2ee32b741120/access_as_user"]
          })).accessToken;

          const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
          const response = await fetch(`${apiUrl}/fetchinstructors`, {
            method: 'GET',
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) throw new Error('Failed to fetch instructors');
          const data = await response.json();
          setInstructors(data.unique_instructors_codes || []);
        } catch (error) {
          console.error('Error fetching instructors:', error);
        } finally {
          setLoadingInstructors(false);
        }
      };

      fetchInstructors();
    }
  }, [isAdmin, msalInstance]);

  useEffect(() => {
    if (isInstructor && userCustomId) {
      setLoadingStudents(true);
      fetchStudents(userCustomId);
    }
  }, [isInstructor, userCustomId]);

  useEffect(() => {
    if (isStudent && userCustomId) {
      setLoadingPatients(true);
      fetchPatients(userCustomId);
    }
  }, [isStudent, userCustomId]);

  useEffect(() => {
    if (selectedVideo && groupedVideos[selectedSession]) {
      const sessionVideos = groupedVideos[selectedSession];
      if (sessionVideos && sessionVideos.length) {
        setActiveTab(sessionVideos[0].fullVideoName);
      }
    }
  }, [selectedVideo, groupedVideos, selectedSession]);

  const handleInstructorClick = async (instructorCode) => {
    setSelectedInstructor(instructorCode);
    setSelectedStudent(null);
    setSelectedPatient(null);
    setLoadingStudents(true);
    await fetchStudents(instructorCode);
    setLoadingStudents(false);
  };

  const handleStudentClick = (studentCode) => {
    setSelectedStudent(studentCode);
    setSelectedPatient(null);
    setSelectedVideo(null);
    setLoadingPatients(true);
    fetchPatients(studentCode).finally(() => setLoadingPatients(false));
  };

  const handlePatientClick = (patientCode) => {
    setSelectedPatient(patientCode);
    setSelectedVideo(null);
    setLoadingVideos(true);
    fetchVideos(patientCode).finally(() => setLoadingVideos(false));
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setSelectedSession(video.sessionName || '');
  };

  return (
    <div className="main-container homepage">
      <div>
        <h2>Group Names</h2>
        {groupNames.length > 0 ? (
          <ul>
            {groupNames.map((groupName, index) => (
              <li key={index}>{groupName}</li>
            ))}
          </ul>
        ) : (
          <p>No groups available</p>
        )}
      </div>

      {/* Other components and code remain the same */}

    </div>
  );
};

export default HomePage;
