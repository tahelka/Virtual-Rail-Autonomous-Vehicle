import styles from "./DisplayControlButtons.module.css";

function clickMe(){
    alert('YAY!');
}

function DisplayControlButtons() {
  return (
    <div className={styles.displayControlButtons}>
      < button className={styles.simpleButton} onClick={clickMe}>
      Simple Button
      </button>

    </div>
  );
}

export default DisplayControlButtons;
