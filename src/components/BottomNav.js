import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";

const BottomNav = () => {
  const [value, setValue] = React.useState(0);

  return (
    <Box
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ backgroundColor: "#0e4959" }}
      >
        <BottomNavigationAction
          label="Recents"
          icon={<RestoreIcon />}
          sx={{ color: "#fff" }}
        />
        <BottomNavigationAction
          label="Dashboard"
          icon={<HomeIcon />}
          sx={{ color: "#fff" }}
        />
        <BottomNavigationAction
          label="Tasks"
          icon={<NotificationsIcon />}
          sx={{ color: "#fff" }}
        />
      </BottomNavigation>
    </Box>
  );
};

export default BottomNav;
