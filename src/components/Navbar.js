import React, { useMemo, useState } from "react";
import {
  AppBar, Avatar, Badge, Box, Button, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, ListItemAvatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Providence_Adwork_Light_Logo.png";
import config from "../config";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { navFor, useSection } from "../utils/nav";
import { daysBetween, fmtDate, fmtTime, toKey } from "../utils/date";
import { sectionColors } from "../theme";

export const initials = (name = "") =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, userId } = useAuth();
  const { db, currentUser } = useData();
  const [drawer, setDrawer] = useState(false);
  const [userAnchor, setUserAnchor] = useState(null);
  const [bellAnchor, setBellAnchor] = useState(null);
  const items = navFor(currentUser);
  const section = useSection();

  const notifications = useMemo(() => {
    const today = toKey(new Date());
    const list = [];
    db.tasks.forEach((t) => {
      if (t.assignedTo === userId && t.status !== "Done") {
        const left = daysBetween(today, t.toDate);
        if (left < 0) list.push({ id: t.id, text: `Task overdue: ${t.title}`, path: "/tasks", color: sectionColors.defaulters.main });
        else if (left <= 2) list.push({ id: t.id, text: `Task due ${left === 0 ? "today" : `in ${left}d`}: ${t.title}`, path: "/tasks", color: sectionColors.tasks.main });
      }
    });
    db.meetings.forEach((m) => {
      if (m.date === today && m.status === "Scheduled" && m.attendees.includes(userId))
        list.push({ id: m.id, text: `Meeting today ${fmtTime(m.time)}: ${m.title}`, path: "/meetings", color: sectionColors.meetings.main });
    });
    if (currentUser?.role === "manager") {
      const n = db.leaves.filter((l) => l.status === "Pending").length;
      if (n) list.push({ id: "leaves", text: `${n} leave request${n > 1 ? "s" : ""} awaiting approval`, path: "/defaulters", color: sectionColors.attendance.main });
    }
    return list;
  }, [db, userId, currentUser]);

  const go = (path) => {
    setUserAnchor(null);
    setBellAnchor(null);
    setDrawer(false);
    navigate(path);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ background: section.color.gradient, transition: "background .3s" }} elevation={3}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 64 } }}>
          <IconButton color="inherit" edge="start" aria-label="Open menu" onClick={() => setDrawer(true)} sx={{ display: { lg: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Box component={RouterLink} to="/" sx={{ display: "flex", alignItems: "center", gap: 1.2, textDecoration: "none", color: "inherit", minWidth: 0 }}>
            <Box component="img" src={logo} alt={config.company} sx={{ height: { xs: 28, md: 34 }, maxWidth: 120, objectFit: "contain" }} />
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}>
              {config.appName}
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", lg: "flex" }, ml: 2, gap: 0.5, flexWrap: "nowrap", overflow: "hidden" }}>
            {items.map((n) => (
              <Button
                key={n.key}
                component={NavLink}
                to={n.path}
                end={n.path === "/"}
                color="inherit"
                size="small"
                sx={{ opacity: 0.85, px: 1.5, whiteSpace: "nowrap", "&.active": { opacity: 1, bgcolor: "rgba(255,255,255,.18)" } }}
              >
                {n.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" aria-label="Notifications" onClick={(e) => setBellAnchor(e.currentTarget)}>
            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} aria-label="Account menu" sx={{ p: 0.5 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>
              {initials(currentUser?.name)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={bellAnchor} open={!!bellAnchor} onClose={() => setBellAnchor(null)} slotProps={{ paper: { sx: { width: 320, maxWidth: "92vw" } } }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>Notifications</Typography>
        <Divider />
        {notifications.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>You're all caught up.</Typography>}
        {notifications.map((n) => (
          <MenuItem key={n.id + n.text} onClick={() => go(n.path)} sx={{ whiteSpace: "normal", borderLeft: `4px solid ${n.color}` }}>
            <Typography variant="body2">{n.text}</Typography>
          </MenuItem>
        ))}
      </Menu>

      <Menu id="user-menu" anchorEl={userAnchor} open={!!userAnchor} onClose={() => setUserAnchor(null)}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{currentUser?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{currentUser?.designation}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => go("/profile")}><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>Profile</MenuItem>
        <MenuItem onClick={() => go("/account")}><ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Account</MenuItem>
        <MenuItem onClick={() => { setUserAnchor(null); logout(); navigate("/login"); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Logout
        </MenuItem>
      </Menu>

      <Drawer open={drawer} onClose={() => setDrawer(false)} PaperProps={{ sx: { width: 270 } }}>
        <Box sx={{ background: sectionColors.home.gradient, color: "#fff", p: 2 }}>
          <Avatar sx={{ bgcolor: "secondary.main", mb: 1 }}>{initials(currentUser?.name)}</Avatar>
          <Typography fontWeight={700}>{currentUser?.name}</Typography>
          <Typography variant="caption">{currentUser?.designation}</Typography>
        </Box>
        <List>
          {items.map((n) => (
            <ListItemButton key={n.key} component={NavLink} to={n.path} end={n.path === "/"} onClick={() => setDrawer(false)}
              sx={{ "&.active": { bgcolor: n.color.light, "& .MuiListItemText-primary": { fontWeight: 700 } } }}>
              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar sx={{ bgcolor: n.color.main, width: 32, height: 32 }}><n.icon fontSize="small" /></Avatar>
              </ListItemAvatar>
              <ListItemText primary={n.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}
