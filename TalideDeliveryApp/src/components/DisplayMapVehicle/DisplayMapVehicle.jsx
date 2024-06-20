/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./DisplayMapVehicle.module.css";
import DisplayControlButtons from "../DisplayControlButtons";
import DrawMapFromJson from './DrawMapFromJson';
import PropTypes from 'prop-types';

function DisplayMapVehicle({ maps, fetchMaps }) {
  const [selectedMapJson, setSelectedMapJson] = useState(null);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [selectedMap, setSelectedMap] = useState('CHOOSE A MAP');
  const [userMode, setUserMode] = useState(true);
  const [buttonText, setButtonText] = useState('CHOOSE STARTING POINT');
  const [destinationButtonText, setDestinationButtonText] = useState('CHOOSE DESTINATION POINT');
  const [isChoosingStartingPoint, setIsChoosingStartingPoint] = useState(false);
  const [isChoosingDestinationPoint, setIsChoosingDestinationPoint] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState('STARTING ORIENTATION');

  const fetchMapJsonByIndex = async (index) => {
    try {
      if (index === -1) {
        setSelectedMapJson(null);
        setSelectedMapId(null);
        setSelectedMap('CHOOSE A MAP');
        resetSelections();
        return;
      }
      const mapId = maps[index].id;
      const jsonUrl = `http://localhost:5000/download/map_${mapId}.json`;
      const jsonResp = await axios.get(jsonUrl);
      setSelectedMapJson(JSON.stringify(jsonResp.data));
      setSelectedMapId(mapId);
      setSelectedMap(`Map ${index + 1}`);
    } catch (error) {
      console.error('Error fetching map JSON:', error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  useEffect(() => {
    if (!maps.find(map => map.id === selectedMapId)) {
      setSelectedMapJson(null);
      setSelectedMapId(null);
      setSelectedMap('CHOOSE A MAP');
      resetSelections();
    }
  }, [maps]);

  const resetSelections = () => {
    setButtonText('CHOOSE STARTING POINT');
    setDestinationButtonText('CHOOSE DESTINATION POINT');
    setSelectedOrientation('STARTING ORIENTATION');
  };

  const toggleChoosingStartingPoint = () => {
    setIsChoosingStartingPoint(prev => !prev);
    if (isChoosingDestinationPoint) {
      setIsChoosingDestinationPoint(false);
    }
  };

  const toggleChoosingDestinationPoint = () => {
    setIsChoosingDestinationPoint(prev => !prev);
    if (isChoosingStartingPoint) {
      setIsChoosingStartingPoint(false);
    }
  };

  return (
    <div>
      <div className={styles.displayContainer}>
        <div className={styles.map}>
          {selectedMapJson ? (
            <DrawMapFromJson
              jsonData={selectedMapJson}
              userMode={userMode}
              isChoosingStartingPoint={isChoosingStartingPoint}
              isChoosingDestinationPoint={isChoosingDestinationPoint}
              setButtonText={setButtonText}
              setDestinationButtonText={setDestinationButtonText}
              setIsChoosingStartingPoint={setIsChoosingStartingPoint}
              setIsChoosingDestinationPoint={setIsChoosingDestinationPoint}
            />
          ) : (
            <p>No map selected</p>
          )}
        </div>
        <div className={styles.detailsAndControl}>
          <DisplayControlButtons
            maps={maps}
            fetchMapJsonByIndex={fetchMapJsonByIndex}
            setSelectedMapJson={setSelectedMapJson}
            selectedMap={selectedMap}
            setSelectedMap={setSelectedMap}
            toggleChoosingStartingPoint={toggleChoosingStartingPoint}
            toggleChoosingDestinationPoint={toggleChoosingDestinationPoint}
            buttonText={buttonText}
            destinationButtonText={destinationButtonText}
            setButtonText={setButtonText}
            setDestinationButtonText={setDestinationButtonText}
            isChoosingStartingPoint={isChoosingStartingPoint}
            isChoosingDestinationPoint={isChoosingDestinationPoint}
            selectedOrientation={selectedOrientation}
            setSelectedOrientation={setSelectedOrientation}
          />
        </div>
      </div>
      <div className={styles.MapManagement}></div>
    </div>
  );
}

DisplayMapVehicle.propTypes = {
  maps: PropTypes.array.isRequired,
  fetchMaps: PropTypes.func.isRequired,
};

export default DisplayMapVehicle;