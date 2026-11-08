import React from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Stack,
} from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export function PageHeader({ title, subtitle, color, icon: Icon, actions }) {
  return (
    <Box
      sx={{
        background: color.gradient,
        color: "#fff",
        borderRadius: { xs: 3, md: 4 },
        p: { xs: 2, sm: 3 },
        mb: 3,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        boxShadow: `0 10px 24px -10px ${color.main}`,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
        {Icon && (
          <Box sx={{ bgcolor: "rgba(255,255,255,.2)", borderRadius: 3, p: 1.2, display: "flex" }}>
            <Icon sx={{ fontSize: { xs: 28, sm: 34 } }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontSize: { xs: "1.25rem", sm: "1.6rem" } }}>{title}</Typography>
          {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
        </Box>
      </Stack>
      {actions && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{actions}</Stack>}
    </Box>
  );
}

export function EmptyState({ icon: Icon, title, hint, color = "#64748b" }) {
  return (
    <Box sx={{ textAlign: "center", py: 5, px: 2, color: "text.secondary" }}>
      {Icon && <Icon sx={{ fontSize: 48, color, opacity: 0.6 }} />}
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      {hint && <Typography variant="body2">{hint}</Typography>}
    </Box>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent><Typography>{message}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}

export function FormDialog({ open, title, onClose, onSubmit, color, submitLabel = "Save", children, disabled }) {
  return (
    <Dialog open={open} onClose={onClose} fullScreen={false} scroll="paper">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <DialogTitle sx={{ background: color?.gradient, color: color ? "#fff" : undefined }}>{title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>{children}</Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={disabled} sx={{ bgcolor: color?.main, "&:hover": { bgcolor: color?.dark } }}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function RequireAuth({ children, managerOnly }) {
  const { isAuthenticated } = useAuth();
  const { currentUser } = useData();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (managerOnly && currentUser?.role !== "manager") return <Navigate to="/" replace />;
  return children;
}
