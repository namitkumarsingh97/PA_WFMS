import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildSeed } from "../data/seed";
import { load, save } from "../utils/storage";
import { nowTime, toKey, uid } from "../utils/date";
import { workingDates } from "../utils/leave";
import { useAuth } from "./AuthContext";

const DB_KEY = "wfms_db_v1";
const DataContext = createContext(null);

const initDb = () => {
  const stored = load(DB_KEY, null);
  if (stored && stored.version === 2) return stored;
  if (stored && stored.version === 1) {
    // v1 -> v2: leave requests gained a type and a date range
    return {
      ...stored,
      version: 2,
      leaves: stored.leaves.map(({ date, ...l }) => ({
        ...l, type: "Casual Leave", startDate: date, endDate: date, days: 1, certificate: "",
      })),
    };
  }
  return buildSeed();
};

export function DataProvider({ children }) {
  const { userId, addCredential, emailTaken, setPasswordFor, setActive, resetCredentials } = useAuth();
  const [db, setDb] = useState(initDb);

  useEffect(() => {
    save(DB_KEY, db);
  }, [db]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === DB_KEY && e.newValue) setDb(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const patch = useCallback((fn) => setDb((prev) => fn(prev)), []);

  // generic collection helpers
  // Destructive actions are manager-only; enforced here as well as hidden in the UI.
  const isManagerIn = useCallback((d) => d.users.find((u) => u.id === userId)?.role === "manager", [userId]);

  const collection = useCallback(
    (name, managerOnlyRemove = false) => ({
      add: (item) => {
        const row = { ...item, id: uid(name) };
        patch((d) => ({ ...d, [name]: [row, ...d[name]] }));
        return row;
      },
      update: (id, changes) =>
        patch((d) => ({ ...d, [name]: d[name].map((r) => (r.id === id ? { ...r, ...changes } : r)) })),
      remove: (id) =>
        patch((d) => (managerOnlyRemove && !isManagerIn(d) ? d : { ...d, [name]: d[name].filter((r) => r.id !== id) })),
    }),
    [patch, isManagerIn]
  );

  const api = useMemo(() => {
    const setRecord = (uId, key, rec) =>
      patch((d) => ({
        ...d,
        attendance: { ...d.attendance, [uId]: { ...(d.attendance[uId] || {}), [key]: rec } },
      }));

    return {
      punchIn: (uId = userId) => {
        const key = toKey(new Date());
        setRecord(uId, key, { status: "P", inTime: nowTime(), outTime: null });
      },
      punchOut: (uId = userId) => {
        const key = toKey(new Date());
        patch((d) => {
          const rec = d.attendance[uId]?.[key];
          if (!rec) return d;
          return {
            ...d,
            attendance: { ...d.attendance, [uId]: { ...d.attendance[uId], [key]: { ...rec, outTime: nowTime() } } },
          };
        });
      },
      applyLeave: ({ type, startDate, endDate, reason, certificate }) => {
        const row = {
          id: uid("lv"), userId, type, startDate, endDate, reason: reason.trim(), certificate: certificate.trim(),
          days: workingDates(startDate, endDate).length, status: "Pending",
        };
        patch((d) => ({ ...d, leaves: [row, ...d.leaves] }));
      },
      cancelLeave: (id) =>
        patch((d) => ({ ...d, leaves: d.leaves.filter((l) => !(l.id === id && l.userId === userId && l.status === "Pending")) })),
      decideLeave: (id, decision) =>
        patch((d) => {
          if (!isManagerIn(d)) return d;
          const leave = d.leaves.find((l) => l.id === id);
          if (!leave) return d;
          const next = { ...d, leaves: d.leaves.map((l) => (l.id === id ? { ...l, status: decision } : l)) };
          if (decision === "Approved") {
            const recs = { ...(d.attendance[leave.userId] || {}) };
            workingDates(leave.startDate, leave.endDate).forEach((key) => {
              if (recs[key]?.status !== "P") recs[key] = { status: "L-APR", inTime: null, outTime: null, reason: leave.reason, leaveType: leave.type };
            });
            next.attendance = { ...d.attendance, [leave.userId]: recs };
          }
          return next;
        }),
      updateUser: (id, changes) =>
        patch((d) => {
          const self = id === userId;
          if (!self && !isManagerIn(d)) return d;
          // employees may not change their own role/department
          const safe = isManagerIn(d) ? changes : { name: changes.name, phone: changes.phone };
          return { ...d, users: d.users.map((u) => (u.id === id ? { ...u, ...safe } : u)) };
        }),
      // Manager: create an employee profile together with login credentials.
      addEmployee: ({ password, email, ...profile }) => {
        const id = uid("u");
        const user = { ...profile, id, email: email.trim(), joined: toKey(new Date()) };
        patch((d) => (isManagerIn(d)
          ? { ...d, users: [...d.users, user], attendance: { ...d.attendance, [id]: {} } }
          : d));
        addCredential(id, email, password);
        return user;
      },
      emailTaken,
      setEmployeePassword: setPasswordFor,
      setEmployeeActive: (id, active) => id !== userId && setActive(id, active),
      tasks: collection("tasks", true),
      meetings: collection("meetings", true),
      cdp: collection("cdp"),
      creative: collection("creative", true),
      resetData: () => {
        setDb((d) => (isManagerIn(d) ? buildSeed() : d));
        if (db.users.find((u) => u.id === userId)?.role === "manager") resetCredentials();
      },
    };
  }, [patch, collection, userId, isManagerIn, addCredential, emailTaken, setPasswordFor, setActive, resetCredentials, db.users]);

  const currentUser = useMemo(() => db.users.find((u) => u.id === userId) || null, [db.users, userId]);
  const userName = useCallback((id) => db.users.find((u) => u.id === id)?.name || "Unassigned", [db.users]);

  const isManager = currentUser?.role === "manager";
  const value = useMemo(() => ({ db, currentUser, isManager, userName, ...api }), [db, currentUser, isManager, userName, api]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
