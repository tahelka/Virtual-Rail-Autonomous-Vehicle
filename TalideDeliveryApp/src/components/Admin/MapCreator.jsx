/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DrawMap from './DrawMap';
import axios from 'axios';
import './RoadMap.module.css';


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

  const handleSaveMap = async (graph) => {
    try {
      const mapData = JSON.stringify(graph, null, 2); // 2 spaces for indentation
      const response = await axios.post('http://localhost:5000/api/maps/save', { mapData });
      addNewMap(response.data);
      setMapGridSize(null);
      setError(null);
    } catch (error) {
      console.error('Error saving map:', error);
      setError('Failed to save map');
    }
  };
  

  /*
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
  */

  const handleCancel = () => {
    setMapGridSize(null);
    setError(null);
  };

  return (
    <div>
      {mapGridSize === null ? (
        <div>
          <label>
            Grid Size:
            <input type="number" value={gridSize} onChange={handleGridSizeChange} />
          </label>
          <button onClick={handleSetGridSize} className='choiceButton'>Set Grid Size</button>
        </div>
      ) : (
        <DrawMap size={mapGridSize} onSave={handleSaveMap} onCancel={handleCancel} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

MapCreator.propTypes = {
  addNewMap: PropTypes.func.isRequired,
};

export default MapCreator;
