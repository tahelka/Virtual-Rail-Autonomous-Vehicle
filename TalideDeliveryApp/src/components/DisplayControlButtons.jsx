/* eslint-disable no-unused-vars */
import styles from "./DisplayControlButtons.module.css";
import DisplayDropDownButton from "./DisplayDropDownButton/DisplayDropDownButton";
import DropDownButtonItem from "./DisplayDropDownButton/DropDownButtonItem";
import StyledButton from "./StyledButton";
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const directions = ["NORTH", "SOUTH", "EAST", "WEST"];

function DisplayControlButtons({ maps, fetchMapJsonByIndex, setSelectedMapJson }) {
  const [selectedMap, setSelectedMap] = useState('CHOOSE MAP');
  const [selectedCar, setSelectedCar] = useState('CHOOSE CAR');
  const [selectedStartingOrientation, setSelectedStartingOrientation] = useState('STARTING ORIENTATION');
  const [selectedMapJson, setSelectedMapJsonState] = useState(null);

  const clickMe = () => {
    alert('YAY!');
    console.log(`clicked!`);
  };

  const updateChosenMapImageAndName = (item) => {
    setSelectedMap(`Map ${item}`);
    fetchMapJsonByIndex(item - 1); // Adjusted index to fetch the correct map JSON
    setSelectedMapJsonState(maps[item - 1].jsonData); // Adjusted to set JSON data
  };

  const updateChosenCarAndName = (item) => {
    setSelectedCar(`Car ${item}`);
  };

  const updateChosenStartingOrientation = (item) => {
    setSelectedStartingOrientation(`${item}`);
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

      <StyledButton onClick={clickMe}>MAPS & CARS STAT</StyledButton>

      <div className={styles.buttonCarControlContainer}>
        <StyledButton>CHOOSE STARTING POINT</StyledButton>
        <StyledButton>CHOOSE DESTINATION</StyledButton>
        <DisplayDropDownButton
          buttonText={selectedStartingOrientation}
          content={
            <>
              {directions.map((item) => (
                <DropDownButtonItem key={item} onClick={() => updateChosenStartingOrientation(item)}>
                  {`${item}`}
                </DropDownButtonItem>
              ))}
            </>
          }
        />
        <StyledButton bold>START</StyledButton> {/* Bold button */}
      </div>
    </div>
  );
}

DisplayControlButtons.propTypes = {
  maps: PropTypes.array.isRequired,
  fetchMapJsonByIndex: PropTypes.func.isRequired,
  setSelectedMapJson: PropTypes.func.isRequired,
};

export default DisplayControlButtons;
