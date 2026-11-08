import HomeIcon from "@mui/icons-material/Home";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import BrushIcon from "@mui/icons-material/Brush";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import BadgeIcon from "@mui/icons-material/Badge";
import { sectionColors } from "../theme";

export const NAV_ITEMS = [
  { key: "home", label: "Dashboard", path: "/", icon: HomeIcon, color: sectionColors.home, desc: "Your day at a glance" },
  { key: "attendance", label: "Attendance", path: "/attendance", icon: EventAvailableIcon, color: sectionColors.attendance, desc: "Effort & attendance calendar" },
  { key: "tasks", label: "Tasks", path: "/tasks", icon: TaskAltIcon, color: sectionColors.tasks, desc: "Sprint board for your team" },
  { key: "cdp", label: "CDP", path: "/cdp", icon: TrendingUpIcon, color: sectionColors.cdp, desc: "Career development plan" },
  { key: "meetings", label: "Meetings", path: "/meetings", icon: GroupsIcon, color: sectionColors.meetings, desc: "Schedule & RSVP" },
  { key: "creative", label: "Creative Team", path: "/creative", icon: BrushIcon, color: sectionColors.creative, desc: "Design requests pipeline" },
  { key: "defaulters", label: "Defaulters", path: "/defaulters", icon: GppMaybeIcon, color: sectionColors.defaulters, desc: "Late & absent report", managerOnly: true },
  { key: "employees", label: "Employees", path: "/employees", icon: BadgeIcon, color: sectionColors.employees, desc: "Add staff & manage logins", managerOnly: true },
];

export const navFor = (user) => NAV_ITEMS.filter((n) => !n.managerOnly || user?.role === "manager");
