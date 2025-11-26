import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' active fw-semibold' : ''}`;

const AppHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const collapseRef = React.useRef<HTMLDivElement | null>(null);
  const togglerRef = React.useRef<HTMLButtonElement | null>(null);
  const readHasToken = React.useCallback(
    () => typeof window !== 'undefined' && Boolean(localStorage.getItem('token')),
    []
  );
  const [hasToken, setHasToken] = React.useState<boolean>(() => readHasToken());

  const closeNavbar = React.useCallback(() => {
    if (collapseRef.current?.classList.contains('show')) {
      togglerRef.current?.click();
    }
  }, []);

  const handleLogout = React.useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem('token');
    setHasToken(readHasToken());
    navigate('/');
    closeNavbar();
  }, [closeNavbar, navigate, readHasToken]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorage = () => setHasToken(readHasToken());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [readHasToken]);

  React.useEffect(() => {
    setHasToken(readHasToken());
  }, [location, readHasToken]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          BMS
        </Link>
        <button
          ref={togglerRef}
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
        <div ref={collapseRef} className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink to="/" end className={navLinkClass} onClick={closeNavbar}>
                Startseite
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/trees" className={navLinkClass} onClick={closeNavbar}>
                Baeume
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/green-areas" className={navLinkClass} onClick={closeNavbar}>
                Gruenflaechen
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/inspections" className={navLinkClass} onClick={closeNavbar}>
                Kontrollen
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-white px-0"
                id="infoDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                type="button"
              >
                Info
              </button>
              <ul className="dropdown-menu" aria-labelledby="infoDropdown">
                <li>
                  <NavLink to="/about" className="dropdown-item" onClick={closeNavbar}>
                    Ueber uns
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/imprint" className="dropdown-item" onClick={closeNavbar}>
                    Impressum
                  </NavLink>
                </li>
              </ul>
            </li>
            {hasToken ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text text-white-50 small">Eingeloggt</span>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link btn btn-link px-0"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className={navLinkClass} onClick={closeNavbar}>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/signup" className={navLinkClass} onClick={closeNavbar}>
                    Registrieren
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
