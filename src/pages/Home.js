import React from "react";
import { useNavigate } from "react-router-dom";
import PostCards from "../components/PostCards.js";
import Box from "@mui/material/Box";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ display: "block" }}>
        <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/attendence")}>
          <PostCards title="EFFORT / ATTENDENCE CALENDER" />
        </Box>
        <PostCards title="TASKS" />
        <PostCards title="CDP" />
        <PostCards title="MEETING" />
        <PostCards title="CREATIVE TEAM" />
        <PostCards title="ATTENDENCE / DAFAULTERS" />
      </Box>
    </>
  );
};

export default Home;
