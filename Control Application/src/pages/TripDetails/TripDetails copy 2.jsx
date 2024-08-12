import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";

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
        console.log("Trip Data:", tripResponse.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching trip data:", err);
      }
    };

    const fetchCheckpointsData = async () => {
      try {
        const checkpointsResponse = await axios.get(
          `http://localhost:5000/api/vehicle_checkpoints/${tripId}`
        );
        setCheckpointsData(checkpointsResponse.data);
        console.log("Checkpoints Data:", checkpointsResponse.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching checkpoints data:", err);
      }
    };

    fetchTripData();
    fetchCheckpointsData();
  }, [tripId]);

  // Function to format date into time string
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  function mapPathToCreatedAt(tripData, checkpointsData) {
    // If tripData or checkpointsData is not available, return an empty array
    if (!tripData || !checkpointsData) {
      return [];
    }

    // Create a dictionary for quick lookup
    const checkpointsDict = checkpointsData.reduce((acc, checkpoint) => {
      acc[checkpoint.checkpoint_id] = checkpoint.created_at;
      return acc;
    }, {});

    // Map path items to an array of objects with checkpoint_id and created_at times
    const pathWithTimes = tripData.path.map((checkpointId) => ({
      checkpoint_id: checkpointId,
      created_at: checkpointsDict[checkpointId] || "No data available",
    }));

    return pathWithTimes;
  }

  const timelineData = mapPathToCreatedAt(tripData, checkpointsData);

  console.log(timelineData);

  return (
    <div>
      <p>Trip ID: {tripId}</p>
      <h2>Trip Details:</h2>
      {tripData ? (
        <pre>{JSON.stringify(tripData, null, 2)}</pre>
      ) : (
        <p>Loading trip data...</p>
      )}

      <p>Trip ID: {tripId}</p>
      <h2>Checkpint Details:</h2>
      {tripData ? (
        <pre>{JSON.stringify(checkpointsData, null, 2)}</pre>
      ) : (
        <p>Loading trip data...</p>
      )}

      <h2>Vehicle Checkpoints:</h2>
      {checkpointsData.length > 0 ? (
        <Timeline position="alternate">
          {timelineData.map((checkpoint, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent color="text.secondary">
                {checkpoint.created_at}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                {index < checkpointsData.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                Checkpoint {checkpoint.checkpoint_id}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <p>Loading checkpoints data...</p>
      )}

      {error && <p>Error fetching data.</p>}
    </div>
  );
};

export default TripDetails;
