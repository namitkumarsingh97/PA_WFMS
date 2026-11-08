import React, { useState } from "react";
import { Avatar, Box, Button, Card, CardContent, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/common";
import { initials } from "../components/Navbar";
import { fmtDate } from "../utils/date";
import { sectionColors } from "../theme";

const C = sectionColors.home;

export default function Profile() {
  const notify = useToast();
  const { currentUser, updateUser } = useData();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const dirty = name.trim() !== currentUser.name || phone !== currentUser.phone;

  const save = (e) => {
    e.preventDefault();
    if (!name.trim()) return notify("Name is required.", "warning");
    updateUser(currentUser.id, { name: name.trim(), phone: phone.trim() });
    notify("Profile updated.");
  };

  return (
    <Box>
      <PageHeader title="My Profile" subtitle="Your details" color={C} icon={PersonIcon} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card><CardContent sx={{ textAlign: "center" }}>
            <Avatar sx={{ width: 96, height: 96, fontSize: 36, mx: "auto", mb: 1.5, background: C.gradient }}>{initials(currentUser.name)}</Avatar>
            <Typography variant="h6">{currentUser.name}</Typography>
            <Typography color="text.secondary">{currentUser.designation}</Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
              <Chip label={currentUser.dept} color="primary" size="small" />
              <Chip label={currentUser.role === "manager" ? "Manager" : "Employee"} color="secondary" size="small" />
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card><CardContent>
            <form onSubmit={save}>
              <Stack spacing={2}>
                <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <TextField label="Email" value={currentUser.email} disabled />
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField label="Department" value={currentUser.dept} disabled />
                  <TextField label="Joined" value={fmtDate(currentUser.joined)} disabled />
                </Box>
                <Box><Button type="submit" variant="contained" disabled={!dirty}>Save changes</Button></Box>
              </Stack>
            </form>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
