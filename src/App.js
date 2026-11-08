import React, { Suspense, lazy } from "react";
import { CssBaseline, ThemeProvider, Box, CircularProgress } from "@mui/material";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./styles.css";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { RequireAuth } from "./components/common";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Cdp = lazy(() => import("./pages/Cdp"));
const Meetings = lazy(() => import("./pages/Meetings"));
const Creative = lazy(() => import("./pages/Creative"));
const Defaulters = lazy(() => import("./pages/Defaulters"));
const Employees = lazy(() => import("./pages/Employees"));
const Profile = lazy(() => import("./pages/Profile"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Loading = () => (
  <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
    <CircularProgress aria-label="Loading" />
  </Box>
);

function Shell() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <BrowserRouter>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<RequireAuth><Shell /></RequireAuth>}>
                      <Route index element={<Home />} />
                      <Route path="attendance" element={<Attendance />} />
                      <Route path="attendence" element={<Navigate to="/attendance" replace />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="task" element={<Navigate to="/tasks" replace />} />
                      <Route path="cdp" element={<Cdp />} />
                      <Route path="meetings" element={<Meetings />} />
                      <Route path="creative" element={<Creative />} />
                      <Route path="defaulters" element={<RequireAuth managerOnly><Defaulters /></RequireAuth>} />
                      <Route path="employees" element={<RequireAuth managerOnly><Employees /></RequireAuth>} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="account" element={<Account />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
