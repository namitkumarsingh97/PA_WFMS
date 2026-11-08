import React, { useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography,
} from "@mui/material";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import DownloadIcon from "@mui/icons-material/Download";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { EmptyState, PageHeader } from "../components/common";
import config from "../config";
import { isDefaulter, summarizeMonth } from "../utils/attendance";
import { fmtDate, monthKey, pad } from "../utils/date";
import { leaveType, leaveUsage } from "../utils/leave";
import { sectionColors } from "../theme";

const C = sectionColors.defaulters;

const monthOptions = () => {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) };
  });
};

export default function Defaulters() {
  const notify = useToast();
  const { db, decideLeave, userName, activeUsers } = useData();
  const [tab, setTab] = useState(0);
  const [month, setMonth] = useState(monthKey(new Date()));
  const [onlyDefaulters, setOnlyDefaulters] = useState(true);
  const options = monthOptions();

  const rows = useMemo(
    () => activeUsers.map((u) => ({ user: u, s: summarizeMonth(db.attendance[u.id], month) }))
      .filter((r) => !onlyDefaulters || isDefaulter(r.s))
      .sort((a, b) => b.s.late + b.s.absent * 3 - (a.s.late + a.s.absent * 3)),
    [db, activeUsers, month, onlyDefaulters]
  );
  const pending = db.leaves.filter((l) => l.status === "Pending");

  const exportCsv = () => {
    const head = ["Name", "Department", "Present", "Late", "Absent", "Leave"];
    const lines = rows.map(({ user: u, s }) => [u.name, u.dept, s.present, s.late, s.absent, s.leave].join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `defaulters-${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("Report exported.");
  };

  const decide = (l, d) => { decideLeave(l.id, d); notify(`Leave ${d.toLowerCase()} for ${userName(l.userId)}.`, d === "Approved" ? "success" : "info"); };

  return (
    <Box>
      <PageHeader title="Attendance / Defaulters" subtitle={`Late after ${config.lateAfter} · ${config.defaulterLateLimit}+ late marks or any absence`} color={C} icon={GppMaybeIcon}
        actions={tab === 0 && <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, "& .MuiTabs-indicator": { bgcolor: C.main }, "& .Mui-selected": { color: `${C.dark} !important` } }}>
        <Tab label="Defaulters" />
        <Tab label={`Leave requests${pending.length ? ` (${pending.length})` : ""}`} />
      </Tabs>

      {tab === 0 && (
        <>
          <Card sx={{ mb: 2 }}><CardContent sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField select label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
              {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField select label="Show" value={onlyDefaulters ? "d" : "a"} onChange={(e) => setOnlyDefaulters(e.target.value === "d")}>
              <MenuItem value="d">Defaulters only</MenuItem><MenuItem value="a">All employees</MenuItem>
            </TextField>
          </CardContent></Card>

          {rows.length === 0 ? <EmptyState icon={GppMaybeIcon} color={C.main} title="No defaulters 🎉" hint="Everyone is on track this month." /> : (
            <Card><div className="table-scroll">
              <Table size="small" sx={{ minWidth: 560 }}>
                <TableHead><TableRow sx={{ bgcolor: C.light }}>
                  {["Employee", "Dept", "Present", "Late", "Absent", "Leave", "Flag"].map((h) => <TableCell key={h} sx={{ fontWeight: 700, color: C.dark }}>{h}</TableCell>)}
                </TableRow></TableHead>
                <TableBody>
                  {rows.map(({ user: u, s }) => (
                    <TableRow key={u.id} hover>
                      <TableCell><Typography fontWeight={600}>{u.name}</Typography><Typography variant="caption" color="text.secondary">{u.designation}</Typography></TableCell>
                      <TableCell>{u.dept}</TableCell>
                      <TableCell>{s.present}</TableCell>
                      <TableCell sx={{ color: s.late >= config.defaulterLateLimit ? "error.main" : "inherit", fontWeight: 700 }}>{s.late}</TableCell>
                      <TableCell sx={{ color: s.absent ? "error.main" : "inherit", fontWeight: 700 }}>{s.absent}</TableCell>
                      <TableCell>{s.leave}</TableCell>
                      <TableCell>{isDefaulter(s) ? <Chip size="small" color="error" label="Defaulter" /> : <Chip size="small" color="success" label="OK" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div></Card>
          )}
        </>
      )}

      {tab === 1 && (
        pending.length === 0 ? <EmptyState icon={GppMaybeIcon} color={C.main} title="No pending leave requests" /> : (
          <Grid container spacing={2}>
            {pending.map((l) => (
              <Grid item xs={12} md={6} key={l.id}>
                <Card sx={{ borderLeft: `5px solid ${sectionColors.attendance.main}` }}><CardContent>
                  <Typography variant="h6">{userName(l.userId)}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 0.5 }}>
                    <Chip size="small" label={l.type} sx={{ bgcolor: leaveType(l.type).color, color: "#fff" }} />
                    <Typography variant="body2" color="text.secondary">{l.days} working day{l.days > 1 ? "s" : ""}</Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    {l.startDate === l.endDate ? fmtDate(l.startDate, { weekday: "long", day: "numeric", month: "long" }) : `${fmtDate(l.startDate)} – ${fmtDate(l.endDate)}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Balance now: {Math.max(leaveType(l.type).quota - (leaveUsage(db.leaves.filter((x) => x.id !== l.id), l.userId, Number(l.startDate.slice(0, 4)))[l.type] || 0), 0)} of {leaveType(l.type).quota} (this request: {l.days})
                  </Typography>
                  {l.certificate && <Chip size="small" variant="outlined" label={`Certificate: ${l.certificate}`} sx={{ mt: 0.5 }} />}
                  <Typography sx={{ my: 1 }}>{l.reason || "No reason provided"}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="success" size="small" onClick={() => decide(l, "Approved")}>Approve</Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => decide(l, "Rejected")}>Reject</Button>
                  </Stack>
                </CardContent></Card>
              </Grid>
            ))}
          </Grid>
        )
      )}
    </Box>
  );
}
