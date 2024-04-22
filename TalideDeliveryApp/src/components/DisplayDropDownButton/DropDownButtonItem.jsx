import PropTypes from 'prop-types';
import buttonStyles from "../StyledButton.module.css";

const DropDownButtonItem = ({ children }) => {
  const DropDownButtonItemStyles = `${buttonStyles.buttonItem} ${buttonStyles.buttonText}`;

  return <div className={DropDownButtonItemStyles}>{children}</div>;
};

DropDownButtonItem.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DropDownButtonItem;