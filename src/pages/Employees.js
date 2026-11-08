import React, { useState } from "react";
import {
  Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton,
  InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/VpnKey";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, FormDialog, PageHeader } from "../components/common";
import { initials } from "../components/Navbar";
import { sectionColors } from "../theme";

const C = sectionColors.employees;
const DEPTS = ["Engineering", "Creative", "Marketing", "Operations", "HR", "Sales", "Finance"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const genPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const buf = new Uint32Array(10);
  window.crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join("");
};

const blank = () => ({ name: "", email: "", phone: "", dept: "Engineering", designation: "", role: "employee", password: genPassword() });

export default function Employees() {
  const notify = useToast();
  const { userId, credentials } = useAuth();
  const { db, addEmployee, emailTaken, updateUser, setEmployeePassword, setEmployeeActive } = useData();
  const [form, setForm] = useState(null); // new employee
  const [edit, setEdit] = useState(null); // existing profile
  const [pw, setPw] = useState(null); // { user, password } reset dialog
  const [created, setCreated] = useState(null); // credentials to hand over
  const [toggle, setToggle] = useState(null);
  const [q, setQ] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const users = db.users.filter((u) => !q || `${u.name} ${u.email} ${u.dept}`.toLowerCase().includes(q.toLowerCase()));

  const formError = form && (
    (form.email && !EMAIL_RE.test(form.email.trim()) && "Enter a valid email address.") ||
    (form.email && emailTaken(form.email) && "An account with this email already exists.") ||
    (form.password.length < 8 && "Password must be at least 8 characters.") || ""
  );

  const create = () => {
    const { password, ...profile } = form;
    addEmployee({ ...profile, name: profile.name.trim(), password });
    setCreated({ name: profile.name.trim(), email: profile.email.trim(), password });
    setForm(null);
    notify("Employee added.");
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); notify("Copied to clipboard."); } catch { notify("Copy failed — select the text manually.", "warning"); }
  };

  return (
    <Box>
      <PageHeader title="Employees" subtitle="Add staff, issue logins and control portal access" color={C} icon={BadgeIcon}
        actions={<Button variant="contained" color="secondary" startIcon={<PersonAddIcon />} onClick={() => setForm(blank())}>Add employee</Button>} />

      <Card sx={{ mb: 2 }}><CardContent>
        <TextField placeholder="Search by name, email or department" value={q} onChange={(e) => setQ(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
      </CardContent></Card>

      {users.length === 0 && <EmptyState icon={BadgeIcon} color={C.main} title="No employees found" />}
      <Grid container spacing={2}>
        {users.map((u) => {
          const active = credentials[u.id]?.active !== false;
          const self = u.id === userId;
          return (
            <Grid item xs={12} md={6} lg={4} key={u.id}>
              <Card sx={{ height: "100%", borderTop: `4px solid ${active ? C.main : "#94a3b8"}`, opacity: active ? 1 : 0.75 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ background: C.gradient, width: 48, height: 48 }}>{initials(u.name)}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>{u.name}{self && " (you)"}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{u.designation || "—"} · {u.dept}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>{u.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ my: 1.5 }}>
                    <Chip size="small" label={u.role === "manager" ? "Manager" : "Employee"} sx={{ bgcolor: C.light, color: C.dark }} />
                    <Chip size="small" label={active ? "Active" : "Access disabled"} color={active ? "success" : "default"} />
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit details"><IconButton aria-label="Edit employee" size="small" onClick={() => setEdit(u)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Reset password"><IconButton aria-label="Reset password" size="small" onClick={() => setPw({ user: u, password: genPassword() })}><KeyIcon fontSize="small" /></IconButton></Tooltip>
                    {!self && (
                      <Tooltip title={active ? "Disable access" : "Enable access"}>
                        <IconButton aria-label={active ? "Disable access" : "Enable access"} size="small" color={active ? "error" : "success"} onClick={() => setToggle(u)}>
                          {active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* add */}
      <FormDialog open={!!form} title="Add employee" color={C} onClose={() => setForm(null)} onSubmit={create} submitLabel="Create login"
        disabled={!form?.name.trim() || !form?.email.trim() || !!formError}>
        {form && (
          <>
            <TextField label="Full name" value={form.name} onChange={set("name")} required autoFocus />
            <TextField label="Work email (login ID)" type="email" value={form.email} onChange={set("email")} required
              error={!!formError && formError.includes("email")} helperText={formError && formError.includes("email") ? formError : " "} />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField select label="Department" value={form.dept} onChange={set("dept")}>{DEPTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
              <TextField label="Designation" value={form.designation} onChange={set("designation")} />
              <TextField label="Phone" value={form.phone} onChange={set("phone")} />
              <TextField select label="Portal role" value={form.role} onChange={set("role")}>
                <MenuItem value="employee">Employee</MenuItem><MenuItem value="manager">Manager</MenuItem>
              </TextField>
            </Box>
            <TextField label="Temporary password" value={form.password} onChange={set("password")} required
              error={form.password.length < 8} helperText="Share this with the employee; they can change it under Account."
              InputProps={{ endAdornment: <InputAdornment position="end"><Tooltip title="Generate"><IconButton aria-label="Generate password" onClick={() => setForm((f) => ({ ...f, password: genPassword() }))}><AutorenewIcon /></IconButton></Tooltip></InputAdornment> }} />
          </>
        )}
      </FormDialog>

      {/* edit */}
      <FormDialog open={!!edit} title="Edit employee" color={C} onClose={() => setEdit(null)} disabled={!edit?.name?.trim()}
        onSubmit={() => { updateUser(edit.id, { name: edit.name.trim(), phone: edit.phone, dept: edit.dept, designation: edit.designation, role: edit.id === userId ? "manager" : edit.role }); notify("Employee updated."); setEdit(null); }}>
        {edit && (
          <>
            <TextField label="Full name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} required />
            <TextField label="Email" value={edit.email} disabled />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField select label="Department" value={edit.dept} onChange={(e) => setEdit({ ...edit, dept: e.target.value })}>{[...new Set([...DEPTS, edit.dept])].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
              <TextField label="Designation" value={edit.designation} onChange={(e) => setEdit({ ...edit, designation: e.target.value })} />
              <TextField label="Phone" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
              <TextField select label="Portal role" value={edit.role} disabled={edit.id === userId} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>
                <MenuItem value="employee">Employee</MenuItem><MenuItem value="manager">Manager</MenuItem>
              </TextField>
            </Box>
          </>
        )}
      </FormDialog>

      {/* reset password */}
      <FormDialog open={!!pw} title={`Reset password — ${pw?.user.name || ""}`} color={C} onClose={() => setPw(null)} submitLabel="Set password" disabled={!pw || pw.password.length < 8}
        onSubmit={() => { setEmployeePassword(pw.user.id, pw.password); setCreated({ name: pw.user.name, email: pw.user.email, password: pw.password }); setPw(null); notify("Password updated."); }}>
        {pw && (
          <TextField label="New password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} helperText="Minimum 8 characters."
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label="Generate password" onClick={() => setPw({ ...pw, password: genPassword() })}><AutorenewIcon /></IconButton></InputAdornment> }} />
        )}
      </FormDialog>

      {/* credentials hand-over */}
      <Dialog open={!!created} onClose={() => setCreated(null)}>
        <DialogTitle>Login credentials</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Share these with <b>{created?.name}</b>. The password is shown only now.</Typography>
          <Box sx={{ bgcolor: C.light, borderRadius: 2, p: 2, fontFamily: "monospace", wordBreak: "break-all" }}>
            <div>Email: {created?.email}</div>
            <div>Password: {created?.password}</div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<ContentCopyIcon />} onClick={() => copy(`Email: ${created.email}\nPassword: ${created.password}`)}>Copy</Button>
          <Button variant="contained" onClick={() => setCreated(null)}>Done</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!toggle} title={credentials[toggle?.id]?.active !== false ? "Disable access?" : "Enable access?"}
        message={credentials[toggle?.id]?.active !== false ? `${toggle?.name} will no longer be able to sign in. Their data is kept.` : `${toggle?.name} will be able to sign in again.`}
        confirmLabel={credentials[toggle?.id]?.active !== false ? "Disable" : "Enable"}
        onConfirm={() => { const act = credentials[toggle.id]?.active !== false; setEmployeeActive(toggle.id, !act); notify(act ? "Access disabled." : "Access enabled.", act ? "info" : "success"); }}
        onClose={() => setToggle(null)} />
    </Box>
  );
}
