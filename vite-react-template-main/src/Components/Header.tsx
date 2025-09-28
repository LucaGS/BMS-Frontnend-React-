import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' active fw-semibold' : ''}`;

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const readHasToken = React.useCallback(
    () => typeof window !== 'undefined' && Boolean(localStorage.getItem('token')),
    []
  );
  const [hasToken, setHasToken] = React.useState<boolean>(() => readHasToken());

  const handleLogout = React.useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem('token');
    setHasToken(readHasToken());
    navigate('/');
  }, [navigate, readHasToken]);

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
            {hasToken ? (
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link px-0"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
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
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
