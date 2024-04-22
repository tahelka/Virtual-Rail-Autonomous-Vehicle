import PropTypes from 'prop-types';
import styles from "../DisplayControlButtons.module.css";

const DropDownButtonContent = ({ children }) => {
  return <div className={styles.contentOpen}>{children}</div>;
};

DropDownButtonContent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DropDownButtonContent;