import React, { useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, FormDialog, PageHeader } from "../components/common";
import { daysBetween, fmtDate, toKey } from "../utils/date";
import { sectionColors } from "../theme";

const C = sectionColors.tasks;
const COLUMNS = [
  { key: "ToDo", color: "#6366f1", bg: "#eef2ff" },
  { key: "In Progress", color: "#0ea5e9", bg: "#e0f2fe" },
  { key: "On Hold", color: "#f59e0b", bg: "#fef3c7" },
  { key: "Done", color: "#10b981", bg: "#d1fae5" },
];
const SPRINTS = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"];
const PRIORITY_COLOR = { High: "error", Medium: "warning", Low: "default" };
const blank = (userId, sprint) => ({
  title: "", description: "", status: "ToDo", sprint, assignedTo: userId, priority: "Medium",
  fromDate: toKey(new Date()), toDate: toKey(new Date(Date.now() + 6 * 86400000)),
});

export default function Tasks() {
  const notify = useToast();
  const { db, currentUser, userName, tasks, isManager, activeUsers } = useData();
  const [sprint, setSprint] = useState("All");
  const [assignee, setAssignee] = useState("all");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // task being edited/created
  const [delId, setDelId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const today = toKey(new Date());

  const visible = useMemo(
    () => db.tasks.filter((t) =>
      (sprint === "All" || t.sprint === sprint) &&
      (assignee === "all" || t.assignedTo === (assignee === "me" ? currentUser.id : assignee)) &&
      (!q || (t.title + t.description).toLowerCase().includes(q.toLowerCase()))),
    [db.tasks, sprint, assignee, q, currentUser.id]
  );

  const save = () => {
    if (new Date(form.toDate) < new Date(form.fromDate)) return notify("End date cannot be before start date.", "warning");
    const { id, ...data } = form;
    if (id) { tasks.update(id, data); notify("Task updated."); } else { tasks.add({ ...data, title: data.title.trim() }); notify("Task created."); }
    setForm(null);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onDrop = (status) => (e) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    const t = db.tasks.find((x) => x.id === id);
    if (t && t.status !== status) { tasks.update(id, { status }); notify(`Moved to ${status}.`); }
  };

  return (
    <Box>
      <PageHeader title="Tasks" subtitle="Sprint board — drag cards between columns, or use the status menu on touch screens" color={C} icon={TaskAltIcon}
        actions={<Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setForm(blank(currentUser.id, sprint === "All" ? "Sprint 2" : sprint))}>New task</Button>} />

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" } }}>
          <TextField placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <TextField select label="Sprint" value={sprint} onChange={(e) => setSprint(e.target.value)}>
            <MenuItem value="All">All sprints</MenuItem>
            {SPRINTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select label="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <MenuItem value="all">Everyone</MenuItem>
            <MenuItem value="me">Assigned to me</MenuItem>
            {db.users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
          </TextField>
        </CardContent>
      </Card>

      <div className="kanban">
        {COLUMNS.map((col) => {
          const items = visible.filter((t) => t.status === col.key);
          return (
            <Box key={col.key} className={`kanban-col ${dragOver === col.key ? "drag-over" : ""}`}
              sx={{ bgcolor: col.bg, borderRadius: 3, p: 1.5, color: col.color }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
              onDragLeave={() => setDragOver((d) => (d === col.key ? null : d))}
              onDrop={onDrop(col.key)}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography fontWeight={700}>{col.key}</Typography>
                <Chip size="small" label={items.length} sx={{ bgcolor: col.color, color: "#fff", fontWeight: 700 }} />
              </Stack>
              <Stack spacing={1.5}>
                {items.length === 0 && <Typography variant="body2" sx={{ opacity: 0.7, textAlign: "center", py: 2 }}>Drop tasks here</Typography>}
                {items.map((t) => {
                  const late = t.status !== "Done" && daysBetween(today, t.toDate) < 0;
                  return (
                    <Card key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                      sx={{ cursor: "grab", borderLeft: `4px solid ${col.color}`, color: "text.primary" }}>
                      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>{t.title}</Typography>
                          <Stack direction="row" sx={{ mr: -0.5, mt: -0.5 }}>
                            <Tooltip title="Edit"><IconButton size="small" aria-label="Edit task" onClick={() => setForm(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            {isManager && <Tooltip title="Delete"><IconButton size="small" aria-label="Delete task" onClick={() => setDelId(t.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>}
                          </Stack>
                        </Stack>
                        {t.description && <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>{t.description}</Typography>}
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ my: 0.8 }}>
                          <Chip size="small" label={t.priority} color={PRIORITY_COLOR[t.priority]} variant="outlined" />
                          <Chip size="small" label={t.sprint} sx={{ bgcolor: C.light, color: C.dark }} />
                          {late && <Chip size="small" label="Overdue" color="error" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {userName(t.assignedTo)} · {fmtDate(t.fromDate, { day: "numeric", month: "short" })} → {fmtDate(t.toDate, { day: "numeric", month: "short" })}
                        </Typography>
                        <TextField select size="small" value={t.status} onChange={(e) => tasks.update(t.id, { status: e.target.value })}
                          sx={{ mt: 1, display: { xs: "block", md: "none" } }} aria-label="Change status">
                          {COLUMNS.map((c) => <MenuItem key={c.key} value={c.key}>{c.key}</MenuItem>)}
                        </TextField>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </div>
      {visible.length === 0 && <EmptyState icon={TaskAltIcon} color={C.main} title="No tasks match your filters" hint="Try a different sprint or search." />}

      <FormDialog open={!!form} title={form?.id ? "Edit task" : "New task"} color={C} onClose={() => setForm(null)} onSubmit={save} disabled={!form?.title?.trim()}>
        {form && (
          <>
            <TextField label="Title" value={form.title} onChange={set("title")} required autoFocus />
            <TextField label="Description" value={form.description} onChange={set("description")} multiline minRows={2} />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField select label="Status" value={form.status} onChange={set("status")}>{COLUMNS.map((c) => <MenuItem key={c.key} value={c.key}>{c.key}</MenuItem>)}</TextField>
              <TextField select label="Priority" value={form.priority} onChange={set("priority")}>{["High", "Medium", "Low"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}</TextField>
              <TextField select label="Sprint" value={form.sprint} onChange={set("sprint")}>{SPRINTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
              <TextField select label="Assignee" value={form.assignedTo} onChange={set("assignedTo")}>{db.users.filter((u) => activeUsers.includes(u) || u.id === form.assignedTo).map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}</TextField>
              <TextField type="date" label="From" value={form.fromDate} onChange={set("fromDate")} InputLabelProps={{ shrink: true }} required />
              <TextField type="date" label="To" value={form.toDate} onChange={set("toDate")} InputLabelProps={{ shrink: true }} required />
            </Box>
          </>
        )}
      </FormDialog>
      <ConfirmDialog open={!!delId} title="Delete task?" message="This cannot be undone." onConfirm={() => { tasks.remove(delId); notify("Task deleted."); }} onClose={() => setDelId(null)} />
    </Box>
  );
}
