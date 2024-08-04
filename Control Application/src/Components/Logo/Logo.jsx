// src/components/Logo.js
import { Typography, Box } from "@mui/material";
import DirectionsCarSharpIcon from "@mui/icons-material/DirectionsCarSharp"; // Import the specific car icon

const Logo = () => {
  return (
    <Box display="flex" alignItems="center">
      <DirectionsCarSharpIcon sx={{ mr: 1, mb: 0.5 }} />{" "}
      {/* Adjust the margin as needed */}
      <Typography variant="h6">Talide</Typography>
    </Box>
  );
};

export default Logo;
