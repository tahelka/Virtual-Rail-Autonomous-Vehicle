import { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import CustomSnackbar from "../../Components/CustomSnackbar/CustomSnackbar";

const fetchMaps = async () => {
  const { data } = await axios.get("http://localhost:5000/api/maps");
  return data;
};

const OrderPage = () => {
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      contents: "",
      selectedMap: "",
      origin: "",
      destination: "",
    },
    mode: "onTouched",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error fetching maps.</span>;

  // Sort maps by creation_time (ascending order) and map them to "Map 1", "Map 2", etc.
  const sortedMaps = [...maps].sort(
    (a, b) => a.creation_time - b.creation_time
  );
  const mapOptions = sortedMaps.map((map, index) => ({
    id: map.id,
    name: `Map ${index + 1}`,
  }));

  const onSubmit = async (data) => {
    const { contents, selectedMap, origin, destination } = data;

    // Check if all required fields are filled
    if (!contents || !selectedMap || !origin || !destination) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Please fill out all fields.");
      setSnackbarOpen(true);
      return;
    }

    const url = `http://localhost:5000/api/orders/create`;

    const payload = {
      contents,
      map: selectedMap, // Make sure the `selectedMap` value is correctly mapped to the API payload
      origin,
      destination,
    };

    try {
      const response = await axios.post(url, payload);

      console.log(response);

      setSnackbarSeverity("success");
      setSnackbarMessage("Order submitted successfully!");
    } catch (error) {
      console.log(error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error submitting order.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: "auto", minWidth: 300 }}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          name="contents"
          control={control}
          rules={{ required: "Contents are required" }}
          render={({ field }) => (
            <TextField
              fullWidth
              label="Contents"
              variant="outlined"
              {...field}
              error={!!errors.contents}
              helperText={errors.contents?.message}
            />
          )}
        />

        <FormControl fullWidth error={!!errors.selectedMap}>
          <InputLabel id="choose-map-label">Map</InputLabel>
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
                  label="Map"
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

        <Controller
          name="origin"
          control={control}
          rules={{ required: "Origin is required" }}
          render={({ field }) => (
            <TextField
              fullWidth
              label="Origin"
              variant="outlined"
              {...field}
              error={!!errors.origin}
              helperText={errors.origin?.message}
            />
          )}
        />

        <Controller
          name="destination"
          control={control}
          rules={{ required: "Destination is required" }}
          render={({ field }) => (
            <TextField
              fullWidth
              label="Destination"
              variant="outlined"
              {...field}
              error={!!errors.destination}
              helperText={errors.destination?.message}
            />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ alignSelf: "flex-start", minWidth: 300 }}
        >
          Submit Order
        </Button>
      </Box>

      <CustomSnackbar
        open={snackbarOpen}
        onClose={handleClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default OrderPage;
