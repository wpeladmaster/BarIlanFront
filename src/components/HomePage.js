import React, { useState, useEffect, useMemo } from "react";
import { useMsal } from "@azure/msal-react"; // MSAL hook
import InstructorsList from "./lists/InstructorsList";
import StudentsList from "./lists/StudentsList";
import PatientsList from "./lists/PatientsList";
import VideosList from "./lists/VideosList";
import useStudents from "../hooks/useStudents";
import usePatients from "../hooks/usePatients";
import useVideos from "../hooks/useVideos";
import VideoModal from "./VideoModal";
import Loader from "./Loader";
import fetchGroupNames from "../utils/fetchGroupNames";
import "../style/HomePage.scss";

const HomePage = ({ userRole, userCustomId }) => {
  const { instance, accounts } = useMsal(); // MSAL instance and account from context
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false); // Unified loader state
  const [groupNames, setGroupNames] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos } = useVideos();

  const isAdmin = useMemo(() => userRole.includes("Admins"), [userRole]);
  const isInstructor = useMemo(() => userRole.includes("Instructors"), [userRole]);
  const isStudent = useMemo(() => userRole.includes("Students"), [userRole]);

  const fetchGroups = async () => {
    if (!instance) return;

    try {
      setLoading(true); // Start loader
      const token = (
        await instance.acquireTokenSilent({
          scopes: ["User.Read"],
        })
      ).accessToken;

      const groupIds = userRole
        .filter((role) => role.includes("Group"))
        .map((role) => role.split("-")[1]);

      const groupNamesFetched = await fetchGroupNames(groupIds, token);
      setGroupNames(groupNamesFetched);
    } catch (error) {
      console.error("Error fetching group names:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [instance, userRole]);

  // Fetch instructors for admins
  useEffect(() => {
    if (isAdmin) {
      const fetchInstructors = async () => {
        setLoading(true);
        try {
          const token = (
            await instance.acquireTokenSilent({
              scopes: ["User.Read"],
            })
          ).accessToken;

          const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
          const response = await fetch(`${apiUrl}/fetchinstructors`, {
            method: "GET",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error("Failed to fetch instructors");
          const data = await response.json();
          setInstructors(data.unique_instructors_codes || []);
        } catch (error) {
          console.error("Error fetching instructors:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInstructors();
    }
  }, [isAdmin, instance]);

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: "/", // After logout, redirect to homepage
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      setUserEmail(accounts[0].username); // Set user email from MSAL account info
    }
  }, [accounts]);

  return (
    <div className="main-container homepage">
      <div>
        <h2>User Email</h2>
        <p>{userEmail || "Fetching email..."}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div>
        <h2>Group Names</h2>
        {groupNames.length > 0 ? (
          <ul>
            {groupNames.map((groupName, index) => (
              <li key={index}>{groupName}</li>
            ))}
          </ul>
        ) : loading ? (
          <p>Loading group names...</p>
        ) : (
          <p>No groups available</p>
        )}
      </div>

      <InstructorsList instructors={instructors} />
      <StudentsList students={students} />
      <PatientsList patients={patients} />
      <VideosList videos={videoList} />
      {loading && <Loader />}
      {selectedVideo && <VideoModal video={selectedVideo} />}
    </div>
  );
};

export default HomePage;
