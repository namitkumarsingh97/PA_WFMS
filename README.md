# PA-WFMS — Providence Adwork Workflow Management System

A responsive workflow management portal for attendance, leave, tasks, career development, meetings and creative requests, with separate **Employee** and **Manager** experiences.

Built with React 18, Material UI 5, React Router 6 and Create React App. It runs entirely in the browser and saves data to `localStorage`, so it works with no backend (see [Limitations](#limitations)).

## Features

| Section | Route | What it does |
|---|---|---|
| Dashboard | `/` | Punch in/out, monthly stats, shortcuts, upcoming meetings, tasks due soon |
| Attendance | `/attendance` | Month calendar (P, WOFF, L-APR, ABS, late flag), day details, leave balances, apply for leave |
| Tasks | `/tasks` | Sprint kanban with drag and drop, create/edit, search, sprint and assignee filters |
| CDP | `/cdp` | Career goals with categories, progress and target dates |
| Meetings | `/meetings` | Schedule, edit and complete meetings, with Upcoming/Past/Cancelled tabs |
| Creative Team | `/creative` | Design request pipeline: Brief → In Design → In Review → Approved |
| Defaulters *(manager)* | `/defaulters` | Late/absent report by month, CSV export, leave approvals |
| Employees *(manager)* | `/employees` | Add employees with login credentials, edit, reset passwords, disable/enable access |
| Profile / Account | `/profile`, `/account` | Edit details, change password, reset data (manager) |

Also included: notifications (due tasks, today's meetings, pending leaves), lazy-loaded routes, an error boundary, and a per-section colour theme.

### Roles

| Action | Employee | Manager |
|---|---|---|
| Create/edit tasks, meetings, creative requests, own CDP goals | ✅ | ✅ |
| Delete tasks, meetings, creative requests | ❌ | ✅ |
| Cancel/reinstate meetings | ❌ | ✅ |
| Approve or reject leave | ❌ | ✅ |
| Add employees / reset passwords / disable access | ❌ | ✅ |
| View Defaulters, reset app data | ❌ | ✅ |

Restrictions are hidden in the UI and also enforced in `src/context/DataContext.js`.

### Leave policy

Defined in `src/utils/leave.js` (`LEAVE_TYPES`). Week-offs are not counted. Pending and approved requests both use up the balance.

| Type | Days/year | Rule |
|---|---|---|
| Sick Leave | 12 | Up to 3 consecutive days; more needs a doctor's certificate reference. Can be back-dated 7 days |
| Casual Leave | 15 | Max 5 consecutive days |
| Earned Leave | 18 | Max 15 consecutive days; apply 7 days ahead |
| Compensatory Off | 6 | Max 2 consecutive days |
| Bereavement Leave | 5 | Can be back-dated 7 days |
| Paternity Leave | 10 | — |
| Maternity Leave | 180 | — |

Attendance rules (late-after time, defaulter threshold) live in `src/config.js`: late after 10:15, defaulter at 3+ late marks or any absence.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm start
```

The app opens at http://localhost:3000.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Manager | `neha@providenceadwork.com` | `manager123` |
| Employee | `amit@providenceadwork.com` | `employee123` |
| Other staff | `rahul@`, `priya@`, `karan@`, `sneha@providenceadwork.com` | `welcome123` |

Managers can create more accounts under **Employees**.

### Scripts

| Command | Description |
|---|---|
| `npm start` | Development server |
| `npm test` | Unit tests (dates, attendance, leave rules) |
| `npm run build` | Production build in `build/` |

### Configuration

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `REACT_APP_APP_NAME` | Name shown in the header |
| `REACT_APP_VERSION` | Version shown on the Account page |
| `REACT_APP_ENV` | Environment label |
| `REACT_APP_API_BASE_URL` | Reserved for a future backend (not used yet) |

## Project structure

```
src/
├── App.js              # Providers, routes, layout shell
├── config.js           # Env-driven settings and attendance rules
├── theme.js            # MUI theme and per-section colours
├── context/            # AuthContext, DataContext, ToastContext
├── data/seed.js        # Sample users and data
├── components/         # Navbar, BottomNav, ErrorBoundary, shared dialogs
├── pages/              # One file per section
└── utils/              # date, attendance, leave, nav, storage helpers (+ tests)
```

## Deployment

```bash
npm run build
```

Serve the `build/` folder from any static host. Because the app uses client-side routing, configure the host to fall back to `index.html` for unknown paths (for example `serve -s build`).

## Limitations

- **No backend.** Data and logins live in each browser's `localStorage`. Nothing is shared between users or devices, and clearing browser data resets the app.
- **Passwords are stored in plain text** in the browser and the demo passwords are in the source. This is fine for a demo or local pilot but **not safe for real use**.
- For real multi-user use, replace the internals of `AuthContext` and `DataContext` with API calls (using `REACT_APP_API_BASE_URL`) and add server-side authentication, hashing and authorisation.
