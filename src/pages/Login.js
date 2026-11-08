import React, { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Providence_Adwork_Light_Logo.png";
import config from "../config";
import { sectionColors } from "../theme";

const DEMO = [
  { label: "Employee", email: "amit@providenceadwork.com", password: "employee123" },
  { label: "Manager", email: "neha@providenceadwork.com", password: "manager123" },
];

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  const submit = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) return setError(res.error);
    navigate(location.state?.from?.pathname || "/", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: sectionColors.home.gradient }}>
      <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 4 }}>
        <Box sx={{ background: sectionColors.home.gradient, p: 3, textAlign: "center" }}>
          <Box component="img" src={logo} alt={config.company} sx={{ height: 44, maxWidth: "70%", objectFit: "contain" }} />
          <Typography sx={{ color: "#fff", mt: 1, fontWeight: 600 }}>{config.appName}</Typography>
        </Box>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant="h6" gutterBottom>Sign in</Typography>
          <form onSubmit={submit} noValidate>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" type="email" autoComplete="username" autoFocus value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }} required />
              <TextField label="Password" type={show ? "text" : "password"} autoComplete="current-password" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }} required
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="Toggle password visibility" onClick={() => setShow((s) => !s)} edge="end">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>) }} />
              <Button type="submit" variant="contained" size="large" disabled={!email || !password}>Sign in</Button>
            </Stack>
          </form>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3, mb: 1 }}>
            Demo accounts (click to fill):
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {DEMO.map((d) => (
              <Chip key={d.label} label={d.label} color="primary" variant="outlined" clickable
                onClick={() => { setEmail(d.email); setPassword(d.password); setError(""); }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
