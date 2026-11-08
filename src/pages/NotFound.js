import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h2" sx={{ fontWeight: 800, color: "primary.main" }}>404</Typography>
      <Typography variant="h6" gutterBottom>This page doesn't exist.</Typography>
      <Button component={Link} to="/" variant="contained">Back to dashboard</Button>
    </Box>
  );
}
