import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { SEED_USERS } from "../data/seed";
import { load, save, remove } from "../utils/storage";

const SESSION_KEY = "wfms_session_v1";
const CRED_KEY = "wfms_credentials_v1";

const AuthContext = createContext(null);

const seedCredentials = () =>
  Object.fromEntries(SEED_USERS.map((u) => [u.id, { email: u.email, password: u.password, active: true }]));

// NOTE: credentials live in the browser (localStorage). Swap for a real auth API before multi-user use.
export function AuthProvider({ children }) {
  const [creds, setCreds] = useState(() => load(CRED_KEY, null) || seedCredentials());
  const [userId, setUserId] = useState(() => {
    const s = load(SESSION_KEY, null);
    const c = s && (load(CRED_KEY, null) || seedCredentials())[s.userId];
    return c && c.active ? s.userId : null;
  });

  // a disabled or removed account loses its session immediately
  const activeId = creds[userId]?.active ? userId : null;

  const persist = useCallback((next) => {
    save(CRED_KEY, next);
    setCreds(next);
  }, []);

  const login = useCallback(
    (identifier, password) => {
      const id = identifier.trim().toLowerCase();
      const found = Object.entries(creds).find(([, c]) => c.email.toLowerCase() === id);
      if (!found || found[1].password !== password) return { ok: false, error: "Invalid email or password." };
      if (!found[1].active) return { ok: false, error: "This account has been deactivated. Contact your manager." };
      save(SESSION_KEY, { userId: found[0] });
      setUserId(found[0]);
      return { ok: true };
    },
    [creds]
  );

  const logout = useCallback(() => {
    remove(SESSION_KEY);
    setUserId(null);
  }, []);

  const changePassword = useCallback(
    (current, next) => {
      if (creds[userId]?.password !== current) return { ok: false, error: "Current password is incorrect." };
      persist({ ...creds, [userId]: { ...creds[userId], password: next } });
      return { ok: true };
    },
    [creds, userId, persist]
  );

  // manager-side credential management
  const emailTaken = useCallback(
    (email) => Object.values(creds).some((c) => c.email.toLowerCase() === email.trim().toLowerCase()),
    [creds]
  );
  const addCredential = useCallback(
    (id, email, password) => persist({ ...creds, [id]: { email: email.trim(), password, active: true } }),
    [creds, persist]
  );
  const setPasswordFor = useCallback(
    (id, password) => persist({ ...creds, [id]: { ...creds[id], password } }),
    [creds, persist]
  );
  const setActive = useCallback(
    (id, active) => persist({ ...creds, [id]: { ...creds[id], active } }),
    [creds, persist]
  );
  const resetCredentials = useCallback(() => persist(seedCredentials()), [persist]);

  const value = useMemo(
    () => ({
      userId: activeId, isAuthenticated: !!activeId, login, logout, changePassword,
      credentials: creds, emailTaken, addCredential, setPasswordFor, setActive, resetCredentials,
    }),
    [activeId, creds, login, logout, changePassword, emailTaken, addCredential, setPasswordFor, setActive, resetCredentials]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
