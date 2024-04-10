import styles from "./DisplayControlButtons.module.css";

function clickMe(){
    alert('YAY!');
}

function DisplayControlButtons() {
  return (
    <div className={styles.displayControlButtons}>
      < button onClick={clickMe}>
      Button
      </button>

    </div>
  );
}

export default DisplayControlButtons;
