const config = {
  appName: process.env.REACT_APP_APP_NAME || "Workflow Management System",
  company: "Providence Adwork",
  version: process.env.REACT_APP_VERSION || "1.0.0",
  env: process.env.REACT_APP_ENV || "production",
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || "",
  // Attendance rules
  lateAfter: "10:15",
  defaulterLateLimit: 3,
};

export default config;
