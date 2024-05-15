/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const DrawMap = ({ gridSize, onSave }) => {
  const [points, setPoints] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [mode, setMode] = useState('point');

  const handleClick = (row, col) => {
    const newPoint = { row, col };
    if (mode === 'point') {
      setPoints([...points, newPoint]);
    } else if (mode === 'interest' && points.some(point => point.row === row && point.col === col)) {
      setPointsOfInterest([...pointsOfInterest, newPoint]);
    }
  };

  const handleSave = () => {
    onSave(points, pointsOfInterest);
    setPoints([]);
    setPointsOfInterest([]);
  };

  const handleClear = () => {
    setPoints([]);
    setPointsOfInterest([]);
  };

  const handleDeletePoint = (row, col) => {
    setPoints(points.filter(point => point.row !== row || point.col !== col));
    setPointsOfInterest(pointsOfInterest.filter(point => point.row !== row || point.col !== col));
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 20px)` }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const isPoint = points.some(point => point.row === row && point.col === col);
          const isInterest = pointsOfInterest.some(point => point.row === row && point.col === col);
          return (
            <div
              key={index}
              onClick={() => handleClick(row, col)}
              onContextMenu={(e) => { e.preventDefault(); handleDeletePoint(row, col); }}
              style={{
                width: 20,
                height: 20,
                border: '1px solid black',
                backgroundColor: isInterest ? 'blue' : isPoint ? 'black' : 'white'
              }}
            />
          );
        })}
      </div>
      <button onClick={() => setMode('point')}>Map Point</button>
      <button onClick={() => setMode('interest')}>Point of Interest</button>
      <button onClick={handleClear}>Clear</button>
      <button onClick={handleSave}>Save Map</button>
    </div>
  );
};

DrawMap.propTypes = {
    gridSize: PropTypes.node.isRequired,
    onSave: PropTypes.node.isRequired,
  };


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

  const handleSaveMap = async (points, pointsOfInterest) => {
    try {
      const newMap = { gridSize: mapGridSize, points, pointsOfInterest };
      const response = await axios.post('http://localhost:3001/api/maps', newMap);
      addNewMap(response.data);
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
          <button onClick={handleSetGridSize}>Set Grid Size</button>
        </div>
      ) : (
        <DrawMap gridSize={mapGridSize} onSave={handleSaveMap} />
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};


MapCreator.propTypes = {
    addNewMap: PropTypes.node.isRequired,
  };

export default MapCreator;
