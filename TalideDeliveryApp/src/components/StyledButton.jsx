import styles from './StyledButton.module.css'; 
import PropTypes from 'prop-types';

function StyledButton({ children, bold }) {
  const buttonStyles = `${styles.button} ${styles.buttonText} ${bold ? styles.boldButton : ''}`;

  return (
    <button className={buttonStyles}>
      {children}
    </button>
  );
}

StyledButton.propTypes = {
  children: PropTypes.node.isRequired,
  bold: PropTypes.node.isRequired,
};

export default StyledButton;