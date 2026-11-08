import { addDays, isWeekend, nowTime, pad, toKey } from "../utils/date";

// NOTE: this build runs fully in the browser and persists to localStorage.
// Replace these seed users/credentials with a real backend (REACT_APP_API_BASE_URL) for multi-user use.
export const SEED_USERS = [
  { id: "u1", name: "Amit Kumar", email: "amit@providenceadwork.com", password: "employee123", role: "employee", dept: "Engineering", designation: "Software Engineer", phone: "+91 98100 00001", joined: "2023-04-10" },
  { id: "u2", name: "Neha Sharma", email: "neha@providenceadwork.com", password: "manager123", role: "manager", dept: "Operations", designation: "Project Manager", phone: "+91 98100 00002", joined: "2021-08-02" },
  { id: "u3", name: "Rahul Verma", email: "rahul@providenceadwork.com", password: "welcome123", role: "employee", dept: "Creative", designation: "Art Director", phone: "+91 98100 00003", joined: "2022-01-17" },
  { id: "u4", name: "Priya Singh", email: "priya@providenceadwork.com", password: "welcome123", role: "employee", dept: "Creative", designation: "Graphic Designer", phone: "+91 98100 00004", joined: "2023-09-05" },
  { id: "u5", name: "Karan Mehta", email: "karan@providenceadwork.com", password: "welcome123", role: "employee", dept: "Engineering", designation: "QA Engineer", phone: "+91 98100 00005", joined: "2022-11-21" },
  { id: "u6", name: "Sneha Iyer", email: "sneha@providenceadwork.com", password: "welcome123", role: "employee", dept: "Marketing", designation: "Content Strategist", phone: "+91 98100 00006", joined: "2024-02-12" },
];

// Small deterministic PRNG so seeded history is stable.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const hhmm = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

export function buildAttendance(users, today = new Date(), days = 120) {
  const out = {};
  users.forEach((u) => {
    out[u.id] = {};
    for (let i = days; i >= 1; i--) {
      const d = addDays(today, -i);
      const key = toKey(d);
      const rnd = mulberry32(hashStr(u.id + key));
      if (isWeekend(d)) {
        out[u.id][key] = { status: "WOFF", inTime: null, outTime: null };
        continue;
      }
      const r = rnd();
      if (r < 0.05) out[u.id][key] = { status: "ABS", inTime: null, outTime: null };
      else if (r < 0.12) out[u.id][key] = { status: "L-APR", inTime: null, outTime: null, reason: "Approved leave" };
      else {
        const inM = 9 * 60 + 35 + Math.floor(rnd() * 75) - 15; // ~09:20 - 10:35
        const outM = inM + 8 * 60 + Math.floor(rnd() * 90) - 20;
        out[u.id][key] = { status: "P", inTime: hhmm(inM), outTime: hhmm(outM) };
      }
    }
  });
  return out;
}

// Approved single-day leaves behind the seeded L-APR attendance, so balances add up.
function historyLeaves(attendance) {
  const out = [];
  Object.entries(attendance).forEach(([userId, recs]) => {
    Object.entries(recs).forEach(([key, rec]) => {
      if (rec.status !== "L-APR") return;
      const type = hashStr(userId + key) % 4 === 0 ? "Sick Leave" : "Casual Leave";
      out.push({ id: `lvh_${userId}_${key}`, userId, type, startDate: key, endDate: key, days: 1, reason: rec.reason, certificate: "", status: "Approved" });
      rec.leaveType = type;
    });
  });
  return out;
}

