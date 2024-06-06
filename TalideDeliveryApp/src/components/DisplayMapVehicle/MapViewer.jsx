/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const MapViewer = ({ maps, onDeleteMap }) => {
  const [selectedMapIndex, setSelectedMapIndex] = useState(null);
  const [mapsFiles, setMaps] = useState([]);

  useEffect(() => {
    if (selectedMapIndex !== null && selectedMapIndex >= maps.length) {
      setSelectedMapIndex(null);
    }
  }, [maps, selectedMapIndex]);

  const handleSelectMap = (event) => {
    setSelectedMapIndex(Number(event.target.value));
  };

  const handleDeleteMap = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/maps/delete/${id}`);
      setMaps(mapsFiles.filter(map => map.id !== id));
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const API_ENDPOINTS = {
    SAVE_MAP: 'http://localhost:5000/api/maps/save',
    DELETE_MAP: 'http://localhost:5000/api/maps/delete',
  };

  /*
  const handleDeleteMap = async (id) => {
    try {
      await onDeleteMap(id);
      setSelectedMapIndex(null);
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };
  */

  return (
    <div>
      <select onChange={handleSelectMap} value={selectedMapIndex !== null ? selectedMapIndex : ''}>
        <option value="" disabled>Select a map</option>
        {maps.map((map, index) => (
          <option key={index} value={index}>Map {index + 1}</option>
        ))}
      </select>
      {selectedMapIndex !== null && maps[selectedMapIndex] && (
        <div>
          {/*<h3>Map {selectedMapIndex + 1}</h3>*/}
          <button onClick={() => handleDeleteMap(maps[selectedMapIndex].id)}>Delete Map</button>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maps[selectedMapIndex].gridSize}, 20px)` }}>
            {Array.from({ length: maps[selectedMapIndex].gridSize * maps[selectedMapIndex].gridSize }).map((_, idx) => {
              const row = Math.floor(idx / maps[selectedMapIndex].gridSize);
              const col = idx % maps[selectedMapIndex].gridSize;
              const isPoint = maps[selectedMapIndex].points.some(point => point.row === row && point.col === col);
              const isInterest = maps[selectedMapIndex].pointsOfInterest.some(point => point.row === row && point.col === col);
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
  maps: PropTypes.node.isRequired,
  onDeleteMap: PropTypes.node.isRequired,
};

export default MapViewer;
