/* eslint-disable no-unused-vars */
// MapViewer.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MapViewer = ({ maps, onDeleteMap, onMapSelect }) => {
  const [selectedMapIndex, setSelectedMapIndex] = useState(-1);

  useEffect(() => {
    if (selectedMapIndex !== -1 && selectedMapIndex >= maps.length) {
      setSelectedMapIndex(-1);
    }
  }, [maps, selectedMapIndex]);

  useEffect(() => {
    onMapSelect(selectedMapIndex); // Fetch and display the map JSON data based on the selected index
  }, [selectedMapIndex, onMapSelect]);

  const handleSelectMap = (event) => {
    const index = Number(event.target.value);
    setSelectedMapIndex(index);
  };

  const handleDeleteMap = async (id) => {
    try {
      await onDeleteMap(id);
      setSelectedMapIndex(-1);
      console.log(`Map with id ${id} deleted from MapViewer`);
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const selectedMap = selectedMapIndex !== -1 ? maps[selectedMapIndex] : null;

  return (
    <div>
      <select onChange={handleSelectMap} value={selectedMapIndex !== -1 ? selectedMapIndex : ''}>
        <option value="-1">No selected map</option>
        {maps.map((map, index) => (
          <option key={index} value={index}>Map {index + 1}</option>
        ))}
      </select>
      {selectedMap && selectedMap.data && (
        <div>
          <button onClick={() => handleDeleteMap(selectedMap.id)}>Delete Map</button>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedMap.data.gridSize}, 20px)` }}>
            {Array.from({ length: selectedMap.data.gridSize * selectedMap.data.gridSize }).map((_, idx) => {
              const row = Math.floor(idx / selectedMap.data.gridSize);
              const col = idx % selectedMap.data.gridSize;
              const isPoint = selectedMap.data.points.some(point => point.row === row && point.col === col);
              const isInterest = selectedMap.data.pointsOfInterest.some(point => point.row === row && point.col === col);
              return (
                <div
                  key={idx}
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
        </div>
      )}
    </div>
  );
};

MapViewer.propTypes = {
  maps: PropTypes.array.isRequired,
  onDeleteMap: PropTypes.func.isRequired,
  onMapSelect: PropTypes.func.isRequired,
};

export default MapViewer;
