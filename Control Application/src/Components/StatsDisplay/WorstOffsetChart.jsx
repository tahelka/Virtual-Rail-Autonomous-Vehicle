import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Button } from '@mui/material';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

const WorstOffsetChart = () => {
  const [worstOffsets, setWorstOffsets] = useState([]);
  const [viewWindow, setViewWindow] = useState(10); // Default to showing 10 trips at a time

  useEffect(() => {
    // Listen for the 'arrived_at_destination' event to get the worst offset of each trip
    socket.on('arrived_at_destination', (data) => {
      const { trip_id, worst_offset } = data;
      setWorstOffsets((prevOffsets) => [
        ...prevOffsets,
        { trip_id, worst_offset }
      ]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('arrived_at_destination');
    };
  }, []);

  // Create chart data
  const createChartData = () => {
    const visibleData = worstOffsets.slice(-viewWindow); // Show only the last `viewWindow` number of trips
    return {
      labels: visibleData.map(offset => offset.trip_id),
      datasets: [
        {
          label: 'Worst Offset',
          data: visibleData.map(offset => offset.worst_offset),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      ]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Worst Offset per Trip', font: { size: 16 } },
    },
    scales: {
      x: {
        title: { display: true, text: 'Trip ID' },
      },
      y: {
        title: { display: true, text: 'Worst Offset' },
        suggestedMin: 0,
      }
    },
    animation: { duration: 0 },
    elements: { line: { borderWidth: 2 } },
  };

  const handleZoom = (direction) => {
    setViewWindow(prev => {
      if (direction === 'in') return Math.max(5, prev - 5);
      if (direction === 'out') return Math.min(worstOffsets.length, prev + 5);
      return prev;
    });
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Box sx={{ height: '400px', width: '800px', margin: '0 auto' }}>
        <Line data={createChartData()} options={options} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleZoom('in')}>
          Zoom In
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleZoom('out')}>
          Zoom Out
        </Button>
      </Box>
    </Box>
  );
};

export default WorstOffsetChart;
