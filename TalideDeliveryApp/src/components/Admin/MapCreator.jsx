/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DrawMap from './DrawMap';
import './RoadMap.css';

const MapCreator = ({ addNewMap }) => {
  const [gridSize, setGridSize] = useState(0);
  const [mapGridSize, setMapGridSize] = useState(null);
  const [error, setError] = useState(null);

  const handleGridSizeChange = (event) => {
    setGridSize(Number(event.target.value));
  };

  const handleSetGridSize = () => {
    setMapGridSize(gridSize);
  };

  const handleSaveMap = (graph) => {
    try {
      const json = JSON.stringify(graph, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'map.json';
      link.click();
      URL.revokeObjectURL(url);
      addNewMap(graph);
      setMapGridSize(null);
      setError(null);
    } catch (error) {
      console.error('Error saving map:', error);
      setError('Failed to save map');
    }
  };

  return (
    <div>
      {mapGridSize === null ? (
        <div>
          <label>
            Grid Size:
            <input type="number" value={gridSize} onChange={handleGridSizeChange} />
          </label>
          <button onClick={handleSetGridSize} className = 'choiceButton'>Set Grid Size</button>
        </div>
      ) : (
        <DrawMap size={mapGridSize} onSave={handleSaveMap} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

MapCreator.propTypes = {
  addNewMap: PropTypes.func.isRequired,
};

export default MapCreator;