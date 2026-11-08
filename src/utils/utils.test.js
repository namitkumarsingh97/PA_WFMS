import { fmtTime, fmtDuration, toKey, daysBetween } from "./date";
import { isDefaulter, isLate, summarizeMonth } from "./attendance";

test("formats time and duration", () => {
  expect(fmtTime("13:05")).toBe("1:05 PM");
  expect(fmtTime("00:00")).toBe("12:00 AM");
  expect(fmtDuration("09:00", "17:30")).toBe("8h 30m");
});

test("date keys and diffs", () => {
  expect(toKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  expect(daysBetween("2026-01-05", "2026-01-08")).toBe(3);
});

test("attendance summary is month-aware", () => {
  const recs = {
    "2026-10-30": { status: "P", inTime: "11:00", outTime: "19:00" },
    "2026-11-02": { status: "P", inTime: "09:30", outTime: "18:00" },
    "2026-11-03": { status: "ABS" },
    "2026-11-04": { status: "L-APR" },
  };
  const s = summarizeMonth(recs, "2026-11");
  expect(s).toMatchObject({ present: 1, absent: 1, leave: 1, late: 0 });
  expect(isDefaulter(s)).toBe(true);
  expect(isLate(recs["2026-10-30"])).toBe(true);
});


import { validateLeave, workingDates } from "./leave";

describe("leave rules", () => {
  const ctx = { leaves: [], userId: "u1", records: {}, today: "2026-11-09" };
  const base = { type: "Sick Leave", startDate: "2026-11-10", endDate: "2026-11-12", reason: "Fever", certificate: "" };

  test("skips week-offs when counting days", () => {
    expect(workingDates("2026-11-13", "2026-11-16")).toEqual(["2026-11-13", "2026-11-16"]);
  });
  test("sick leave up to 3 days is fine, 4+ needs a certificate", () => {
    expect(validateLeave(base, ctx)).toBe("");
    const long = { ...base, endDate: "2026-11-13" };
    expect(validateLeave(long, ctx)).toMatch(/certificate/);
    expect(validateLeave({ ...long, certificate: "DR-1" }, ctx)).toBe("");
  });
  test("casual leave enforces annual balance and max consecutive", () => {
    const used = [{ userId: "u1", type: "Casual Leave", startDate: "2026-03-02", endDate: "2026-03-02", days: 14, status: "Approved" }];
    const c = { type: "Casual Leave", startDate: "2026-11-10", endDate: "2026-11-11", reason: "x", certificate: "" };
    expect(validateLeave(c, { ...ctx, leaves: used })).toMatch(/Insufficient balance/);
    expect(validateLeave({ ...c, endDate: "2026-11-20" }, ctx)).toMatch(/at most 5/);
  });
});
