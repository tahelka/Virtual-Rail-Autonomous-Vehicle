import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OffsetChart = ({ data, viewWindow = 6 }) => { // Default to 6
  const createChartData = (data) => {
    // Prepend a zero value to the data for the initial point
    const extendedData = [{ time: 'Start', value: 0 }, ...data.slice(-viewWindow)];

    return {
      labels: extendedData.map(d => d.time),
      datasets: [
        {
          label: 'Average Offset',
          data: extendedData.map(d => d.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      ]
    };
  };

  const options = {
    responsive: false, // Disable responsive resizing
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Real-time Average Offset', font: { size: 16 } },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time' },
        ticks: { maxTicksLimit: viewWindow }, // Limit the number of ticks
      },
      y: {
        title: { display: true, text: 'Offset' },
        suggestedMin: 0,
        suggestedMax: 5,
      }
    },
    animation: { duration: 0 },
    elements: { line: { borderWidth: 2 } },
  };

  return (
    <Box sx={{ height: '400px', width: '500px' }}> {/* Set fixed dimensions */}
      <Line 
        data={createChartData(data)} 
        options={options} 
        width={500} // Set canvas width
        height={400} // Set canvas height
      />
    </Box>
  );
};

export default OffsetChart;
