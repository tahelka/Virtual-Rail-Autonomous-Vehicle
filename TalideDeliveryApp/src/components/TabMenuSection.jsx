/* eslint-disable react/prop-types */
import styles from "./TabMenuSection.module.css";

function TabMenuSection({ children }) {
  return <div className={styles.section}>{children}</div>;
}

export default TabMenuSection;
