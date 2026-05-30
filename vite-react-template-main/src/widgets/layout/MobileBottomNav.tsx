import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Start', end: true },
  { to: '/trees', label: 'Bäume' },
  { to: '/green-areas', label: 'Flächen' },
  { to: '/inspections', label: 'Kontrollen' },
  { to: '/about', label: 'Mehr' },
];

const createNavClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-bottom-nav__link${isActive ? ' mobile-bottom-nav__link--active' : ''}`;

const MobileBottomNav: React.FC = () => (
  <nav className="mobile-bottom-nav" aria-label="Mobile Hauptnavigation">
    <ul className="mobile-bottom-nav__list">
      {navItems.map((item) => (
        <li key={item.to} className="mobile-bottom-nav__item">
          <NavLink to={item.to} end={item.end} className={createNavClass}>
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default MobileBottomNav;