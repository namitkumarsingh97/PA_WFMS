import config from "../config";
import { toMinutes, monthKey, fromKey } from "./date";

export const STATUS_META = {
  P: { label: "Present", color: "#16a34a", bg: "#dcfce7" },
  WOFF: { label: "Week Off", color: "#64748b", bg: "#e2e8f0" },
  "L-APR": { label: "Leave Approved", color: "#d97706", bg: "#fef3c7" },
  "L-PEND": { label: "Leave Pending", color: "#7c3aed", bg: "#ede9fe" },
  ABS: { label: "Absent", color: "#dc2626", bg: "#fee2e2" },
};

export const isLate = (rec) =>
  !!rec && rec.status === "P" && toMinutes(rec.inTime) > toMinutes(config.lateAfter);

// Summarise one user's month. `records` is { 'YYYY-MM-DD': rec }.
export function summarizeMonth(records = {}, mKey) {
  const s = { present: 0, absent: 0, leave: 0, weekOff: 0, late: 0 };
  Object.entries(records).forEach(([key, rec]) => {
    if (monthKey(fromKey(key)) !== mKey) return;
    if (rec.status === "P") s.present++;
    else if (rec.status === "ABS") s.absent++;
    else if (rec.status === "L-APR") s.leave++;
    else if (rec.status === "WOFF") s.weekOff++;
    if (isLate(rec)) s.late++;
  });
  return s;
}

export const isDefaulter = (s) => s.late >= config.defaulterLateLimit || s.absent > 0;
