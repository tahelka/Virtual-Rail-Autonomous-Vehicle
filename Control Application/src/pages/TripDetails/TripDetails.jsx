import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Grid, Typography, Card, CardContent } from "@mui/material";
import io from "socket.io-client";
import TimelineComponent from "../../Components/TimelineComponent/TimelineComponent";

const socket = io("http://localhost:5000");

const TripDetails = () => {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [checkpointsData, setCheckpointsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripResponse = await axios.get(
          `http://localhost:5000/api/trips/${tripId}`
        );
        setTripData(tripResponse.data);
      } catch (err) {
        setError("Error fetching trip data.");
      }
    };

    const fetchCheckpointsData = async () => {
      try {
        const checkpointsResponse = await axios.get(
          `http://localhost:5000/api/vehicle_checkpoints/${tripId}`
        );
        setCheckpointsData(checkpointsResponse.data);
      } catch (err) {
        setError("Error fetching checkpoints data.");
      }
    };

    fetchTripData();
    fetchCheckpointsData();

    socket.on("checkpoint_data", (newCheckpoint) => {
      console.log("New checkpoint received:", newCheckpoint);

      if (newCheckpoint.trip_id !== tripId) return;

      setCheckpointsData((prevCheckpoints) => [
        ...prevCheckpoints,
        newCheckpoint,
      ]);
    });

    return () => {
      socket.off("checkpoint_data");
    };
  }, [tripId]);

  function mapPathToCreatedAt(tripData, checkpointsData) {
    if (!tripData || !checkpointsData) {
      return [];
    }

    const checkpointsDict = checkpointsData.reduce((acc, checkpoint) => {
      acc[checkpoint.checkpoint_id] = checkpoint.created_at;
      return acc;
    }, {});

    return tripData.path.map((checkpointId) => ({
      checkpoint_id: checkpointId,
      created_at: checkpointsDict[checkpointId] || "",
    }));
  }

  const timelineData = mapPathToCreatedAt(tripData, checkpointsData);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TimelineComponent timelineData={timelineData} />
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
              malesuada. Nulla facilisi. Morbi commodo odio nec interdum
              blandit. Nam consequat, odio at scelerisque consectetur, justo
              velit convallis nisl, nec laoreet felis nulla ut erat. Aliquam
              erat volutpat.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TripDetails;
