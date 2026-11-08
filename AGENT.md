# PA-WFMS (Providence Adwork Workflow Management System)

React 18 + MUI 5 + React Router 6 (Create React App). Runs fully client-side: data persists to `localStorage` (keys `wfms_db_v1`, `wfms_session_v1`, `wfms_passwords_v1`).

## Demo accounts
- Employee: `amit@providenceadwork.com` / `employee123`
- Manager: `neha@providenceadwork.com` / `manager123` (sees Defaulters + leave approvals)
- Others: `*@providenceadwork.com` / `welcome123` (see `src/data/seed.js`)

## Sections (each has its own accent colour in `src/theme.js`)
| Route | Feature |
|---|---|
| `/` | Dashboard: punch in/out, stats, shortcuts, upcoming meetings, tasks due |
| `/attendance` | Month-aware calendar, late flag, day details, apply/cancel leave |
| `/tasks` | Sprint kanban: drag & drop, create/edit/delete, search/sprint/assignee filters |
| `/cdp` | Career goals with progress, categories, CRUD |
| `/meetings` | Upcoming/Past/Cancelled, schedule/edit/complete/cancel/delete |
| `/creative` | Design request pipeline (Brief → Approved), CRUD |
| `/defaulters` | Manager only: late/absent report, CSV export, leave approvals |
| `/employees` | Manager only: add employee + issue login (generated temp password), edit, reset password, disable/enable access |
| `/profile`, `/account` | Edit profile, change password, reset data |

## Layout
`Navbar` (hamburger drawer below 1200px, notifications, user menu) + `BottomNav` (below 900px). Pages lazy-loaded; `ErrorBoundary` wraps the app.

## Structure
`src/context` (Auth, Data, Toast) · `src/pages` · `src/components` · `src/utils` · `src/data/seed.js` · `src/config.js` (reads `REACT_APP_*` from `.env`, see `.env.example`).

## Scripts
`npm start` · `npm run build` · `npm test`

## Going multi-user
Replace `DataContext`/`AuthContext` internals with API calls to `REACT_APP_API_BASE_URL`; seed passwords are demo-only.

## Roles
Employees can view/create/edit but cannot delete tasks, meetings or creative requests, cancel meetings, approve leave, manage employees or reset data. Enforced in the UI and in `DataContext` (`isManagerIn`). Credentials live in `AuthContext` (`wfms_credentials_v1`).

## Leave policy (`src/utils/leave.js`)
Sick 12/yr (max 3 consecutive working days, longer needs a doctor certificate reference) · Casual 15/yr (max 5 consecutive) · Earned 18/yr (7 days notice) · Compensatory Off 6/yr · Bereavement 5 · Paternity 10 · Maternity 180. Week-offs are not counted; pending + approved requests use up balance; approval marks every working day in the range as L-APR. Edit `LEAVE_TYPES` to change quotas.
