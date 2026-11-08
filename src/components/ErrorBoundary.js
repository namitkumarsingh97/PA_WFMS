import React from "react";
import { Alert, Button, Box, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: "center", minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1">
              {this.state.error && this.state.error.toString()}
            </Typography>
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details style={{ whiteSpace: "pre-wrap", textAlign: "left", mt: 2 }}>
                <summary>Error Details</summary>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </Alert>
          <Button variant="contained" color="primary" startIcon={<RefreshIcon />} onClick={this.handleReset}>
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;