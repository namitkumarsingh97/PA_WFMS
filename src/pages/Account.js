import React, { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, PageHeader } from "../components/common";
import config from "../config";
import { sectionColors } from "../theme";

const C = sectionColors.home;

export default function Account() {
  const notify = useToast();
  const { changePassword } = useAuth();
  const { resetData, isManager } = useData();
  const { logout } = useAuth();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("Passwords do not match.");
    const res = changePassword(cur, next);
    if (!res.ok) return setError(res.error);
    setCur(""); setNext(""); setConfirm(""); setError("");
    notify("Password changed.");
  };

  return (
    <Box>
      <PageHeader title="Account" subtitle="Security and data" color={C} icon={SettingsIcon} />
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>Change password</Typography>
          <form onSubmit={submit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField type="password" label="Current password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required />
              <TextField type="password" label="New password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
              <TextField type="password" label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              <Box><Button type="submit" variant="contained">Update password</Button></Box>
            </Stack>
          </form>
        </CardContent></Card>

        {isManager && <Card><CardContent>
          <Typography variant="h6" gutterBottom>Data</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Data is stored in this browser. Resetting restores the sample data for all users.
          </Typography>
          <Button color="error" variant="outlined" onClick={() => setResetOpen(true)}>Reset app data</Button>
        </CardContent></Card>}
        <Typography variant="caption" color="text.secondary">{config.appName} v{config.version} · {config.env}</Typography>
      </Stack>
      <ConfirmDialog open={resetOpen} title="Reset all data?" message="All data, added employees and passwords will be reset to the sample set and you will be signed out." confirmLabel="Reset"
        onConfirm={() => { resetData(); logout(); }} onClose={() => setResetOpen(false)} />
    </Box>
  );
}
