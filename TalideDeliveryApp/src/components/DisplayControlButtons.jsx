/* eslint-disable no-unused-vars */
import styles from "./DisplayControlButtons.module.css";
import DisplayDropDownButton from "./DisplayDropDownButton/DisplayDropDownButton";
import DropDownButtonItem from "./DisplayDropDownButton/DropDownButtonItem";
import StyledButton from "./StyledButton";
import PropTypes from 'prop-types';
import { useState } from 'react';



function clickMe(){
    alert('YAY!');
    console.log(`clicked!`);
}

const maps = [1,2,3,4];
const cars = [1];
const directions = ["NORTH", "SOUTH", "EAST", "WEST"];

function DisplayControlButtons({changeMapImage}) {
  const [selectedMap, setSelectedMap] = useState('CHOOSE MAP');
  const [selectedCar, setSelectedCar] = useState('CHOOSE CAR');
  const [selectedStartingOrientation, setSelectedStartingOrientation] = useState('STARTING ORIENTATION');

  const updateChosenMapImageAndName= (item) => {
    changeMapImage(item)
    setSelectedMap(`Map ${item}`);
  }

  const updateChosenCarAndName= (item) => {
    setSelectedCar(`Car ${item}`);
  }

  const updateChosenStartingOrientation= (item) => {
    setSelectedStartingOrientation(`${item}`);
  }

  return (
    <div className={styles.displayControlButtons}>
       
      <DisplayDropDownButton
        buttonText = {selectedMap}
        content = {<>
        {
          maps.map(item =>
          <DropDownButtonItem 
          key={item}
          onClick={() => {
            updateChosenMapImageAndName(item);
            console.log(`Map ${item} chosen`);
          }}>
    
            {`Map ${item}`}
          </DropDownButtonItem>)
  
        }
        </>}         
      />

      <DisplayDropDownButton
        buttonText = {selectedCar}
        content = {<>
        {
          cars.map(item =>
          <DropDownButtonItem 
          key = {item}
          onClick={() => updateChosenCarAndName(item)}>
            {`Car ${item}`}
          </DropDownButtonItem>)
        } 
        </>}         
      />

      <StyledButton onClick={clickMe}>
      MAPS & CARS STAT
      </StyledButton>

      <div className={styles.buttonCarControlContainer}>
      <StyledButton>CHOOSE STARTING POINT</StyledButton>
      <StyledButton>CHOOSE DESTINATION</StyledButton>
      <DisplayDropDownButton
        buttonText = {selectedStartingOrientation}
        content = {<>
        {
          directions.map(item =>
          <DropDownButtonItem 
          key = {item}
          onClick={() => updateChosenStartingOrientation(item)}>
            {`${item}`}
          </DropDownButtonItem>)
        } 
        </>}         
      />
      <StyledButton bold>START</StyledButton> {/* Bold button */}
      </div> 

    </div>
  );
}

DisplayControlButtons.propTypes = {
  changeMapImage: PropTypes.func,
};

export default DisplayControlButtons;
