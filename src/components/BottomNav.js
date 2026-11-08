import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import GroupsIcon from "@mui/icons-material/Groups";
import { useLocation, useNavigate } from "react-router-dom";
import { sectionColors } from "../theme";

const TABS = [
  { label: "Dashboard", path: "/", icon: <HomeIcon />, color: sectionColors.home.main },
  { label: "Attendance", path: "/attendance", icon: <EventAvailableIcon />, color: sectionColors.attendance.main },
  { label: "Tasks", path: "/tasks", icon: <TaskAltIcon />, color: sectionColors.tasks.main },
  { label: "Meetings", path: "/meetings", icon: <GroupsIcon />, color: sectionColors.meetings.main },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const idx = TABS.findIndex((t) => (t.path === "/" ? pathname === "/" : pathname.startsWith(t.path)));

  return (
    <Paper
      elevation={8}
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar, display: { xs: "block", md: "none" }, pb: "env(safe-area-inset-bottom)" }}
    >
      <BottomNavigation showLabels value={idx === -1 ? false : idx} onChange={(_, v) => navigate(TABS[v].path)}>
        {TABS.map((t, i) => (
          <BottomNavigationAction
            key={t.path}
            label={t.label}
            icon={t.icon}
            sx={{ minWidth: 0, "&.Mui-selected": { color: t.color } }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
