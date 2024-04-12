//import React from 'react';
import PropTypes from 'prop-types';
import styles from "../DisplayControlButtons.module.css";

const DropDownButtonContent = ({children, open}) => {
    return (
        <div className={`${open ? `${styles.contentOpen} ${styles.buttonText}` : styles.contentClosed}`}>
            {children}
        </div>
    );
};

DropDownButtonContent.propTypes = {
    children: PropTypes.node.isRequired,
    open: PropTypes.node.isRequired,
  };

export default DropDownButtonContent;
