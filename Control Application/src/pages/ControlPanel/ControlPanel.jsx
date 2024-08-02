import React, { useState, useEffect } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";

const fetchMaps = async () => {
  const { data } = await axios.get("http://localhost:5000/api/maps");
  return data;
};

const ControlPanel = () => {
  const {
    data: maps,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["maps"],
    queryFn: fetchMaps,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      selectedMap: "",
      startingPoint: "",
      destinationPoint: "",
      orientation: "",
    },
    mode: "onTouched", // Trigger validation on touch
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (maps && watch("selectedMap")) {
      // Reset points when map changes
      setValue("startingPoint", "");
      setValue("destinationPoint", "");
    }
  }, [watch("selectedMap"), maps, setValue]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching maps.</p>;

  // Sort maps by creation_time (ascending order) and map them to "Map 1", "Map 2", etc.
  const sortedMaps = [...maps].sort(
    (a, b) => a.creation_time - b.creation_time
  );
  const mapOptions = sortedMaps.map((map, index) => ({
    id: map.id,
    name: `Map ${index + 1}`,
  }));

  const onSubmit = async (data) => {
    const { selectedMap, startingPoint, destinationPoint, orientation } = data;

    // Check if all required fields are filled
    if (!selectedMap || !startingPoint || !destinationPoint || !orientation) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Please fill out all fields.");
      setSnackbarOpen(true);
      return;
    }

    const url = `http://localhost:5000/api/graph?mapid=${selectedMap}&start=${startingPoint}&target=${destinationPoint}&orientation=${orientation}`;

    try {
      const response = await axios.get(url);

      console.log(response);

      setSnackbarSeverity("success");
      setSnackbarMessage("Request successful!");
    } catch (error) {
      console.log(error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error fetching graph data.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  const selectedMap = watch("selectedMap");
  const nodes = sortedMaps.find((map) => map.id === selectedMap)?.data || [];

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: "auto", minWidth: 300 }}>
      {/* <Typography variant="h4" gutterBottom>
        Control Panel
      </Typography> */}
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormControl fullWidth error={!!errors.selectedMap}>
          <InputLabel id="choose-map-label">Choose map</InputLabel>
          <Controller
            name="selectedMap"
            control={control}
            rules={{ required: "Map selection is required" }}
            render={({ field }) => (
              <>
                <Select
                  labelId="choose-map-label"
                  id="choose-map"
                  {...field}
                  label="Choose map"
                  onChange={(e) => {
                    field.onChange(e);
                    // Reset points when map changes
                    setValue("startingPoint", "");
                    setValue("destinationPoint", "");
                  }}
                >
                  {mapOptions.map((map) => (
                    <MenuItem key={map.id} value={map.id}>
                      {map.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.selectedMap && (
                  <FormHelperText>{errors.selectedMap.message}</FormHelperText>
                )}
              </>
            )}
          />
        </FormControl>

        <FormControl fullWidth error={!!errors.startingPoint}>
          <InputLabel id="starting-point-label">Starting point</InputLabel>
          <Controller
            name="startingPoint"
            control={control}
            rules={{ required: "Starting point is required" }}
            render={({ field }) => (
              <>
                <Select
                  labelId="starting-point-label"
                  id="starting-point"
                  {...field}
                  label="Starting point"
                >
                  {nodes.map((node) => (
                    <MenuItem key={node.id} value={node.id}>
                      Point {node.id}
                    </MenuItem>
                  ))}
                </Select>
                {errors.startingPoint && (
                  <FormHelperText>
                    {errors.startingPoint.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </FormControl>

        <FormControl fullWidth error={!!errors.destinationPoint}>
          <InputLabel id="destination-point-label">
            Destination point
          </InputLabel>
          <Controller
            name="destinationPoint"
            control={control}
            rules={{ required: "Destination point is required" }}
            render={({ field }) => (
              <>
                <Select
                  labelId="destination-point-label"
                  id="destination-point"
                  {...field}
                  label="Destination point"
                >
                  {nodes.map((node) => (
                    <MenuItem key={node.id} value={node.id}>
                      Destination {node.id}
                    </MenuItem>
                  ))}
                </Select>
                {errors.destinationPoint && (
                  <FormHelperText>
                    {errors.destinationPoint.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </FormControl>

        <FormControl fullWidth error={!!errors.orientation}>
          <InputLabel id="vehicle-orientation-label">
            Vehicle Orientation
          </InputLabel>
          <Controller
            name="orientation"
            control={control}
            rules={{ required: "Orientation is required" }}
            render={({ field }) => (
              <>
                <Select
                  labelId="vehicle-orientation-label"
                  id="vehicle-orientation"
                  {...field}
                  label="Vehicle Orientation"
                >
                  <MenuItem value={"north"}>North</MenuItem>
                  <MenuItem value={"east"}>East</MenuItem>
                  <MenuItem value={"south"}>South</MenuItem>
                  <MenuItem value={"west"}>West</MenuItem>
                </Select>
                {errors.orientation && (
                  <FormHelperText>{errors.orientation.message}</FormHelperText>
                )}
              </>
            )}
          />
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ alignSelf: "flex-start", minWidth: 300 }}
        >
          Start
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            backgroundColor:
              snackbarSeverity === "success" ? "#69db7c" : "#c92a2a",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ControlPanel;
