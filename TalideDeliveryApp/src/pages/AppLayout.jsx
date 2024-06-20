/* eslint-disable no-unused-vars */
import React from 'react';
import styles from "./AppLayout.module.css";
import DisplayMapVehicle from "../components/DisplayMapVehicle/DisplayMapVehicle";
import TitleBar from "../components/TitleLogoBar/TitleBar";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import TabMenuSection from "../components/TabMenu/TabMenuSection";
import TabMenuSectionContent from "../components/TabMenu/TabMenuSectionContent";
import PropTypes from 'prop-types';

function AppLayout({ maps, fetchMaps }) {
  return (
    <div className={styles.appContainer}>
      <TitleBar />

      <div className={styles.pageContainer}>
        <DisplayMapVehicle maps={maps} fetchMaps={fetchMaps} />

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

AppLayout.propTypes = {
  maps: PropTypes.array.isRequired,
  fetchMaps: PropTypes.func.isRequired,
};

export default AppLayout;