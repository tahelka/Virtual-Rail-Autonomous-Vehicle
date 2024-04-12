/* eslint-disable no-unused-vars */
import styles from "./DisplayControlButtons.module.css";
import DisplayDropDownButton from "./DisplayDropDownButton/DisplayDropDownButton";
import DropDownButtonItem from "./DisplayDropDownButton/DropDownButtonItem";
function clickMe(){
    alert('YAY!');
}

const itemsForDropDownMenu = [1,2,3,4,5,6];

function DisplayControlButtons() {
  return (
    <div className={styles.displayControlButtons}>
      <button className={`${styles.button} ${styles.buttonText}`} onClick={clickMe}>
      Simple Button
      </button>
      
      <DisplayDropDownButton
        buttonText = "Drop Down Menu"
        content = {<>
        {
          itemsForDropDownMenu.map(item =>
          <DropDownButtonItem key = {item}>
            {`Item ${item}`}
          </DropDownButtonItem>)
        } 
        </>} 
      />
    </div>
  );
}

export default DisplayControlButtons;
