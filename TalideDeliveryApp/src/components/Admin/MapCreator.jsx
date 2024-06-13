/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DrawMap from './DrawMap';
import axios from 'axios';
import './RoadMap.module.css';

const MapCreator = ({ addNewMap, onCancel, gridSize }) => {
  const [mapGridSize, setMapGridSize] = useState(gridSize);
  const [error, setError] = useState(null);

  const handleSaveMap = async (graph) => {
    try {
      const mapData = JSON.stringify(graph, null, 2); // 2 spaces for indentation
      const response = await axios.post('http://localhost:5000/api/maps/save', { mapData });
      addNewMap({ ...graph, id: response.data.id });
      setError(null);
    } catch (error) {
      console.error('Error saving map:', error);
      setError('Failed to save map');
    }
  };

  const handleCancel = () => {
    setError(null);
    onCancel(); // Switch to view mode on cancel
  };

  return (
    <div>
      <DrawMap size={mapGridSize} onSave={handleSaveMap} onCancel={handleCancel} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

MapCreator.propTypes = {
  addNewMap: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  gridSize: PropTypes.number.isRequired,
};

export default MapCreator;