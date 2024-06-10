/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from "./MapManagement.module.css";
import axios from 'axios';
import MapCreator from './MapCreator';
import MapViewer from '../DisplayMapVehicle/MapViewer';

const MapManagement = () => {
  const [maps, setMaps] = useState([]);

  const fetchMaps = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maps');
      setMaps(response.data);
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

  return (
    <div className={styles.MapManagement}>
      <div className={styles.mapAdministrater}>
        <MapViewer maps={maps} onDeleteMap={handleDeleteMap} />
        <div className={styles.mapDisplay}></div>
      </div>
      <div className={styles.mapCreator}>
        <MapCreator addNewMap={addNewMap} />
      </div>
    </div>
  );
};

MapManagement.propTypes = {};

export default MapManagement;