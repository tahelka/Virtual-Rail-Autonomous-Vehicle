import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Box,
} from "@mui/material";

const TripDetails = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/trips/${tripId}`
        );
        setTrip(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  if (loading)
    return <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container component="main" maxWidth="lg">
      <Paper sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" gutterBottom>
          Trip Details
        </Typography>
        {trip ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">ID:</Typography>
              <Typography variant="body1">{trip._id}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Map ID:</Typography>
              <Typography variant="body1">{trip.map_id}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Order ID:</Typography>
              <Typography variant="body1">{trip.order_id}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Created At:</Typography>
              <Typography variant="body1">
                {new Date(trip.created_at).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Arrived at Destination:</Typography>
              <Typography variant="body1">
                {trip.arrived_at_destination ? "Yes" : "No"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Average Offset:</Typography>
              <Typography variant="body1">{trip.avg_offset}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Starting Orientation:</Typography>
              <Typography variant="body1">
                {trip.starting_orientation}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Starting Point:</Typography>
              <Typography variant="body1">{trip.starting_point}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Destination Point:</Typography>
              <Typography variant="body1">{trip.destination_point}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Directions:</Typography>
              <Typography variant="body1">
                {trip.directions.length > 0
                  ? trip.directions.join(", ")
                  : "No directions"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Path:</Typography>
              <Typography variant="body1">
                {trip.path.length > 0 ? trip.path.join(", ") : "No path"}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body1">No trip details available.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default TripDetails;
