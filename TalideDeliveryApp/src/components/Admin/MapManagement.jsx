/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from "./MapManagement.module.css";
import axios from 'axios';
import MapCreator from './MapCreator';
import MapViewer from '../DisplayMapVehicle/MapViewer';
import DrawMapFromJson from '../DisplayMapVehicle/DrawMapFromJson';

const MapManagement = () => {
  const [maps, setMaps] = useState([]);
  const [selectedMapJson, setSelectedMapJson] = useState(null);
  const [mode, setMode] = useState('view'); // 'view' or 'create'
  const [gridSize, setGridSize] = useState(0);

  const fetchMaps = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maps');
      setMaps(response.data);
      if (response.data.length > 0) {
        const firstMapId = response.data[0].id; // Assuming each map object has an 'id' property
        const jsonUrl = `http://localhost:5000/download/map_${firstMapId}.json`; // Construct the URL to download the JSON file
        const jsonResp = await axios.get(jsonUrl);
        setSelectedMapJson(JSON.stringify(jsonResp.data)); // Set the first map's JSON data by default
      }
    } catch (error) {
      console.error('Error fetching maps:', error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const addNewMap = (newMap) => {
    setMaps([...maps, newMap]);
    fetchMaps();
    setMode('view'); // Switch to view mode after adding a new map
  };

  const handleDeleteMap = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/maps/delete/${id}`);
      await fetchMaps(); // Re-fetch maps to update the state
      console.log(`Map with id ${id} deleted`);
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleSetGridSize = () => {
    setMode('create');
  };

  const handleGridSizeChange = (event) => {
    setGridSize(Number(event.target.value));
  };

  return (
    <div className={styles.MapManagement}>
      {mode === 'view' ? (
        <div className={styles.mapAdministrater}>
          <MapViewer maps={maps} onDeleteMap={handleDeleteMap} />
          <div className={styles.mapDisplay}>
            {selectedMapJson ? (
              <DrawMapFromJson jsonData={selectedMapJson} />
            ) : (
              <p>No map selected</p>
            )}
          </div>
          <label>
            Grid Size:
            <input type="number" value={gridSize} onChange={handleGridSizeChange} />
          </label>
          <button onClick={handleSetGridSize} className='choiceButton'>Set Grid Size</button>
        </div>
      ) : (
        <div className={styles.mapCreator}>
          <MapCreator addNewMap={addNewMap} onCancel={() => setMode('view')} gridSize={gridSize} />
        </div>
      )}
    </div>
  );
};

MapManagement.propTypes = {};

export default MapManagement;