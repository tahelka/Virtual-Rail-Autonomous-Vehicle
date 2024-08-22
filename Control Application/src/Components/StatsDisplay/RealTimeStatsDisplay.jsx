import React, { useState, useEffect } from 'react';
import { Typography, Button, Snackbar, Alert, Box, Grid } from '@mui/material';
import OffsetChart from './OffsetChart';

const RealTimeStatsDisplay = ({ checkpointsData }) => {
  const [offsetData, setOffsetData] = useState([]);
  const [viewWindow, setViewWindow] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Update offset data based on checkpointsData
    const newOffsetData = checkpointsData.map((checkpoint) => ({
      time: checkpoint.created_at,
      value: checkpoint.avg_offset,
    }));

    setOffsetData((prevData) => [
      ...prevData,
      ...checkpointsData.map((checkpoint) => ({
        time: checkpoint.created_at,
        value: checkpoint.avg_offset,
      }))
    ].slice(-100));
    
  }, [checkpointsData]);

  const handleZoom = (direction) => {
    setViewWindow(prev => {
      if (direction === 'in') return Math.max(5, prev - 5);
      if (direction === 'out') return Math.min(100, prev + 5);
      return prev;
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ minWidth: '400px' }}>
          <OffsetChart data={offsetData} viewWindow={viewWindow} />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleZoom('in')}>
          Zoom In
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleZoom('out')}>
          Zoom Out
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RealTimeStatsDisplay;
