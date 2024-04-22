//import React from 'react';
import PropTypes from 'prop-types';
import {FaChevronDown, FaChevronUp} from "react-icons/fa";
import styles from "../DisplayControlButtons.module.css";
import buttonStyles from "../StyledButton.module.css";

const DropDownButton = ({children, open, toggle}) => {
    const DropDownButtonStyles = `${styles.dropDownButton} ${open ? styles.dropDownButtonOpen : null}`;

    return (
        <button className={DropDownButtonStyles}>
        <span className={buttonStyles.buttonText}>{children}</span>
        <span onClick={toggle} className={styles.toggleIcon}>{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </button>
    );
};

DropDownButton.propTypes = {
    children: PropTypes.node.isRequired,
    open: PropTypes.node.isRequired,
    toggle: PropTypes.node.isRequired,
  };

export default DropDownButton;
