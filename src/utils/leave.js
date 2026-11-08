import { addDays, fromKey, isWeekend, toKey } from "./date";

// Annual quota (days per calendar year) and rules for each leave type.
// maxConsecutive / certificateAfter are counted in working days (week-offs are skipped).
export const LEAVE_TYPES = [
  { key: "Sick Leave", quota: 12, maxConsecutive: 30, certificateAfter: 3, color: "#dc2626",
    rule: "12 days/year. Up to 3 consecutive days; more than 3 needs a doctor's certificate.", backdateDays: 7 },
  { key: "Casual Leave", quota: 15, maxConsecutive: 5, color: "#0891b2",
    rule: "15 days/year. Max 5 consecutive days." },
  { key: "Earned Leave", quota: 18, maxConsecutive: 15, color: "#059669",
    rule: "18 days/year. Max 15 consecutive days; apply at least 7 days ahead.", noticeDays: 7 },
  { key: "Compensatory Off", quota: 6, maxConsecutive: 2, color: "#d97706",
    rule: "6 days/year, granted for working on week-offs. Max 2 consecutive days." },
  { key: "Bereavement Leave", quota: 5, maxConsecutive: 5, color: "#64748b",
    rule: "5 days/year for the loss of an immediate family member.", backdateDays: 7 },
  { key: "Paternity Leave", quota: 10, maxConsecutive: 10, color: "#7c3aed",
    rule: "10 days per year, on the birth or adoption of a child." },
  { key: "Maternity Leave", quota: 180, maxConsecutive: 180, color: "#db2777",
    rule: "180 days per year, on the birth or adoption of a child." },
];

export const leaveType = (key) => LEAVE_TYPES.find((t) => t.key === key) || LEAVE_TYPES[1];

// Working days (Mon-Fri) from startKey to endKey inclusive, as date keys.
export function workingDates(startKey, endKey) {
  const out = [];
  if (!startKey || !endKey) return out;
  for (let d = fromKey(startKey); toKey(d) <= endKey; d = addDays(d, 1)) {
    if (!isWeekend(d)) out.push(toKey(d));
  }
  return out;
}

const yearOf = (key) => Number(key.slice(0, 4));

// Days used per type in a year, counting Approved and Pending requests.
export function leaveUsage(leaves, userId, year) {
  const used = {};
  leaves.forEach((l) => {
    if (l.userId !== userId || l.status === "Rejected" || yearOf(l.startDate) !== year) return;
    used[l.type] = (used[l.type] || 0) + l.days;
  });
  return used;
}

export function validateLeave({ type, startDate, endDate, reason, certificate }, { leaves, userId, records, today }) {
  const t = leaveType(type);
  if (!startDate || !endDate) return "Select a start and end date.";
  if (endDate < startDate) return "End date cannot be before start date.";
  const dates = workingDates(startDate, endDate);
  if (dates.length === 0) return "The selected range only covers week-offs.";
  if (!reason.trim()) return "Please enter a reason.";

  const earliest = toKey(addDays(fromKey(today), -(t.backdateDays || 0)));
  if (startDate < earliest) return t.backdateDays ? `${t.key} can be back-dated by at most ${t.backdateDays} days.` : "Start date cannot be in the past.";
  if (t.noticeDays && startDate < toKey(addDays(fromKey(today), t.noticeDays))) return `${t.key} must be applied at least ${t.noticeDays} days in advance.`;
  if (dates.length > t.maxConsecutive) return `${t.key} allows at most ${t.maxConsecutive} consecutive working days.`;
  if (t.certificateAfter && dates.length > t.certificateAfter && !certificate.trim())
    return `More than ${t.certificateAfter} days of ${t.key} needs a doctor's certificate reference.`;

  const used = leaveUsage(leaves, userId, yearOf(startDate))[type] || 0;
  if (used + dates.length > t.quota) return `Insufficient balance: ${t.quota - used} of ${t.quota} ${t.key} days left for ${yearOf(startDate)}.`;

  const mine = leaves.filter((l) => l.userId === userId && l.status !== "Rejected");
  if (mine.some((l) => startDate <= l.endDate && endDate >= l.startDate)) return "You already have a leave request overlapping these dates.";
  if (dates.some((d) => records[d]?.status === "P")) return "You have attendance recorded on one of these dates.";
  return "";
}
