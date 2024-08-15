import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, Box, Grid } from '@mui/material';
import io from 'socket.io-client';
import OffsetChart from './OffsetChart';
import SpeedChart from './SpeedChart';

const StatsDisplay = () => {
  const [offsetData, setOffsetData] = useState([]);
  const [speedData, setSpeedData] = useState([]);
  const [viewWindow, setViewWindow] = useState(10);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [historyList, setHistoryList] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      setError(null);
      setSnackbar({ open: true, message: 'Connected to Socket.IO server', severity: 'success' });
      socketRef.current.emit('list_histories');
    });

    socketRef.current.on('data', (message) => {
      const data = message.payload;
      const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

      setOffsetData(prevData => [...prevData, { time: timestamp, value: data.avg_offset }].slice(-100));
      setSpeedData(prevData => [...prevData, { time: timestamp, value: data.speed }].slice(-100));
    });

    socketRef.current.on('end', () => {
      setIsLive(false);
      setSnackbar({ open: true, message: 'Real-time data ended and history saved', severity: 'info' });
      socketRef.current.emit('list_histories');
    });

    socketRef.current.on('load', (message) => {
      if (message.payload) {
        const loadedOffsetData = message.payload.map(item => ({
          time: new Date(item.timestamp * 1000).toLocaleTimeString(),
          value: item.avg_offset
        }));
        const loadedSpeedData = message.payload.map(item => ({
          time: new Date(item.timestamp * 1000).toLocaleTimeString(),
          value: item.speed
        }));
        setOffsetData(loadedOffsetData);
        setSpeedData(loadedSpeedData);
        setSnackbar({ open: true, message: 'History loaded successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'No history available to load', severity: 'warning' });
      }
    });

    socketRef.current.on('history_list', (message) => {
      setHistoryList(message.payload);
    });

    socketRef.current.on('connect_error', (error) => {
      setError('Failed to connect to Socket.IO server');
      setSnackbar({ open: true, message: 'Failed to connect to Socket.IO server', severity: 'error' });
    });

    socketRef.current.on('disconnect', () => {
      setSnackbar({ open: true, message: 'Socket.IO connection closed', severity: 'info' });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleZoom = (direction) => {
    setViewWindow(prev => {
      if (direction === 'in') return Math.max(5, prev - 5);
      if (direction === 'out') return Math.min(100, prev + 5);
      return prev;
    });
  };

  const loadHistory = (tripId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('load', { tripId: tripId });
    } else {
      setSnackbar({ open: true, message: 'Socket.IO is not connected', severity: 'error' });
    }
  };

  const handleHistoryChange = (event) => {
    const tripId = event.target.value;
    setSelectedHistory(tripId);
    loadHistory(tripId);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const startDataStream = () => {
    // Clear the graphs
    setOffsetData([]);
    setSpeedData([]);
    
    // Start the new data stream
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('trip_started');
      setIsLive(true);
      setSnackbar({ open: true, message: 'Started a new trip', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Socket.IO is not connected', severity: 'error' });
    }
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ width: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} style={{ minWidth: '400px' }}>
        <OffsetChart data={offsetData} viewWindow={viewWindow} />
      </Grid>
      <Grid item xs={12} md={6} style={{ minWidth: '400px' }}>
        <SpeedChart data={speedData} viewWindow={viewWindow} />
      </Grid>
    </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleZoom('in')}>
          Zoom In
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleZoom('out')}>
          Zoom Out
        </Button>
        <Button variant="contained" color="secondary" onClick={startDataStream}>
          Start New Trip
        </Button>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Select History</InputLabel>
          <Select value={selectedHistory} onChange={handleHistoryChange} label="Select History">
            {historyList.map((tripId) => (
              <MenuItem key={tripId} value={tripId}>
                {tripId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {!isLive && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
          A trip has ended. You can now select a history to view or start a new trip.
        </Typography>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StatsDisplay;