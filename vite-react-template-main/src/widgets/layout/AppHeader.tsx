import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

type AppHeaderProps = {
  authStatus?: 'checking' | 'authenticated' | 'unauthenticated';
  onLogout?: () => void;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link apple-nav-link${isActive ? ' active fw-semibold' : ''}`;

const AppHeader: React.FC<AppHeaderProps> = ({ authStatus = 'unauthenticated', onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const collapseRef = React.useRef<HTMLDivElement | null>(null);
  const togglerRef = React.useRef<HTMLButtonElement | null>(null);

  const closeNavbar = React.useCallback(() => {
    if (collapseRef.current?.classList.contains('show')) {
      togglerRef.current?.click();
    }
  }, []);

  const handleLogout = React.useCallback(() => {
    onLogout?.();
    navigate('/');
    closeNavbar();
  }, [closeNavbar, navigate, onLogout]);

  React.useEffect(() => {
    closeNavbar();
  }, [closeNavbar, location]);

  const statusLabel =
    authStatus === 'authenticated'
      ? 'Eingeloggt'
      : authStatus === 'checking'
        ? 'Sitzung wird geprüft'
        : 'Nicht eingeloggt';

  const statusClass =
    authStatus === 'authenticated'
      ? 'apple-status apple-status--authenticated'
      : authStatus === 'checking'
        ? 'apple-status apple-status--checking'
        : 'apple-status apple-status--unauthenticated';

  return (
    <nav className="navbar navbar-expand-lg site-header">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">
          BMS
        </Link>
        <button
          ref={togglerRef}
          className="navbar-toggler apple-toggler"
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
                Bäume
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/green-areas" className={navLinkClass} onClick={closeNavbar}>
                Grünflächen
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/inspections" className={navLinkClass} onClick={closeNavbar}>
                Kontrollen
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <button
                className="nav-link apple-nav-link dropdown-toggle btn btn-link px-0"
                id="infoDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                type="button"
              >
                Info
              </button>
              <ul className="dropdown-menu apple-menu" aria-labelledby="infoDropdown">
                <li>
                  <NavLink to="/about" className="dropdown-item" onClick={closeNavbar}>
                    Über uns
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/imprint" className="dropdown-item" onClick={closeNavbar}>
                    Impressum
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <span className={`navbar-text small ${statusClass}`}>{statusLabel}</span>
            </li>
            {authStatus === 'authenticated' ? (
              <>
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link apple-nav-link btn btn-link px-0"
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
