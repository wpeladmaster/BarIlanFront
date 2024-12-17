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
import fetchGroupNames from "../utils/fetchGroupNames";
import "../style/HomePage.scss";

const HomePage = ({ userRole }) => {
  const { instance } = useMsal();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos } = useVideos();
  const isAdmin = useMemo(() => userRole.includes("Admins"), [userRole]);

  console.log("HomePage.js: userRole - ", userRole);
  

  useEffect(() => {
    //if (!isAdmin) return;

    const fetchInstructors = async () => {
      console.log("HomePage.js: Fetching instructors...");
      setLoading(true);
      try {
        const token = (await instance.acquireTokenSilent({ scopes: ["User.Read"] })).accessToken;
        const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;

        const response = await fetch(`${apiUrl}/fetchinstructors`, {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch instructors");
        const data = await response.json();
        console.log("HomePage.js: Instructors fetched:", data);
        setInstructors(data.unique_instructors_codes || []);
      } catch (error) {
        console.error("HomePage.js: Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [instance, isAdmin]);

  return (
    <div className="main-container homepage">
      <h2>Homepage</h2>
      {loading && <Loader />}

      {isAdmin && (
        <>
          <h3>Instructors List</h3>
          <InstructorsList instructors={instructors} />
        </>
      )}
      <StudentsList students={students} />
      <PatientsList patients={patients} />
      <VideosList videos={videoList} />
    </div>
  );
};

export default HomePage;
