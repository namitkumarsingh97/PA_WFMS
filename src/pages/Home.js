import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Button, Card, CardActionArea, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { navFor } from "../utils/nav";
import { daysBetween, fmtDate, fmtTime, monthKey, nowTime, toKey } from "../utils/date";
import { STATUS_META, isLate, summarizeMonth } from "../utils/attendance";
import { sectionColors } from "../theme";

function Stat({ label, value, color, hint }) {
  return (
    <Card sx={{ height: "100%", borderTop: `4px solid ${color.main}` }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label.toUpperCase()}</Typography>
        <Typography variant="h4" sx={{ color: color.main }}>{value}</Typography>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const notify = useToast();
  const { db, currentUser, punchIn, punchOut } = useData();
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const today = toKey(clock);
  const mine = db.attendance[currentUser.id] || {};
  const rec = mine[today];
  const month = summarizeMonth(mine, monthKey(clock));
  const myTasks = db.tasks.filter((t) => t.assignedTo === currentUser.id);
  const openTasks = myTasks.filter((t) => t.status !== "Done").length;
  const upcoming = useMemo(
    () => db.meetings.filter((m) => m.status === "Scheduled" && m.date >= today && m.attendees.includes(currentUser.id))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 4),
    [db.meetings, currentUser.id, today]
  );
  const cdp = db.cdp.filter((c) => c.userId === currentUser.id);
  const cdpAvg = cdp.length ? Math.round(cdp.reduce((s, c) => s + c.progress, 0) / cdp.length) : 0;
  const hour = clock.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const doIn = () => { punchIn(); notify(`Punched in at ${fmtTime(nowTime())}`); };
  const doOut = () => { punchOut(); notify(`Punched out at ${fmtTime(nowTime())}`); };

  const dueSoon = myTasks.filter((t) => t.status !== "Done" && daysBetween(today, t.toDate) <= 3).slice(0, 4);

  return (
    <Box>
      <Box sx={{ background: sectionColors.home.gradient, color: "#fff", borderRadius: 4, p: { xs: 2.5, sm: 4 }, mb: 3, boxShadow: `0 12px 28px -12px ${sectionColors.home.main}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>{greet}, {currentUser.name.split(" ")[0]}!</Typography>
            <Typography sx={{ opacity: 0.9 }}>{fmtDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: "rgba(255,255,255,.14)", color: "#fff", backdropFilter: "blur(6px)", boxShadow: "none" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
                  <Box>
                    <Typography variant="caption">TODAY</Typography>
                    <Typography fontWeight={700}>
                      {rec?.inTime ? `In ${fmtTime(rec.inTime)}${rec.outTime ? ` · Out ${fmtTime(rec.outTime)}` : ""}` : rec ? STATUS_META[rec.status]?.label : "Not punched in"}
                    </Typography>
                    {isLate(rec) && <Chip size="small" label="Late" color="warning" sx={{ mt: 0.5 }} />}
                  </Box>
                  {!rec?.inTime ? (
                    <Button variant="contained" color="secondary" startIcon={<LoginIcon />} onClick={doIn} disabled={rec?.status === "L-APR"}>Punch in</Button>
                  ) : !rec.outTime ? (
                    <Button variant="contained" color="secondary" startIcon={<LogoutIcon />} onClick={doOut}>Punch out</Button>
                  ) : (
                    <Chip label="Day complete" color="success" />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><Stat label="Present (month)" value={month.present} color={sectionColors.attendance} hint={`${month.late} late · ${month.leave} leave`} /></Grid>
        <Grid item xs={6} md={3}><Stat label="Open tasks" value={openTasks} color={sectionColors.tasks} hint={`${myTasks.length - openTasks} done`} /></Grid>
        <Grid item xs={6} md={3}><Stat label="Meetings ahead" value={upcoming.length} color={sectionColors.meetings} hint="Next 4 shown below" /></Grid>
        <Grid item xs={6} md={3}><Stat label="CDP progress" value={`${cdpAvg}%`} color={sectionColors.cdp} hint={`${cdp.length} goals`} /></Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1.5 }}>Explore</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {navFor(currentUser).filter((n) => n.key !== "home").map((n) => (
          <Grid item xs={12} sm={6} md={4} key={n.key}>
            <Card className="card-hover" sx={{ background: n.color.gradient, color: "#fff", height: "100%" }}>
              <CardActionArea onClick={() => navigate(n.path)} sx={{ p: 2.5, height: "100%" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,.25)", width: 52, height: 52 }}><n.icon /></Avatar>
                  <Box>
                    <Typography variant="h6">{n.label}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{n.desc}</Typography>
                  </Box>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderLeft: `5px solid ${sectionColors.meetings.main}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upcoming meetings</Typography>
              {upcoming.length === 0 && <Typography color="text.secondary">No upcoming meetings.</Typography>}
              {upcoming.map((m) => (
                <Stack key={m.id} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: "1px solid #e2e8f0" }}>
                  <Typography fontWeight={600}>{m.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{fmtDate(m.date, { day: "numeric", month: "short" })} · {fmtTime(m.time)}</Typography>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderLeft: `5px solid ${sectionColors.tasks.main}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Tasks due soon</Typography>
              {dueSoon.length === 0 && <Typography color="text.secondary">Nothing due in the next 3 days.</Typography>}
              {dueSoon.map((t) => (
                <Box key={t.id} sx={{ py: 1, borderBottom: "1px solid #e2e8f0" }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={600}>{t.title}</Typography>
                    <Chip size="small" label={daysBetween(today, t.toDate) < 0 ? "Overdue" : fmtDate(t.toDate, { day: "numeric", month: "short" })}
                      color={daysBetween(today, t.toDate) < 0 ? "error" : "default"} />
                  </Stack>
                  <LinearProgress variant="determinate" value={{ ToDo: 5, "In Progress": 50, "On Hold": 30, Done: 100 }[t.status]} sx={{ mt: 0.8, height: 6, borderRadius: 3 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
