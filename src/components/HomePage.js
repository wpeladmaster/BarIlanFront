import React, { useState, useEffect, useMemo } from 'react';
import InstructorsList from './lists/InstructorsList';
import StudentsList from './lists/StudentsList';
import PatientsList from './lists/PatientsList';
import VideosList from './lists/VideosList';
import useStudents from '../hooks/useStudents';
import usePatients from '../hooks/usePatients';
import useVideos from '../hooks/useVideos';
import VideoModal from './VideoModal';
import { PublicClientApplication } from '@azure/msal-browser';
import Loader from './Loader';
import '../style/HomePage.scss';
import CommandForm2 from './CommandForm2';
import fetchGroupNames from '../utils/fetchGroupNames'; // Import your fetchGroupNames function

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
  const [groupNames, setGroupNames] = useState([]); // State for group names

  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos, groupedVideos } = useVideos();

  // Memoize user roles to avoid recalculating on every render
  const isAdmin = useMemo(() => userRole.includes('Admins'), [userRole]);
  const isInstructor = useMemo(() => userRole.includes('Instructors'), [userRole]);
  const isStudent = useMemo(() => userRole.includes('Students'), [userRole]);

  const msalConfig = {
    auth: {
      clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
      authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
      redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage"
    }
  };
  const [msalInstance, setMsalInstance] = useState(null);

  useEffect(() => {
    const initializeMsal = () => {
      const newMsalInstance = new PublicClientApplication(msalConfig);
      setMsalInstance(newMsalInstance);
    };

    initializeMsal();
  }, []);

  // Fetch group names for user role
  useEffect(() => {
    const fetchGroups = async () => {
      if (!msalInstance) return;

      try {
        // Ensure active account is set before making API requests
        const account = msalInstance.getAllAccounts()[0];
        if (account) {
          msalInstance.setActiveAccount(account);

          const token = (await msalInstance.acquireTokenSilent({
            scopes: ["api://your_api_app_id/access_as_user"] // Replace with your API's app ID URI
          })).accessToken;

          console.log('Fetched access token for group API:', token);

          const groupIds = userRole.filter(role => role.includes('Group')).map(role => role.split('-')[1]); // Assuming group IDs are in the role string (e.g., Group-123)
          console.log('Group IDs:', groupIds);

          const groupNamesFetched = await fetchGroupNames(groupIds, token);
          console.log('Fetched group names:', groupNamesFetched);
          setGroupNames(groupNamesFetched);
        } else {
          console.log('No active account found');
        }
      } catch (error) {
        console.error('Error fetching group names:', error);
      }
    };

    fetchGroups();
  }, [userRole, msalInstance]);

  // Effect for fetching instructors (only for Admin users)
  useEffect(() => {
    if (isAdmin && msalInstance) {
      const fetchInstructors = async () => {
        setLoadingInstructors(true);
        try {
          const token = (await msalInstance.acquireTokenSilent({
            scopes: ["api://your_api_app_id/access_as_user"] // Replace with your API's app ID URI
          })).accessToken;

          console.log('Fetched access token for instructors API:', token);
          const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
          const response = await fetch(`${apiUrl}/fetchinstructors`, {
            method: 'GET',
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch instructors');
          }

          const data = await response.json();
          const uniqueInstructors = data.unique_instructors_codes || [];
          setInstructors(uniqueInstructors);
          console.log('Fetched instructors:', uniqueInstructors);
        } catch (error) {
          console.error('Error fetching instructors:', error);
        } finally {
          setLoadingInstructors(false);
        }
      };

      fetchInstructors();
    }
  }, [isAdmin, msalInstance]);

  // Effect for fetching students (only for Instructor users)
  useEffect(() => {
    if (isInstructor && userCustomId) {
      setLoadingStudents(true);
      fetchStudents(userCustomId);
    }
  }, [isInstructor, userCustomId]);

  // Effect for fetching patients (only for Student users)
  useEffect(() => {
    if (isStudent && userCustomId) {
      setLoadingPatients(true);
      fetchPatients(userCustomId);
    }
  }, [isStudent, userCustomId]);

  // Effect for handling video tab setup
  useEffect(() => {
    if (selectedVideo && groupedVideos[selectedSession]) {
      const sessionVideos = groupedVideos[selectedSession];
      if (sessionVideos && sessionVideos.length) {
        setActiveTab(sessionVideos[0].fullVideoName);
      }
    }
  }, [selectedVideo, groupedVideos, selectedSession]);

  const handleTimeUpdate = (videoKey, currentTime) => {
    setVideoTimes((prev) => ({
      ...prev,
      [videoKey]: currentTime,
    }));
  };

  const handleInstructorClick = async (instructorCode) => {
    setSelectedInstructor(instructorCode);
    setSelectedStudent(null);
    setSelectedPatient(null);
    setLoadingStudents(true);
    console.log('instructorCode:', instructorCode);
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

      {(selectedInstructor || selectedStudent || selectedVideo || selectedPatient) && (
        <div className="breadcrumbs">
          <span onClick={() => { 
            setSelectedInstructor(null); 
            setSelectedStudent(null); 
            setSelectedVideo(null); 
            setSelectedPatient(null); 
          }}>
            Home
          </span>
          {selectedInstructor && (
            <span onClick={() => { 
              setSelectedStudent(null); 
              setSelectedPatient(null); 
              setSelectedVideo(null); 
            }}>
              / {selectedInstructor}
            </span>
          )}
          {selectedStudent && (
            <span onClick={() => { 
              setSelectedPatient(null); 
              setSelectedVideo(null); 
            }}>
              / {selectedStudent}
            </span>
          )}
          {selectedPatient && (
            <span>
              / {selectedPatient}
            </span>
          )}
        </div>
      )}

      <CommandForm2 />

      {isAdmin && !selectedInstructor && (
        loadingInstructors ? <Loader /> : (
          <InstructorsList instructors={instructors} onClickFromHomeInstructor={handleInstructorClick} />
        )
      )}

      {(isAdmin || isInstructor) && ((!selectedInstructor && isInstructor) || selectedInstructor) && !selectedStudent && (
        loadingStudents ? <Loader /> : (
          <StudentsList students={students} onClickFromHomeStudent={handleStudentClick} />
        )
      )}

      {(isAdmin || isInstructor || isStudent) && ((selectedStudent && !selectedPatient) || (isStudent && !selectedPatient)) && (
        loadingPatients ? <Loader /> : (
          <PatientsList patients={patients} onClickFromHomePatient={handlePatientClick} />
        )
      )}

      {(isAdmin || isInstructor || isStudent) && selectedPatient && (
        loadingVideos ? <Loader /> : (
          <VideosList groupedVideos={groupedVideos} onClickFromHomeVideo={handleVideoClick} />
        )
      )}

      {selectedVideo && (
        <VideoModal
          selectedVideo={selectedVideo}
          setSelectedVideo={setSelectedVideo}
          groupedVideos={groupedVideos}
          selectedSession={selectedSession}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleTimeUpdate={handleTimeUpdate}
        />
      )}
    </div>
  );
};

export default HomePage;