export function buildSeed(today = new Date()) {
  const k = (n) => toKey(addDays(today, n));
  const attendance = buildAttendance(SEED_USERS, today);
  return {
    version: 2,
    users: SEED_USERS.map(({ password, ...u }) => u),
    attendance,
    leaves: [
      ...historyLeaves(attendance),
      { id: "lv1", userId: "u4", type: "Casual Leave", startDate: k(3), endDate: k(3), days: 1, reason: "Family function", certificate: "", status: "Pending" },
      { id: "lv2", userId: "u5", type: "Sick Leave", startDate: k(5), endDate: k(5), days: 1, reason: "Medical appointment", certificate: "", status: "Pending" },
    ],
    tasks: [
      { id: "t1", title: "Design Homepage", description: "Create a responsive homepage design.", status: "ToDo", sprint: "Sprint 2", assignedTo: "u3", priority: "High", fromDate: k(0), toDate: k(6) },
      { id: "t2", title: "Implement Auth API", description: "Develop REST API for user authentication.", status: "In Progress", sprint: "Sprint 2", assignedTo: "u1", priority: "High", fromDate: k(-3), toDate: k(4) },
      { id: "t3", title: "Fix payment bugs", description: "Resolve issues in the payment module.", status: "On Hold", sprint: "Sprint 1", assignedTo: "u5", priority: "Medium", fromDate: k(-14), toDate: k(-7) },
      { id: "t4", title: "Quarterly report", description: "Compile KPIs for the quarterly review.", status: "Done", sprint: "Sprint 1", assignedTo: "u2", priority: "Low", fromDate: k(-14), toDate: k(-8) },
      { id: "t5", title: "Brand refresh assets", description: "Banner and social creatives for the new campaign.", status: "In Progress", sprint: "Sprint 2", assignedTo: "u4", priority: "Medium", fromDate: k(-2), toDate: k(5) },
      { id: "t6", title: "Write launch blog", description: "Announcement post for the product launch.", status: "ToDo", sprint: "Sprint 3", assignedTo: "u6", priority: "Low", fromDate: k(7), toDate: k(12) },
    ],
    meetings: [
      { id: "m1", title: "Sprint 2 planning", date: k(0), time: "11:00", duration: 45, location: "Conference Room A", agenda: "Scope, estimates and owners.", attendees: ["u1", "u2", "u3", "u5"], status: "Scheduled" },
      { id: "m2", title: "Design review", date: k(1), time: "15:30", duration: 60, location: "Google Meet", agenda: "Review homepage concepts.", attendees: ["u2", "u3", "u4"], status: "Scheduled" },
      { id: "m3", title: "Monthly all-hands", date: k(4), time: "17:00", duration: 60, location: "Auditorium", agenda: "Company updates and Q&A.", attendees: SEED_USERS.map((u) => u.id), status: "Scheduled" },
      { id: "m4", title: "Retro - Sprint 1", date: k(-7), time: "16:00", duration: 30, location: "Google Meet", agenda: "What went well / to improve.", attendees: ["u1", "u2", "u5"], status: "Completed" },
    ],
    cdp: [
      { id: "c1", userId: "u1", title: "AWS Certified Developer", category: "Certification", progress: 40, targetDate: k(60), status: "In Progress", notes: "Finish modules 1-4 and take a mock exam." },
      { id: "c2", userId: "u1", title: "Lead a feature end-to-end", category: "Leadership", progress: 15, targetDate: k(120), status: "In Progress", notes: "Pair with manager on scoping." },
      { id: "c3", userId: "u1", title: "Advanced React patterns", category: "Skill", progress: 100, targetDate: k(-10), status: "Completed", notes: "Completed workshop series." },
      { id: "c4", userId: "u2", title: "PMP preparation", category: "Certification", progress: 55, targetDate: k(90), status: "In Progress", notes: "" },
    ],
    creative: [
      { id: "cr1", title: "Diwali campaign banners", type: "Banner", client: "Aurora Foods", priority: "High", stage: "In Design", owner: "u4", due: k(3), brief: "Set of 6 web + social banners, warm palette." },
      { id: "cr2", title: "Product explainer video", type: "Video", client: "NovaTech", priority: "Medium", stage: "Brief", owner: "u3", due: k(14), brief: "60s motion graphic explainer." },
      { id: "cr3", title: "Brand guidelines v2", type: "Print", client: "Internal", priority: "Low", stage: "In Review", owner: "u3", due: k(6), brief: "Update logo usage and typography." },
      { id: "cr4", title: "Social media kit", type: "Social", client: "Zenith Fitness", priority: "Medium", stage: "Approved", owner: "u4", due: k(-2), brief: "Templates for Instagram and LinkedIn." },
    ],
    meta: { seededAt: toKey(today), seededTime: nowTime() },
  };
}
