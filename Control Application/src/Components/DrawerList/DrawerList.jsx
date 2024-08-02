import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, useLocation } from "react-router-dom";

function CustomList() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => navigate("/control-panel")}
          sx={{
            backgroundColor:
              currentPath === "/control-panel" ? "lightgray" : "white",
            "&:hover": {
              backgroundColor:
                currentPath === "/control-panel" ? "lightgray" : "whitesmoke",
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Control Panel" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => navigate("/manage-maps")}
          sx={{
            backgroundColor:
              currentPath === "/manage-maps" ? "lightgray" : "white",
            "&:hover": {
              backgroundColor:
                currentPath === "/manage-maps" ? "lightgray" : "whitesmoke",
            },
          }}
        >
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Maps" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => navigate("/statistics")}
          sx={{
            backgroundColor:
              currentPath === "/statistics" ? "lightgray" : "white",
            "&:hover": {
              backgroundColor:
                currentPath === "/statistics" ? "lightgray" : "whitesmoke",
            },
          }}
        >
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => navigate("/settings")}
          sx={{
            backgroundColor:
              currentPath === "/settings" ? "lightgray" : "white",
            "&:hover": {
              backgroundColor:
                currentPath === "/settings" ? "lightgray" : "whitesmoke",
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </ListItem>
    </List>
  );
}

export default CustomList;
