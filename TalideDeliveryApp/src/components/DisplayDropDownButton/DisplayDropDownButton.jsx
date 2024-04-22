/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DropDownButton from "./DropDownButton";
import DropDownButtonContent from "./DropDownButtonContent";
import styles from "../DisplayControlButtons.module.css";

const DisplayDropDownButton = ({ buttonText, content }) => {
  const [open, setOpen] = useState(false);
  const toggleDropDown = () => setOpen(!open);
  return (
    <div className={styles.displayDropDownButton}>
      <DropDownButton toggle={toggleDropDown} open={open}>{buttonText}</DropDownButton>
      {open && <DropDownButtonContent>{content}</DropDownButtonContent>}
    </div>
  );
};

DisplayDropDownButton.propTypes = {
  buttonText: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

export default DisplayDropDownButton;