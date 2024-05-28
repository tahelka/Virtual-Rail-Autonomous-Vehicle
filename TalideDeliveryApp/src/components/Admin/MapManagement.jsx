/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from "./MapManagement.module.css";
import StyledButton from "../StyledButton";
import axios from 'axios';
import MapCreator from './MapCreator';
import MapViewer from '../DisplayMapVehicle/MapViewer';

const MapManagement = () => {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/maps');
        setMaps(response.data);
      } catch (error) {
        console.error('Error fetching maps:', error);
      }
    };
    fetchMaps();
  }, []);

  const addNewMap = (newMap) => {
    setMaps([...maps, newMap]);
  };

  const handleDeleteMap = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/maps/${id}`);
      setMaps(maps.filter(map => map.id !== id));
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  return (
    <div className={styles.MapManagement}>
      <div className={styles.mapAdministrater}>
        <h1>Map Name</h1>
        <div className={styles.mapDisplay}>
          <MapViewer maps={maps} onDeleteMap={handleDeleteMap} />
        </div>
      </div>
      <div className={styles.existingMaps}>
        <h1 style={{ color: 'rgb(160, 198, 227)', textAlign: 'center', textShadow: '2px 2px 2px black' }}>Maps</h1>
        <MapCreator addNewMap={addNewMap} />
      </div>
    </div>
  );
};

MapManagement.propTypes = {};

export default MapManagement;
