import React, { useState } from "react";
import { Avatar, Box, Button, Card, CardContent, Chip, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, FormDialog, PageHeader } from "../components/common";
import { daysBetween, fmtDate, toKey } from "../utils/date";
import { initials } from "../components/Navbar";
import { sectionColors } from "../theme";

const C = sectionColors.creative;
const STAGES = [
  { key: "Brief", color: "#6366f1", bg: "#eef2ff" },
  { key: "In Design", color: "#db2777", bg: "#fce7f3" },
  { key: "In Review", color: "#d97706", bg: "#fef3c7" },
  { key: "Approved", color: "#059669", bg: "#d1fae5" },
];
const TYPES = ["Banner", "Social", "Video", "Print", "Web", "Other"];
const PRI = { High: "error", Medium: "warning", Low: "default" };
const blank = (owner) => ({ title: "", type: "Banner", client: "", priority: "Medium", stage: "Brief", owner, due: toKey(new Date(Date.now() + 7 * 86400000)), brief: "" });

export default function Creative() {
  const notify = useToast();
  const { db, currentUser, userName, creative, isManager } = useData();
  const [form, setForm] = useState(null);
  const [delId, setDelId] = useState(null);
  const [type, setType] = useState("All");
  const today = toKey(new Date());
  const items = db.creative.filter((r) => type === "All" || r.type === type);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    const { id, ...data } = form;
    const row = { ...data, title: data.title.trim() };
    if (id) { creative.update(id, row); notify("Request updated."); } else { creative.add(row); notify("Request created."); }
    setForm(null);
  };
  const advance = (r) => {
    const i = STAGES.findIndex((s) => s.key === r.stage);
    if (i < STAGES.length - 1) { creative.update(r.id, { stage: STAGES[i + 1].key }); notify(`Moved to ${STAGES[i + 1].key}.`); }
  };

  return (
    <Box>
      <PageHeader title="Creative Team" subtitle="Design requests from brief to approval" color={C} icon={BrushIcon}
        actions={<Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setForm(blank(currentUser.id))}>New request</Button>} />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {["All", ...TYPES].map((t) => (
          <Chip key={t} label={t} clickable onClick={() => setType(t)} variant={type === t ? "filled" : "outlined"}
            sx={type === t ? { bgcolor: C.main, color: "#fff", "&:hover": { bgcolor: C.dark } } : { borderColor: C.main, color: C.dark }} />
        ))}
      </Stack>

      <div className="kanban">
        {STAGES.map((st) => {
          const col = items.filter((r) => r.stage === st.key);
          return (
            <Box key={st.key} sx={{ bgcolor: st.bg, borderRadius: 3, p: 1.5, minHeight: 120 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography fontWeight={700} sx={{ color: st.color }}>{st.key}</Typography>
                <Chip size="small" label={col.length} sx={{ bgcolor: st.color, color: "#fff", fontWeight: 700 }} />
              </Stack>
              <Stack spacing={1.5}>
                {col.map((r) => {
                  const overdue = r.stage !== "Approved" && daysBetween(today, r.due) < 0;
                  return (
                    <Card key={r.id} sx={{ borderTop: `4px solid ${st.color}` }}>
                      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>{r.title}</Typography>
                          <Stack direction="row" sx={{ mt: -0.5, mr: -0.5 }}>
                            <IconButton size="small" aria-label="Edit request" onClick={() => setForm(r)}><EditIcon fontSize="small" /></IconButton>
                            {isManager && <IconButton size="small" aria-label="Delete request" onClick={() => setDelId(r.id)}><DeleteIcon fontSize="small" /></IconButton>}
                          </Stack>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{r.client || "No client"}</Typography>
                        {r.brief && <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>{r.brief}</Typography>}
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ my: 0.8 }}>
                          <Chip size="small" label={r.type} sx={{ bgcolor: C.light, color: C.dark }} />
                          <Chip size="small" label={r.priority} color={PRI[r.priority]} variant="outlined" />
                          {overdue && <Chip size="small" label="Overdue" color="error" />}
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: C.main }}>{initials(userName(r.owner))}</Avatar>
                            <Typography variant="caption">{fmtDate(r.due, { day: "numeric", month: "short" })}</Typography>
                          </Stack>
                          {r.stage !== "Approved" && <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => advance(r)} sx={{ color: C.dark }}>Next</Button>}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </div>

      <FormDialog open={!!form} title={form?.id ? "Edit request" : "New request"} color={C} onClose={() => setForm(null)} onSubmit={save} disabled={!form?.title?.trim()}>
        {form && (
          <>
            <TextField label="Title" value={form.title} onChange={set("title")} required autoFocus />
            <TextField label="Client" value={form.client} onChange={set("client")} />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField select label="Type" value={form.type} onChange={set("type")}>{TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
              <TextField select label="Priority" value={form.priority} onChange={set("priority")}>{["High", "Medium", "Low"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
              <TextField select label="Stage" value={form.stage} onChange={set("stage")}>{STAGES.map((s) => <MenuItem key={s.key} value={s.key}>{s.key}</MenuItem>)}</TextField>
              <TextField select label="Owner" value={form.owner} onChange={set("owner")}>{db.users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}</TextField>
              <TextField type="date" label="Due" value={form.due} onChange={set("due")} InputLabelProps={{ shrink: true }} required />
            </Box>
            <TextField label="Brief" value={form.brief} onChange={set("brief")} multiline minRows={2} />
          </>
        )}
      </FormDialog>
      <ConfirmDialog open={!!delId} title="Delete request?" message="This cannot be undone." onConfirm={() => { creative.remove(delId); notify("Request deleted."); }} onClose={() => setDelId(null)} />
    </Box>
  );
}
