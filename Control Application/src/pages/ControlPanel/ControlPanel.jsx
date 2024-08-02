import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";

const ControlPanel = () => {
  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Control Panel
      </Typography>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <FormControl fullWidth>
          <InputLabel id="choose-map-label">Choose map</InputLabel>
          <Select labelId="choose-map-label" id="choose-map" label="Choose map">
            <MenuItem value={1}>Map 1</MenuItem>
            <MenuItem value={2}>Map 2</MenuItem>
            <MenuItem value={3}>Map 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="starting-point-label">Starting point</InputLabel>
          <Select
            labelId="starting-point-label"
            id="starting-point"
            label="Starting point"
          >
            <MenuItem value={1}>Point A</MenuItem>
            <MenuItem value={2}>Point B</MenuItem>
            <MenuItem value={3}>Point C</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="destination-point-label">
            Destination point
          </InputLabel>
          <Select
            labelId="destination-point-label"
            id="destination-point"
            label="Destination point"
          >
            <MenuItem value={1}>Destination X</MenuItem>
            <MenuItem value={2}>Destination Y</MenuItem>
            <MenuItem value={3}>Destination Z</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="vehicle-orientation-label">
            Vehicle Orientation
          </InputLabel>
          <Select
            labelId="vehicle-orientation-label"
            id="vehicle-orientation"
            label="Vehicle Orientation"
          >
            <MenuItem value={1}>North</MenuItem>
            <MenuItem value={2}>East</MenuItem>
            <MenuItem value={3}>South</MenuItem>
            <MenuItem value={4}>West</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ alignSelf: "flex-start" }}
        >
          Start
        </Button>
      </Box>
    </Box>
  );
};

export default ControlPanel;
