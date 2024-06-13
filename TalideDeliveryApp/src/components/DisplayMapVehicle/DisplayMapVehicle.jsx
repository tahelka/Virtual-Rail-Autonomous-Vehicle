/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./DisplayMapVehicle.module.css";
import DisplayControlButtons from "../DisplayControlButtons";
import DrawMapFromJson from './DrawMapFromJson';

function DisplayMapVehicle() {
  const [maps, setMaps] = useState([]);
  const [selectedMapJson, setSelectedMapJson] = useState(null);

  const fetchMaps = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maps');
      const sortedMaps = response.data.sort((a, b) => new Date(a.creation_time) - new Date(b.creation_time));
      setMaps(sortedMaps);
    } catch (error) {
      console.error('Error fetching maps:', error);
    }
  };

  const fetchMapJsonByIndex = async (index) => {
    try {
      if (index === -1) {
        setSelectedMapJson(null);
        return;
      }
      const mapId = maps[index].id;
      const jsonUrl = `http://localhost:5000/download/map_${mapId}.json`;
      const jsonResp = await axios.get(jsonUrl);
      setSelectedMapJson(JSON.stringify(jsonResp.data));
    } catch (error) {
      console.error('Error fetching map JSON:', error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return (
    <div>
      <div className={styles.displayContainer}>
        <div className={styles.map}>
          {selectedMapJson ? (
            <DrawMapFromJson jsonData={selectedMapJson} />
          ) : (
            <p>No map selected</p>
          )}
        </div>
        <div className={styles.detailsAndControl}>
          <DisplayControlButtons
            maps={maps}
            fetchMapJsonByIndex={fetchMapJsonByIndex}
            setSelectedMapJson={setSelectedMapJson}
          />
        </div>
      </div>
      <div className={styles.MapManagement}></div>
    </div>
  );
}

export default DisplayMapVehicle;
