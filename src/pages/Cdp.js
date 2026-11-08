import React, { useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Grid, IconButton, LinearProgress, MenuItem, Slider, Stack, TextField, Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, FormDialog, PageHeader } from "../components/common";
import { daysBetween, fmtDate, toKey } from "../utils/date";
import { sectionColors } from "../theme";

const C = sectionColors.cdp;
const CATEGORIES = ["Skill", "Certification", "Leadership", "Project", "Mentoring"];
const CAT_COLOR = { Skill: "#2563eb", Certification: "#7c3aed", Leadership: "#d97706", Project: "#0891b2", Mentoring: "#db2777" };
const blank = (userId) => ({ userId, title: "", category: "Skill", progress: 0, targetDate: toKey(new Date(Date.now() + 90 * 86400000)), status: "In Progress", notes: "" });

export default function Cdp() {
  const notify = useToast();
  const { db, currentUser, cdp } = useData();
  const [form, setForm] = useState(null);
  const [delId, setDelId] = useState(null);
  const goals = db.cdp.filter((g) => g.userId === currentUser.id);
  const avg = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const today = toKey(new Date());
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    const { id, ...data } = form;
    const status = data.progress >= 100 ? "Completed" : data.status === "Completed" ? "In Progress" : data.status;
    const row = { ...data, status, title: data.title.trim() };
    if (id) { cdp.update(id, row); notify("Goal updated."); } else { cdp.add(row); notify("Goal added."); }
    setForm(null);
  };

  return (
    <Box>
      <PageHeader title="Career Development Plan" subtitle="Set goals, track growth" color={C} icon={TrendingUpIcon}
        actions={<Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setForm(blank(currentUser.id))}>New goal</Button>} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[["Overall progress", `${avg}%`], ["Goals", goals.length], ["Completed", goals.filter((g) => g.status === "Completed").length], ["In progress", goals.filter((g) => g.status === "In Progress").length]].map(([l, v]) => (
          <Grid item xs={6} md={3} key={l}>
            <Card sx={{ borderTop: `4px solid ${C.main}` }}><CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{l.toUpperCase()}</Typography>
              <Typography variant="h5" sx={{ color: C.main }}>{v}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {goals.length === 0 && <EmptyState icon={TrendingUpIcon} color={C.main} title="No goals yet" hint="Add your first development goal." />}
      <Grid container spacing={2}>
        {goals.map((g) => {
          const left = daysBetween(today, g.targetDate);
          return (
            <Grid item xs={12} md={6} key={g.id}>
              <Card sx={{ height: "100%", borderLeft: `5px solid ${CAT_COLOR[g.category]}` }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ wordBreak: "break-word" }}>{g.title}</Typography>
                      <Stack direction="row" spacing={0.5} sx={{ my: 0.5 }} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={g.category} sx={{ bgcolor: CAT_COLOR[g.category], color: "#fff" }} />
                        <Chip size="small" label={g.status} color={g.status === "Completed" ? "success" : "default"} />
                        {g.status !== "Completed" && left < 0 && <Chip size="small" color="error" label="Past due" />}
                      </Stack>
                    </Box>
                    <Stack direction="row">
                      <IconButton aria-label="Edit goal" size="small" onClick={() => setForm(g)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton aria-label="Delete goal" size="small" onClick={() => setDelId(g.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Stack>
                  {g.notes && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{g.notes}</Typography>}
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <LinearProgress variant="determinate" value={g.progress} sx={{ flexGrow: 1, height: 10, borderRadius: 5, bgcolor: C.light, "& .MuiLinearProgress-bar": { bgcolor: C.main } }} />
                    <Typography fontWeight={700} sx={{ minWidth: 40 }}>{g.progress}%</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Target: {fmtDate(g.targetDate)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <FormDialog open={!!form} title={form?.id ? "Edit goal" : "New goal"} color={C} onClose={() => setForm(null)} onSubmit={save} disabled={!form?.title?.trim()}>
        {form && (
          <>
            <TextField label="Goal" value={form.title} onChange={set("title")} required autoFocus />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField select label="Category" value={form.category} onChange={set("category")}>{CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
              <TextField type="date" label="Target date" value={form.targetDate} onChange={set("targetDate")} InputLabelProps={{ shrink: true }} required />
            </Box>
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" gutterBottom>Progress: {form.progress}%</Typography>
              <Slider value={form.progress} onChange={(_, v) => setForm((f) => ({ ...f, progress: v }))} step={5} marks sx={{ color: C.main }} />
            </Box>
            <TextField label="Notes" value={form.notes} onChange={set("notes")} multiline minRows={2} />
          </>
        )}
      </FormDialog>
      <ConfirmDialog open={!!delId} title="Delete goal?" message="This cannot be undone." onConfirm={() => { cdp.remove(delId); notify("Goal deleted."); }} onClose={() => setDelId(null)} />
    </Box>
  );
}
