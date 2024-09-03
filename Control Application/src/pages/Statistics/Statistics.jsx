import React, { useState, useEffect } from 'react';
import { Grid, Typography } from "@mui/material";
import io from 'socket.io-client';
import WorstOffsetChart from '../../Components/StatsDisplay/WorstOffsetChart';
import ArrivedDestinationChart from '../../Components/StatsDisplay/ArrivedDestinationChart';
import axios from 'axios';

const socket = io("http://localhost:5000");

const Statistics = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTelemetryData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trips/telemetry');
      setTelemetryData(response.data);
      localStorage.setItem('telemetryData', JSON.stringify(response.data));
      console.log("Fetched telemetry data for all trips:", response.data);
    } catch (error) {
      console.error("Error fetching telemetry data:", error);
      setError('Error fetching telemetry data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem('telemetryData');
    if (cachedData) {
      setTelemetryData(JSON.parse(cachedData));
      setIsLoading(false);
    } else {
      fetchTelemetryData();
    }

    socket.on("trip_update", (updatedTrip) => {
      console.log("New trip update received:", updatedTrip);
      setTelemetryData((prevData) => {
        const updatedTelemetryData = prevData.map((trip) =>
          trip.trip_id === updatedTrip.trip_id
            ? {
                ...trip,
                worst_offset: Math.max(trip.worst_offset, updatedTrip.avg_offset),
                arrived_to_destination: trip.arrived_to_destination || updatedTrip.arrived_to_destination,
              }
            : trip
        );
        localStorage.setItem('telemetryData', JSON.stringify(updatedTelemetryData));
        return updatedTelemetryData;
      });
    });

    return () => {
      socket.off("trip_update");
    };
  }, []);

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>{error}</span>;

  const numbersOfTripsArrived = telemetryData.filter(data => data.arrived_to_destination).length;

  return (
    <div className="w-full min-w-[320px] overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <Typography variant="h5" gutterBottom sx={{ marginBottom: "20px" }}>
          Trip Statistics
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <WorstOffsetChart worstOffsets={telemetryData.reverse()} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" paragraph>
              illustrates the number of vehicles that have arrived at their destination versus those that are still en route.
            </Typography>
            <ArrivedDestinationChart numbersOfTripsArrived={numbersOfTripsArrived} totalTrips={telemetryData.length} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Statistics;