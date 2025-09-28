import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' active fw-semibold' : ''}`;

const Header: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          BMS
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Navigation umschalten"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className={navLinkClass}>
                Startseite
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className={navLinkClass}>
                Ueber uns
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/Baum" className={navLinkClass}>
                Baeume
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/GruenFlaechen" className={navLinkClass}>
                Gruenflaechen
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/Login" className={navLinkClass}>
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/Signup" className={navLinkClass}>
                Registrieren
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
