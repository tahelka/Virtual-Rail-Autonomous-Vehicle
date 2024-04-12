//import React from 'react';
import PropTypes from 'prop-types';
import {FaChevronDown, FaChevronUp} from "react-icons/fa";
import styles from "../DisplayControlButtons.module.css";

const DropDownButton = ({children, open, toggle}) => {
    return (
        <div className={`${styles.dropDownButton} ${open ? styles.dropDownButtonOpen : null}`}>
        <span className={styles.buttonText}>{children}</span>
        <span onClick={toggle} className={styles.toggleIcon}>{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
    );
};

DropDownButton.propTypes = {
    children: PropTypes.node.isRequired,
    open: PropTypes.node.isRequired,
    toggle: PropTypes.node.isRequired,
  };

export default DropDownButton;
