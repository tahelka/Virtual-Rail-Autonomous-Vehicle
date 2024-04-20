import styles from "./TitleBar.module.css";

function TitleBar() {
  return (
    <div className={styles.titleBar}>
      <div className={styles.titleCenter}>
        <img
          src="../../public/logo_img.png"
          className={styles.logo}
          alt="logo"
        />
        <h1>Talide Delivery</h1>
      </div>
    </div>
  );
}

export default TitleBar;
