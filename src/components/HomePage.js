// HomePage.js
import React, { useState, useEffect, useMemo } from 'react';
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

const HomePage = ({ msalInstance, userRole, userCustomId }) => {
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
  const [userEmail, setUserEmail] = useState(null); // State to store the user's email

  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos, groupedVideos } = useVideos();

  const isAdmin = useMemo(() => userRole.includes('Admins'), [userRole]);
  const isInstructor = useMemo(() => userRole.includes('Instructors'), [userRole]);
  const isStudent = useMemo(() => userRole.includes('Students'), [userRole]);

  const fetchGroups = async () => {
    if (!msalInstance) return;

    try {
      const token = (await msalInstance.acquireTokenSilent({
        scopes: ["api://aadb3f2f-d35f-4080-bc72-2ee32b741120/access_as_user"]
      })).accessToken;

      const groupIds = userRole.filter(role => role.includes('Group')).map(role => role.split('-')[1]);
      const groupNamesFetched = await fetchGroupNames(groupIds, token);
      
      setGroupNames(groupNamesFetched);
    } catch (error) {
      console.error('Error fetching group names:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [msalInstance, userRole]);

  // Fetch instructors for admins
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
        <h2>User Email</h2>
        <p>{userEmail ? userEmail : "Fetching email..."}</p> {/* Display user's email */}
      </div>

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

      {/* Other components like InstructorsList, StudentsList, etc. */}
      <InstructorsList instructors={instructors} onClick={handleInstructorClick} />
      <StudentsList students={students} onClick={handleStudentClick} />
      <PatientsList patients={patients} onClick={handlePatientClick} />
      <VideosList videos={videoList} onClick={handleVideoClick} />

      {loadingInstructors || loadingStudents || loadingPatients || loadingVideos ? <Loader /> : null}

      {/* Show video modal if selected */}
      {selectedVideo && <VideoModal video={selectedVideo} />}
    </div>
  );
};

export default HomePage;
