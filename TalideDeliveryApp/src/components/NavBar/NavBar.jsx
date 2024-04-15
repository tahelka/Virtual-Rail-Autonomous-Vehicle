/* eslint-disable no-unused-vars */
import styles from "./NavBar.module.css";
import { Link, NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <NavLink to="general">General</NavLink>
        </li>
        <li>
          <NavLink to="cars">Cars</NavLink>
        </li>
        <li>
          <NavLink to="data">Data</NavLink>
        </li>
        <li>
          <NavLink to="contacts">Contacts</NavLink>
        </li>
        <li>
          <NavLink to="admin">Admin</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
