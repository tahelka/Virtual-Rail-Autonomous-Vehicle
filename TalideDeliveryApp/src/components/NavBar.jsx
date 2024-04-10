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

{
  /* <Route index element={<Navigate replace to="general" />} />
            <Route path="general" element={<h1>General</h1>} />
            <Route path="cars" element={<h1>Cars</h1>} />
            <Route path="data" element={<h1>Data</h1>} />
            <Route path="contacts" element={<h1>Contacts</h1>} />
            <Route path="admin" element={<h1>admin</h1>} /> */
}

export default NavBar;
