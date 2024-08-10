import styles from './StyledButton.module.css'; 
import PropTypes from 'prop-types';

function StyledButton({ children, bold, onClick}) {
  const buttonStyles = `${styles.button} ${styles.buttonText} ${bold ? styles.boldButton : ''}`;

  return (
    <button className={buttonStyles} onClick={onClick}>
      {children}
    </button>
  );
}

StyledButton.propTypes = {
  children: PropTypes.node.isRequired,
  bold: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default StyledButton;