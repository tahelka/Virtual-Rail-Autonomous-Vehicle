//import React from 'react';
import PropTypes from 'prop-types';
import styles from "../DisplayControlButtons.module.css";

const DropDownButtonItem = ({children, onClick}) => {
    return (
        <div className = {styles.button}> {onClick}
            {children}
        </div>
    );
};

DropDownButtonItem.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.node.isRequired,
  };

export default DropDownButtonItem;
