import React, { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { FormDialog, PageHeader, ConfirmDialog } from "../components/common";
import { STATUS_META, isLate, summarizeMonth } from "../utils/attendance";
import { addDays, fmtDate, fmtDuration, fmtTime, fromKey, isWeekend, monthKey, toKey } from "../utils/date";
import { LEAVE_TYPES, leaveType, leaveUsage, validateLeave, workingDates } from "../utils/leave";
import { sectionColors } from "../theme";

const C = sectionColors.attendance;

// first working day on or after the given key (leave on a week-off is meaningless)
const nextWorkday = (key) => {
  let d = fromKey(key);
  while (isWeekend(d)) d = addDays(d, 1);
  return toKey(d);
};

export default function Attendance() {
  const notify = useToast();
  const { db, currentUser, applyLeave, cancelLeave } = useData();
  const [selected, setSelected] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leave, setLeave] = useState({ type: "Casual Leave", startDate: nextWorkday(toKey(new Date())), endDate: nextWorkday(toKey(new Date())), reason: "", certificate: "" });
  const [cancelId, setCancelId] = useState(null);

  const records = db.attendance[currentUser.id] || {};
  const myLeaves = db.leaves.filter((l) => l.userId === currentUser.id);
  const pendingByDate = useMemo(
    () => Object.fromEntries(myLeaves.filter((l) => l.status === "Pending")
      .flatMap((l) => workingDates(l.startDate, l.endDate).map((d) => [d, l]))),
    [myLeaves]
  );
  const recordFor = (key) => records[key] || (pendingByDate[key] ? { status: "L-PEND", reason: pendingByDate[key].reason } : null);

  const summary = summarizeMonth(records, monthKey(viewDate));
  const selKey = toKey(selected);
  const sel = recordFor(selKey);
  const meta = sel && STATUS_META[sel.status];

  const year = viewDate.getFullYear();
  const usage = useMemo(() => leaveUsage(db.leaves, currentUser.id, year), [db.leaves, currentUser.id, year]);
  const lt = leaveType(leave.type);
  const leaveDays = workingDates(leave.startDate, leave.endDate).length;
  const leaveError = validateLeave(leave, { leaves: db.leaves, userId: currentUser.id, records, today: toKey(new Date()) });
  const needsCert = !!lt.certificateAfter && leaveDays > lt.certificateAfter;
  const setL = (k) => (e) => setLeave((l) => {
    const next = { ...l, [k]: e.target.value };
    if (k === "startDate" && next.endDate < next.startDate) next.endDate = next.startDate;
    return next;
  });

  const submitLeave = () => {
    if (leaveError) return notify(leaveError, "warning");
    applyLeave(leave);
    notify("Leave request submitted for approval.");
    setLeaveOpen(false);
    setLeave((l) => ({ ...l, reason: "", certificate: "" }));
  };

  return (
    <Box>
      <PageHeader title="Effort & Attendance" subtitle="Your calendar, punch times and leave" color={C} icon={EventAvailableIcon}
        actions={<Button variant="contained" color="secondary" onClick={() => { const s = nextWorkday(selKey < toKey(new Date()) ? toKey(new Date()) : selKey); setLeave((l) => ({ ...l, startDate: s, endDate: s })); setLeaveOpen(true); }}>Apply leave</Button>} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          ["Present", summary.present, "P"], ["Late", summary.late, "ABS"], ["Leave", summary.leave, "L-APR"],
          ["Absent", summary.absent, "ABS"], ["Week off", summary.weekOff, "WOFF"],
        ].map(([label, v, st]) => (
          <Grid item xs={6} sm={4} md key={label}>
            <Card sx={{ borderTop: `4px solid ${label === "Late" ? "#f97316" : STATUS_META[st].color}` }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{label.toUpperCase()}</Typography>
                <Typography variant="h5" sx={{ color: label === "Late" ? "#f97316" : STATUS_META[st].color }}>{v}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card><CardContent sx={{ px: { xs: 1, sm: 2 } }}>
            <Calendar
              className="pa-calendar"
              value={selected}
              onChange={setSelected}
              activeStartDate={viewDate}
              onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setViewDate(activeStartDate)}
              maxDate={new Date(2100, 0, 1)}
              tileContent={({ date, view }) => {
                if (view !== "month") return null;
                const r = recordFor(toKey(date));
                if (!r) return null;
                const m = STATUS_META[r.status];
                return <span className="day-tag" style={{ background: m.bg, color: m.color }}>{r.status === "P" && isLate(r) ? "P•L" : r.status}</span>;
              }}
            />
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1, px: 1 }}>
              {Object.entries(STATUS_META).map(([k, m]) => (
                <Chip key={k} size="small" label={`${k} · ${m.label}`} sx={{ bgcolor: m.bg, color: m.color, fontWeight: 600 }} />
              ))}
            </Stack>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: `5px solid ${meta?.color || C.main}`, mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Selected day</Typography>
              <Typography variant="h6">{fmtDate(selKey, { weekday: "long", day: "numeric", month: "long" })}</Typography>
              {!sel ? (
                <Typography color="text.secondary" sx={{ mt: 1 }}>No attendance recorded.</Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Chip label={meta.label} sx={{ alignSelf: "flex-start", bgcolor: meta.bg, color: meta.color, fontWeight: 700 }} />
                  {sel.status === "P" && (
                    <>
                      <Typography>In: <b>{fmtTime(sel.inTime)}</b> {isLate(sel) && <Chip size="small" color="warning" label="Late" />}</Typography>
                      <Typography>Out: <b>{fmtTime(sel.outTime)}</b></Typography>
                      <Typography>Duration: <b>{fmtDuration(sel.inTime, sel.outTime)}</b></Typography>
                    </>
                  )}
                  {sel.reason && <Typography variant="body2" color="text.secondary">Reason: {sel.reason}</Typography>}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Leave balance {year}</Typography>
              {LEAVE_TYPES.map((t) => {
                const used = usage[t.key] || 0;
                return (
                  <Box key={t.key} sx={{ mb: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>{t.key}</Typography>
                      <Typography variant="body2" color="text.secondary">{Math.max(t.quota - used, 0)} / {t.quota} left</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min(100, (used / t.quota) * 100)}
                      sx={{ height: 7, borderRadius: 4, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: t.color } }} />
                  </Box>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>My leave requests</Typography>
              {myLeaves.length === 0 && <Typography color="text.secondary" variant="body2">No requests yet.</Typography>}
              {myLeaves.map((l) => (
                <Stack key={l.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.8, borderBottom: "1px solid #e2e8f0" }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{l.type}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {l.startDate === l.endDate ? fmtDate(l.startDate) : `${fmtDate(l.startDate)} – ${fmtDate(l.endDate)}`} · {l.days} day{l.days > 1 ? "s" : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{l.reason || "—"}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip size="small" label={l.status} color={l.status === "Approved" ? "success" : l.status === "Rejected" ? "error" : "warning"} />
                    {l.status === "Pending" && <Button size="small" color="error" onClick={() => setCancelId(l.id)}>Cancel</Button>}
                  </Stack>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <FormDialog open={leaveOpen} title="Apply for leave" color={C} onClose={() => setLeaveOpen(false)} onSubmit={submitLeave} submitLabel="Submit">
        <TextField select label="Leave type" value={leave.type} onChange={setL("type")}
          helperText={`${lt.rule} Balance: ${Math.max(lt.quota - (leaveUsage(db.leaves, currentUser.id, Number(leave.startDate.slice(0, 4)))[lt.key] || 0), 0)} of ${lt.quota} days.`}>
          {LEAVE_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.key} ({t.quota} days/yr)</MenuItem>)}
        </TextField>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField type="date" label="From" value={leave.startDate} onChange={setL("startDate")} InputLabelProps={{ shrink: true }} required />
          <TextField type="date" label="To" value={leave.endDate} onChange={setL("endDate")} InputLabelProps={{ shrink: true }} required inputProps={{ min: leave.startDate }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Working days requested: <b>{leaveDays}</b> (week-offs are not counted)
        </Typography>
        {needsCert && <TextField label="Doctor's certificate reference" value={leave.certificate} onChange={setL("certificate")} required
          helperText="Required for more than 3 consecutive days of sick leave." />}
        <TextField label="Reason" value={leave.reason} onChange={setL("reason")} multiline minRows={2} required />
        {leaveError && leave.reason.trim() && <Typography variant="body2" color="error">{leaveError}</Typography>}
      </FormDialog>
      <ConfirmDialog open={!!cancelId} title="Cancel leave request?" message="This request will be withdrawn." confirmLabel="Withdraw"
        onConfirm={() => { cancelLeave(cancelId); notify("Request withdrawn."); }} onClose={() => setCancelId(null)} />
    </Box>
  );
}
