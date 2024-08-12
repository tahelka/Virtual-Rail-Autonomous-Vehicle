import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Grid, Typography } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Start as StartIcon, Flag as FlagIcon } from "@mui/icons-material";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with your server URL

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

    // Set up Socket.IO listener for real-time updates
    socket.on("checkpoint_data", (newCheckpoint) => {
      console.log("New checkpoint received:", newCheckpoint);

      //check if the newCheckpoint belongs to the current trip
      if (newCheckpoint.trip_id !== tripId) return;

      setCheckpointsData((prevCheckpoints) => [
        ...prevCheckpoints,
        newCheckpoint,
      ]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("checkpoint_data");
    };
  }, [tripId]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? ""
    );
  };

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
    <Grid sx={{ minWidth: "500px" }}>
      <Timeline position="alternate">
        {timelineData.map((checkpoint, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent
              sx={{ m: "auto 0" }}
              align={index === 0 ? "right" : "left"}
              variant="body2"
              color="text.secondary"
            >
              {checkpoint.created_at !== ""
                ? formatTime(checkpoint.created_at)
                : ""}
            </TimelineOppositeContent>
            <TimelineSeparator>
              {index !== 0 && <TimelineConnector />}
              <TimelineDot
                sx={{
                  bgcolor:
                    checkpoint.created_at === "" ? "grey.500" : "primary.main",
                }}
              >
                {index === 0 ? (
                  <StartIcon />
                ) : index === timelineData.length - 1 ? (
                  <FlagIcon />
                ) : null}
              </TimelineDot>
              {index < timelineData.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                Checkpoint {checkpoint.checkpoint_id}
              </Typography>
              <Typography>
                {index === 0
                  ? "Start of the journey"
                  : index === timelineData.length - 1
                  ? "End of the journey"
                  : "Intermediate checkpoint"}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Grid>
  );
};

export default TripDetails;
