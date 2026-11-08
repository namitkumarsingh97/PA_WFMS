export const pad = (n) => String(n).padStart(2, "0");

export const toKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

export const nowTime = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fmtTime = (hhmm) => {
  if (!hhmm) return "--";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${pad(m)} ${suffix}`;
};

export const fmtDate = (key, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  key ? fromKey(key).toLocaleDateString("en-IN", opts) : "--";

export const fmtDuration = (inT, outT) => {
  const a = toMinutes(inT);
  const b = toMinutes(outT);
  if (a == null || b == null || b < a) return "--";
  const diff = b - a;
  return `${Math.floor(diff / 60)}h ${pad(diff % 60)}m`;
};

export const daysBetween = (aKey, bKey) =>
  Math.round((fromKey(bKey) - fromKey(aKey)) / 86400000);

export const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
