import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const ArrivedDestinationChart = ({ numbersOfTripsArrived, totalTrips }) => {
  const data = {
    labels: ['Arrived', 'Not Arrived'],
    datasets: [
      {
        label: '# of Trips',
        data: [numbersOfTripsArrived, totalTrips - numbersOfTripsArrived],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const value = tooltipItem.raw;
            const total = numbersOfTripsArrived + (totalTrips - numbersOfTripsArrived);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${percentage}% (${value} trips)`;
          },
        },
      },
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Box sx={{ height: '400px', width: '400px', margin: '0 auto' }}>
        <Doughnut data={data} options={options} />
      </Box>
    </Box>
  );
};

export default ArrivedDestinationChart;