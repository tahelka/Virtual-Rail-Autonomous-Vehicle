import React, { useState, useEffect } from 'react';
import { Grid, Typography } from "@mui/material";
import WorstOffsetChart from '../../Components/StatsDisplay/WorstOffsetChart';
import ArrivedDestinationChart from '../../Components/StatsDisplay/ArrivedDestinationChart';
import axios from 'axios';

const Statistics = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTelemetryData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trips/telemetry');
      setTelemetryData(response.data);
      console.log("Fetched telemetry data for all trips:", response.data);
    } catch (error) {
      console.error("Error fetching telemetry data:", error);
      setError('Error fetching telemetry data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
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
            <WorstOffsetChart worstOffsets={telemetryData} />
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