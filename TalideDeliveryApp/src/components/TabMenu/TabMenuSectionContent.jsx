/* eslint-disable react/prop-types */
import styles from "./TabMenuSectionContent.module.css";
function TabMenuSectionContent({ children }) {
  return <div className={styles.sectionContent}>{children}</div>;
}
export default TabMenuSectionContent;
