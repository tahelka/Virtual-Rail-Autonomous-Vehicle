/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import buttonStyles from "../StyledButton.module.css";

const DropDownButtonItem = ({ children, onClick, closeMenu }) => {
  const DropDownButtonItemStyles = `${buttonStyles.buttonItem} ${buttonStyles.buttonText}`;

  const handleClick = (event) => {
    onClick(event);
    closeMenu();
  };

  return (
    <div className={DropDownButtonItemStyles} onClick={handleClick}>
      {children}
    </div>
  );
};

DropDownButtonItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  closeMenu: PropTypes.func.isRequired,
};

export default DropDownButtonItem;
