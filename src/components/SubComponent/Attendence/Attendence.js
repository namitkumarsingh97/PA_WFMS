import React from "react";
import { useNavigate } from "react-router-dom";
import attendanceData from "../../../data/attendanceData.js";

const Attendence = () => {
  const navigate = useNavigate();

  console.log("data: ", attendanceData);

  return (
    <div>
      <button onClick={() => navigate("/")} style={{ marginBottom: "20px" }}>
        Back to Home
      </button>

      <h1>
        Effort / Attendance Calendar - {attendanceData.month}{" "}
        {attendanceData.year}
      </h1>
      <p>This is the Attendence page.</p>
    </div>
  );
};

export default Attendence;
