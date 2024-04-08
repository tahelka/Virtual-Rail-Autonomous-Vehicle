/* eslint-disable no-unused-vars */
import styles from "./AppLayout.module.css";
import DisplayMapVehicle from "../components/DisplayMapVehicle";
import TitleBar from "../components/TitleBar";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className={styles.appContainer}>
      <TitleBar />

      <div className={styles.pageContainer}>
        <DisplayMapVehicle />
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
