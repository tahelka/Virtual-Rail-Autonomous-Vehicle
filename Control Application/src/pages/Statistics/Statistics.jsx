import React from 'react';
import { Typography } from '@mui/material';
import StatsDisplay from '../../Components/StatsDisplay/StatsDisplay';

const Statistics = () => {
  return (
    <div className="w-full min-w-[320px] overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <Typography variant="h5" gutterBottom sx={{ marginBottom: "20px" }}>
          Trip Statistics
        </Typography>
        <StatsDisplay />
      </div>
    </div>
  );
};

export default Statistics;