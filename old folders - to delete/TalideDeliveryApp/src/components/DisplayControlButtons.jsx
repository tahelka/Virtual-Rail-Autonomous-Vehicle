/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styles from "./DisplayControlButtons.module.css";
import DisplayDropDownButton from "./DisplayDropDownButton/DisplayDropDownButton";
import DropDownButtonItem from "./DisplayDropDownButton/DropDownButtonItem";
import StyledButton from "./StyledButton";

const directions = ["NORTH", "SOUTH", "EAST", "WEST"];

function DisplayControlButtons({ maps, fetchMapJsonByIndex, setSelectedMapJson, selectedMap, setSelectedMap, toggleChoosingStartingPoint, 
  toggleChoosingDestinationPoint, buttonText, setButtonText, destinationButtonText, setDestinationButtonText, 
  isChoosingStartingPoint, isChoosingDestinationPoint, selectedOrientation, setSelectedOrientation }) {
  const [selectedCar, setSelectedCar] = useState('CHOOSE CAR');
  const [selectedMapId, setSelectedMapId] = useState(null);

  const updateChosenMapImageAndName = (index) => {
    const map = maps[index - 1]; // Adjusted index to fetch the correct map
    setSelectedMap(`Map ${index}`);
    setSelectedMapId(map.id); 
    fetchMapJsonByIndex(index - 1);
  };

  const updateChosenCarAndName = (item) => {
    setSelectedCar(`Car ${item}`);
  };

  const updateChosenStartingOrientation = (item) => {
    setSelectedOrientation(item);
  };

  const handleToggleChoosingStartingPoint = () => {
    if (selectedMap === 'CHOOSE A MAP') {
      alert('Please choose a map first');
      return;
    }
    toggleChoosingStartingPoint();
  };

  const handleToggleChoosingDestinationPoint = () => {
    if (selectedMap === 'CHOOSE A MAP') {
      alert('Please choose a map first');
      return;
    }
    toggleChoosingDestinationPoint();
  };

  const handleOrientationClick = () => {
    if (selectedMap === 'CHOOSE A MAP') {
      alert('Please choose a map first');
      return false;
    }
    return true; // Indicate that the dropdown should open
  };

  const handleStartClick = async () => {
    if (buttonText === 'CHOOSE STARTING POINT' || destinationButtonText === 'CHOOSE DESTINATION POINT' || selectedOrientation === 'STARTING ORIENTATION') {
      alert('Please select all values: Starting Point, Destination Point, and Orientation.');
      return;
    }

    try {
      const selectedMapData = maps.find(map => map.id === selectedMapId); 
      if (!selectedMapData) {
        alert('Selected map data not found.');
        return;
      }

      const graphData = selectedMapData.data; 

      const response = await axios.post(`http://localhost:5000/graph?start=${buttonText}&target=${destinationButtonText}`, graphData);

      if (response.status === 200) {
        alert('Request sent successfully!');
        console.log(response.data);
      } else {
        alert('Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Error sending request. Please check the console for details.');
    }
  };

  return (
    <div className={styles.displayControlButtons}>
      <DisplayDropDownButton
        buttonText={selectedMap}
        content={
          <>
            {maps.map((item, index) => (
              <DropDownButtonItem
                key={item.id}
                onClick={() => {
                  updateChosenMapImageAndName(index + 1); // Use index+1 to match the map ID
                  console.log(`Map ${index + 1} chosen`);
                }}
              >
                {`Map ${index + 1}`}
              </DropDownButtonItem>
            ))}
          </>
        }
      />

      <DisplayDropDownButton
        buttonText={selectedCar}
        content={
          <>
            {Array(1)
              .fill()
              .map((_, index) => (
                <DropDownButtonItem key={index} onClick={() => updateChosenCarAndName(index + 1)}>
                  {`Car ${index + 1}`}
                </DropDownButtonItem>
              ))}
          </>
        }
      />

      <div className={styles.buttonCarControlContainer}>
        <StyledButton
          onClick={handleToggleChoosingStartingPoint}
          className={`${isChoosingStartingPoint ? styles.pressedButton : ''}`}
        >
          CHOOSE STARTING POINT
        </StyledButton>
        <StyledButton
          onClick={handleToggleChoosingDestinationPoint}
          className={`${isChoosingDestinationPoint ? styles.pressedButton : ''}`}
        >
          CHOOSE DESTINATION POINT
        </StyledButton>

        <DisplayDropDownButton
          buttonText={selectedOrientation}
          content={
            <>
              {directions.map((item) => (
                <DropDownButtonItem key={item} onClick={() => updateChosenStartingOrientation(item)}>
                  {`${item}`}
                </DropDownButtonItem>
              ))}
            </>
          }
          onClick={handleOrientationClick}
        />

        <div className={styles.textBox}>
          <p>Starting Point: {buttonText !== 'CHOOSE STARTING POINT' ? buttonText : ''}</p>
          <p>Destination Point: {destinationButtonText !== 'CHOOSE DESTINATION POINT' ? destinationButtonText : ''}</p>
          <p>Orientation: {selectedOrientation !== 'STARTING ORIENTATION' ? selectedOrientation : ''}</p>
        </div>

        <StyledButton bold onClick={handleStartClick}>START</StyledButton>
      </div>
    </div>
  );
}

DisplayControlButtons.propTypes = {
  maps: PropTypes.array.isRequired,
  fetchMapJsonByIndex: PropTypes.func.isRequired,
  setSelectedMapJson: PropTypes.func.isRequired,
  selectedMap: PropTypes.string.isRequired,
  setSelectedMap: PropTypes.func.isRequired,
  toggleChoosingStartingPoint: PropTypes.func.isRequired,
  toggleChoosingDestinationPoint: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  destinationButtonText: PropTypes.string.isRequired,
  setButtonText: PropTypes.func.isRequired,
  setDestinationButtonText: PropTypes.func.isRequired,
  isChoosingStartingPoint: PropTypes.bool.isRequired,
  isChoosingDestinationPoint: PropTypes.bool.isRequired,
  selectedOrientation: PropTypes.string.isRequired,
  setSelectedOrientation: PropTypes.func.isRequired,
};

export default DisplayControlButtons;