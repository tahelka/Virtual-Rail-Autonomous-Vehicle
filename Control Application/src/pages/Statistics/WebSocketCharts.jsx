import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Typography, Button, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, Box, Grid } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WebSocketCharts = () => {
  const [offsetData, setOffsetData] = useState([]);
  const [speedData, setSpeedData] = useState([]);
  const [viewWindow, setViewWindow] = useState(10);
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [historyList, setHistoryList] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState('');
  const wsRef = useRef(null);

  const createChartData = useCallback((data, label, color) => ({
    labels: data.slice(-viewWindow).map(d => d.time),
    datasets: [
      {
        label,
        data: data.slice(-viewWindow).map(d => d.value),
        borderColor: color,
        backgroundColor: `${color}50`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  }), [viewWindow]);

  const options = (title, yAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title, font: { size: 16 } },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time' },
        ticks: { maxTicksLimit: 10 },
      },
      y: {
        title: { display: true, text: yAxisLabel },
        suggestedMin: yAxisLabel === 'Offset' ? -100 : 0,
        suggestedMax: yAxisLabel === 'Offset' ? 100 : 140,
      }
    },
    animation: { duration: 0 },
    elements: { line: { borderWidth: 2 } },
  });

  const handleZoom = (direction) => {
    setViewWindow(prev => {
      if (direction === 'in') return Math.max(5, prev - 5);
      if (direction === 'out') return Math.min(100, prev + 5);
      return prev;
    });
  };

  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8765');

      wsRef.current.onopen = () => {
        setError(null);
        setSnackbar({ open: true, message: 'Connected to WebSocket server', severity: 'success' });
        wsRef.current.send(JSON.stringify({ type: 'list_histories' }));
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'data':
            const data = message.payload;
            const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

            setOffsetData(prevData => {
              const newData = [...prevData, { time: timestamp, value: data.avg_offset }];
              return newData.slice(-100);
            });

            setSpeedData(prevData => {
              const newData = [...prevData, { time: timestamp, value: data.speed }];
              return newData.slice(-100);
            });
            break;
          case 'end':
            setIsLive(false);
            setSnackbar({ open: true, message: 'Real-time data ended and history saved', severity: 'info' });
            wsRef.current.send(JSON.stringify({ type: 'list_histories' }));
            break;
          case 'load':
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
            break;
          case 'history_list':
            setHistoryList(message.payload);
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to WebSocket server');
        setSnackbar({ open: true, message: 'Failed to connect to WebSocket server', severity: 'error' });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setSnackbar({ open: true, message: 'WebSocket connection closed', severity: 'info' });
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const loadHistory = (tripId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'load', tripId: tripId }));
    } else {
      setSnackbar({ open: true, message: 'WebSocket is not connected', severity: 'error' });
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

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ maxWidth: '1200px', margin: 'auto', width: '100%', minWidth: '320px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '400px' }}>
            {offsetData.length > 0 && (
              <Line 
                data={createChartData(offsetData, 'Average Offset', 'rgb(75, 192, 192)')} 
                options={options('Real-time Average Offset', 'Offset')}
              />
            )}
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '400px' }}>
            {speedData.length > 0 && (
              <Line 
                data={createChartData(speedData, 'Speed', 'rgb(255, 99, 132)')} 
                options={options('Real-time Speed', 'Speed (km/h)')}
              />
            )}
          </div>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleZoom('in')}
        >
          Zoom In
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleZoom('out')}
        >
          Zoom Out
        </Button>
        {!isLive && (
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Select History</InputLabel>
            <Select
              value={selectedHistory}
              onChange={handleHistoryChange}
              label="Select History"
            >
              {historyList.map((tripId) => (
                <MenuItem key={tripId} value={tripId}>
                  {tripId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      {!isLive && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
          Real-time data ended. You can now select a history to view.
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

export default WebSocketCharts;