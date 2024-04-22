/* eslint-disable no-unused-vars */
import styles from "./DisplayControlButtons.module.css";
import DisplayDropDownButton from "./DisplayDropDownButton/DisplayDropDownButton";
import DropDownButtonItem from "./DisplayDropDownButton/DropDownButtonItem";
import StyledButton from "./StyledButton";
function clickMe(){
    alert('YAY!');
}

const itemsForDropDownMenu = [1,2,3,4,5,6, 7, 8, 9, 10];

function DisplayControlButtons() {
  return (
    <div className={styles.displayControlButtons}>
       
      <DisplayDropDownButton
        buttonText = "CHOOSE MAP"
        content = {<>
        {
          itemsForDropDownMenu.map(item =>
          <DropDownButtonItem key = {item}>
            {`Item ${item}`}
          </DropDownButtonItem>)
        } 
        </>}         
      />

      <DisplayDropDownButton
        buttonText = "CHOOSE CAR"
        content = {<>
        {
          itemsForDropDownMenu.map(item =>
          <DropDownButtonItem key = {item}>
            {`Item ${item}`}
          </DropDownButtonItem>)
        } 
        </>}         
      />

      <StyledButton onClick={clickMe}>
      MAPS & CARS STAT
      </StyledButton>

      <div className={styles.buttonCarControlContainer}>
      <StyledButton>STARTING POINT</StyledButton>
      <StyledButton>DESTINATION</StyledButton>
      <StyledButton>STARTING ORIENTATION</StyledButton>
      <StyledButton bold>START</StyledButton> {/* Bold button */}
      </div> 

    </div>
  );
}

export default DisplayControlButtons;
