import styles from "./DisplayMapVehicle.module.css";
import DisplayControlButtons from "../DisplayControlButtons";

function DisplayMapVehicle() {
  return (
    <div className={styles.displayContainer}>
      <div className={styles.map}>
        <img src="../../public/map.png" className={styles.mapStyle} />
      </div>
      <div className={styles.detailsAndControl}>
        {" "}
        <DisplayControlButtons />{" "}
      </div>
    </div>
  );
}

export default DisplayMapVehicle;
