import styles from "./DisplayMapVehicle.module.css";

function DisplayMapVehicle() {
  return (
    <div className={styles.displayContainer}>
      <div className={styles.map}>
        <img src="../public/map.png" className={styles.mapStyle} />
      </div>
      <div className={styles.detailsAndControl}></div>
    </div>
  );
}

export default DisplayMapVehicle;
