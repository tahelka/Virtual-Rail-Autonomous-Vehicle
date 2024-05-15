/* eslint-disable no-unused-vars */
import React, {useState} from 'react';
import styles from "./DisplayMapVehicle.module.css";
import DisplayControlButtons from "../DisplayControlButtons";

function DisplayMapVehicle() {
  const [mapImage, setMapImage] = useState("../../public/map1.png");

  const changeMapImage = (mapNumber) => {
    let newImageSrc;
    switch (mapNumber) {
      case 1:
        newImageSrc = "../../public/map1.png";
        break;
      case 2:
        newImageSrc = "../../public/map2.png";
        break;
      case 3:
        newImageSrc = "../../public/map3.png";
        break;
      case 4:
        newImageSrc = "../../public/map4.png";
        break;
      default:
        newImageSrc = "../../public/map1.png";
        break;
    }
    setMapImage(newImageSrc);
  };

  return (
    <div className={styles.displayContainer}>
      <div className={styles.map}>
        <img src= {mapImage} className={styles.mapStyle} alt="Map Image" />
      </div>
      <div className={styles.detailsAndControl}>
        {" "}
        <DisplayControlButtons changeMapImage={changeMapImage}/>{" "}
      </div>
    </div>
  );
}

export default DisplayMapVehicle;
