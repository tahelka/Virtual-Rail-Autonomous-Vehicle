/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import DropDownButton from "./DropDownButton";
import DropDownButtonContent from "./DropDownButtonContent";
import styles from "../DisplayControlButtons.module.css";

const DisplayDropDownButton = ({ buttonText, content }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropDown = () => setOpen(!open);

  const closeMenu = () => {
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={styles.displayDropDownButton}>
      <DropDownButton toggle={toggleDropDown} open={open}>{buttonText}</DropDownButton>
      {open && (
        <DropDownButtonContent>
          {React.Children.map(content, (child) =>
            React.cloneElement(child, { closeMenu })
          )}
        </DropDownButtonContent>
      )}
    </div>
  );
};

DisplayDropDownButton.propTypes = {
  buttonText: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

export default DisplayDropDownButton;
