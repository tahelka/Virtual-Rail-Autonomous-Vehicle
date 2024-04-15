/* eslint-disable no-unused-vars */
import styles from "./AppLayout.module.css";
import DisplayMapVehicle from "../components/DisplayMapVehicle/DisplayMapVehicle";
import TitleBar from "../components/TitleLogoBar/TitleBar";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import TabMenuSection from "../components/TabMenu/TabMenuSection";
import TabMenuSectionContent from "../components/TabMenu/TabMenuSectionContent";

function AppLayout() {
  return (
    <div className={styles.appContainer}>
      <TitleBar />

      <div className={styles.pageContainer}>
        <DisplayMapVehicle />

        <TabMenuSection>
          <NavBar />
          <TabMenuSectionContent>
            <Outlet />
          </TabMenuSectionContent>
        </TabMenuSection>
      </div>
    </div>
  );
}

export default AppLayout;
