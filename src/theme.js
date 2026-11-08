import { createTheme } from "@mui/material/styles";

// One accent colour per section, used by cards, headers and chips.
export const sectionColors = {
  attendance: { main: "#0891b2", dark: "#0e7490", light: "#cffafe", gradient: "linear-gradient(135deg,#06b6d4,#0e7490)" },
  tasks: { main: "#7c3aed", dark: "#5b21b6", light: "#ede9fe", gradient: "linear-gradient(135deg,#8b5cf6,#5b21b6)" },
  cdp: { main: "#059669", dark: "#047857", light: "#d1fae5", gradient: "linear-gradient(135deg,#10b981,#047857)" },
  meetings: { main: "#d97706", dark: "#b45309", light: "#fef3c7", gradient: "linear-gradient(135deg,#f59e0b,#b45309)" },
  creative: { main: "#db2777", dark: "#9d174d", light: "#fce7f3", gradient: "linear-gradient(135deg,#ec4899,#9d174d)" },
  defaulters: { main: "#dc2626", dark: "#991b1b", light: "#fee2e2", gradient: "linear-gradient(135deg,#ef4444,#991b1b)" },
  employees: { main: "#4f46e5", dark: "#3730a3", light: "#e0e7ff", gradient: "linear-gradient(135deg,#6366f1,#3730a3)" },
  home: { main: "#0e4959", dark: "#0a3441", light: "#d9eef3", gradient: "linear-gradient(135deg,#0e4959,#14788f)" },
};

const theme = createTheme({
  palette: {
    primary: { main: "#0e4959" },
    secondary: { main: "#f59e0b" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    success: { main: "#16a34a" },
    error: { main: "#dc2626" },
    warning: { main: "#d97706" },
    text: { primary: "#0f172a", secondary: "#475569" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(15,23,42,.08), 0 4px 14px rgba(15,23,42,.05)" } } },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: "sm" } },
    MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
  },
});

export default theme;
