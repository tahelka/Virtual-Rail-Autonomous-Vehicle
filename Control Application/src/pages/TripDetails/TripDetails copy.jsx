import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TripDetails = () => {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [checkpointsData, setCheckpointsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        // Fetch trip data using tripId
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
        // Fetch checkpoints data using a hardcoded checkpoint ID
        const checkpointsResponse = await axios.get(
          `http://localhost:5000/api/vehicle_checkpoints/66b7af2c17afb90681d9f458`
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

  return (
    <div>
      <p>Trip ID: {tripId}</p>
      <h2>Trip Details:</h2>
      {tripData ? (
        <pre>{JSON.stringify(tripData, null, 2)}</pre>
      ) : (
        <p>Loading trip data...</p>
      )}

      <h2>Vehicle Checkpoints:</h2>
      {checkpointsData ? (
        <pre>{JSON.stringify(checkpointsData, null, 2)}</pre>
      ) : (
        <p>Loading checkpoints data...</p>
      )}

      {error && <p>Error fetching data.</p>}
    </div>
  );
};

export default TripDetails;
