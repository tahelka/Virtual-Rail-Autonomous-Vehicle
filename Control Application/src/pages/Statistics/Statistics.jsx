import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardContent } from "@mui/material";
import WorstOffsetChart from '../../Components/StatsDisplay/WorstOffsetChart';
import axios from 'axios';

const Statistics = () => {
  const [worstOffsets, setWorstOffsets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorstOffsets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trips/worst_offsets');
      setWorstOffsets(response.data);
      console.log("Fetched worst offsets for all trips:", response.data);
    } catch (error) {
      console.error("Error fetching worst offsets:", error);
      setError('Error fetching worst offsets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorstOffsets();
  }, []);

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>{error}</span>;

  return (
    <div className="w-full min-w-[320px] overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <Typography variant="h5" gutterBottom sx={{ marginBottom: "20px" }}>
          Trip Statistics
        </Typography>
        <Grid item xs={12}>
          <WorstOffsetChart worstOffsets={worstOffsets} />   
        </Grid> 
      </div>
    </div>
  );
};

export default Statistics;