/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
/*import styles from "./CarManagement.module.css";*/
import StyledButton from "../StyledButton";
import MapVehicle from "../DisplayMapVehicle/MapViewer";


const CarManagement = ({ children }) => {
  return (
    <div>CAR MANAGEMENT</div>
  );
};

CarManagement.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CarManagement;
