import React, { useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Grid, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Typography,
  Autocomplete,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, FormDialog, PageHeader } from "../components/common";
import { fmtDate, fmtTime, toKey } from "../utils/date";
import { sectionColors } from "../theme";

const C = sectionColors.meetings;
const blank = (userId) => ({ title: "", date: toKey(new Date()), time: "10:00", duration: 30, location: "", agenda: "", attendees: [userId], status: "Scheduled" });

export default function Meetings() {
  const notify = useToast();
  const { db, currentUser, userName, meetings, isManager, activeUsers } = useData();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(null);
  const [delId, setDelId] = useState(null);
  const today = toKey(new Date());

  const list = useMemo(() => {
    const mine = db.meetings.filter((m) => m.attendees.includes(currentUser.id));
    const sorted = [...mine].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (tab === 0) return sorted.filter((m) => m.status === "Scheduled" && m.date >= today);
    if (tab === 1) return sorted.filter((m) => m.status === "Completed" || (m.status === "Scheduled" && m.date < today)).reverse();
    return sorted.filter((m) => m.status === "Cancelled");
  }, [db.meetings, tab, today, currentUser.id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = () => {
    const { id, ...data } = form;
    const row = { ...data, title: data.title.trim(), duration: Number(data.duration) || 30 };
    if (id) { meetings.update(id, row); notify("Meeting updated."); } else { meetings.add(row); notify("Meeting scheduled."); }
    setForm(null);
  };

  return (
    <Box>
      <PageHeader title="Meetings" subtitle="Schedule, review and manage meetings" color={C} icon={GroupsIcon}
        actions={<Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setForm(blank(currentUser.id))}>Schedule</Button>} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile
        sx={{ mb: 2, "& .MuiTabs-indicator": { bgcolor: C.main }, "& .Mui-selected": { color: `${C.dark} !important` } }}>
        <Tab label="Upcoming" /><Tab label="Past" /><Tab label="Cancelled" />
      </Tabs>

      {list.length === 0 && <EmptyState icon={GroupsIcon} color={C.main} title="No meetings here" hint="Schedule one with the button above." />}
      <Grid container spacing={2}>
        {list.map((m) => (
          <Grid item xs={12} md={6} key={m.id}>
            <Card sx={{ height: "100%", borderLeft: `5px solid ${C.main}` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ wordBreak: "break-word" }}>{m.title}</Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ color: "text.secondary", my: 0.5 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center"><AccessTimeIcon fontSize="small" /><Typography variant="body2">{fmtDate(m.date, { weekday: "short", day: "numeric", month: "short" })}, {fmtTime(m.time)} ({m.duration}m)</Typography></Stack>
                      {m.location && <Stack direction="row" spacing={0.5} alignItems="center"><PlaceIcon fontSize="small" /><Typography variant="body2">{m.location}</Typography></Stack>}
                    </Stack>
                  </Box>
                  <Stack direction="row">
                    <IconButton size="small" aria-label="Edit meeting" onClick={() => setForm(m)}><EditIcon fontSize="small" /></IconButton>
                    {isManager && <IconButton size="small" aria-label="Delete meeting" onClick={() => setDelId(m.id)}><DeleteIcon fontSize="small" /></IconButton>}
                  </Stack>
                </Stack>
                {m.agenda && <Typography variant="body2" sx={{ mb: 1 }}>{m.agenda}</Typography>}
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                  {m.attendees.map((a) => <Chip key={a} size="small" label={userName(a)} sx={{ bgcolor: C.light, color: C.dark }} />)}
                </Stack>
                <Stack direction="row" spacing={1}>
                  {m.status === "Scheduled" && (
                    <>
                      <Button size="small" variant="outlined" color="success" onClick={() => { meetings.update(m.id, { status: "Completed" }); notify("Marked as completed."); }}>Complete</Button>
                      {isManager && <Button size="small" variant="outlined" color="error" onClick={() => { meetings.update(m.id, { status: "Cancelled" }); notify("Meeting cancelled.", "info"); }}>Cancel</Button>}
                    </>
                  )}
                  {isManager && m.status === "Cancelled" && <Button size="small" onClick={() => meetings.update(m.id, { status: "Scheduled" })}>Reinstate</Button>}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <FormDialog open={!!form} title={form?.id ? "Edit meeting" : "Schedule meeting"} color={C} onClose={() => setForm(null)} onSubmit={save}
        disabled={!form?.title?.trim() || !form?.attendees?.length}>
        {form && (
          <>
            <TextField label="Title" value={form.title} onChange={set("title")} required autoFocus />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
              <TextField type="date" label="Date" value={form.date} onChange={set("date")} InputLabelProps={{ shrink: true }} required />
              <TextField type="time" label="Time" value={form.time} onChange={set("time")} InputLabelProps={{ shrink: true }} required />
              <TextField type="number" label="Minutes" value={form.duration} onChange={set("duration")} inputProps={{ min: 5, step: 5 }} />
            </Box>
            <TextField label="Location / link" value={form.location} onChange={set("location")} />
            <Autocomplete multiple options={db.users.filter((u) => activeUsers.includes(u) || form.attendees.includes(u.id)).map((u) => u.id)} getOptionLabel={userName} value={form.attendees}
              onChange={(_, v) => setForm((f) => ({ ...f, attendees: v }))}
              renderInput={(p) => <TextField {...p} label="Attendees" />} />
            <TextField label="Agenda" value={form.agenda} onChange={set("agenda")} multiline minRows={2} />
            <TextField select label="Status" value={form.status} onChange={set("status")}>{["Scheduled", "Completed", ...(isManager ? ["Cancelled"] : [])].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
          </>
        )}
      </FormDialog>
      <ConfirmDialog open={!!delId} title="Delete meeting?" message="This cannot be undone." onConfirm={() => { meetings.remove(delId); notify("Meeting deleted."); }} onClose={() => setDelId(null)} />
    </Box>
  );
}
