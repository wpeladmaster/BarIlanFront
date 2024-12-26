import React, { useState, useEffect, useMemo } from "react";
import { useMsal } from "@azure/msal-react";
import InstructorsList from "./lists/InstructorsList";
import StudentsList from "./lists/StudentsList";
import PatientsList from "./lists/PatientsList";
import VideosList from "./lists/VideosList";
import useStudents from "../hooks/useStudents";
import usePatients from "../hooks/usePatients";
import useVideos from "../hooks/useVideos";
import VideoModal from "./VideoModal";
import Loader from "./Loader";
import "../style/HomePage.scss";

const HomePage = ({ isAuthenticated, groupNames, userRole }) => {
  const { instance } = useMsal();
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

  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos, groupedVideos } = useVideos();

  // useEffect(() => {
  //   console.log('userRole:', userRole);
  //   console.log('groupNames:', groupNames);
  //   console.log('isAuthenticated:', isAuthenticated);
  // }, [userRole, isAuthenticated, groupNames]);

  const isAdmin = useMemo(() => groupNames.includes('Admins'), [groupNames]);
  const isInstructor = useMemo(() => groupNames.includes('Supervisers'), [groupNames]);
  const isStudent = useMemo(() => groupNames.includes('Therapists'), [groupNames]);

  console.log("isAdmin:", isAdmin);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchInstructors = async () => {
      try {
        const token = (await instance.acquireTokenSilent({ scopes: ["openid", "profile", "email", "User.Read", "api://saml_barilan/user_impersonation/user_impersonation"] })).accessToken;
        const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
        const fullUrl = `${apiUrl}/fetchinstructors`;
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("instructors: Response error text:", errorText);
          if (response.status === 403) {
            throw new Error("Authorization error: Ensure your token has correct permissions");
          }
          throw new Error(`Failed to fetch instructors: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        setInstructors(data.unique_instructors_codes || []);
        setLoadingInstructors(false);
      } catch (error) {
        console.error("HomePage.js: Error fetching instructors:", error.message);
        setLoadingInstructors(false);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, [instance, isAdmin]);

  useEffect(() => {
    const loadStudents = async () => {
      if (isInstructor && isAuthenticated && userRole) {
        setLoadingStudents(true);
        await fetchStudents(userRole);
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [isInstructor, isAuthenticated, userRole, fetchStudents]);

  useEffect(() => {
    const loadPatients = async () => {
      if (isStudent && isAuthenticated && userRole) {
        setLoadingPatients(true);
        await fetchPatients(userRole);
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, [isStudent, isAuthenticated, userRole, fetchPatients]);

  useEffect(() => {
    if (selectedVideo && selectedSession && groupedVideos[selectedSession]) {
      const sessionVideos = groupedVideos[selectedSession];
      if (sessionVideos && sessionVideos.length) {
        setActiveTab(sessionVideos.find(v => v.fullVideoName === selectedVideo.fullVideoName)?.fullVideoName || sessionVideos[0].fullVideoName);
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

  const handlePatientClick = async (patientCode) => {
    if (selectedPatient === patientCode) return;
    setSelectedPatient(patientCode);
    setSelectedVideo(null);
    setLoadingVideos(true);
  
    try {
      await fetchVideos(patientCode);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };
  
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setSelectedSession(video.sessionName || '');
    setActiveTab(video.fullVideoName || '');
  };

  return (
    <div className="main-container homepage">
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
