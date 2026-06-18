import { NavLink } from 'react-router-dom';
import { Home, Search, Store, User } from './icons';
import styles from './MobileTabBar.module.css';

// The fixed bottom tab bar shown on phones only, like a shopping app. Four tabs: Home, Browse, Sell,
// Account. Alerts and Chat are intentionally left out until those features exist. The active tab is
// highlighted in green. Hidden on tablet and desktop, which use the top header.
const TABS = [
  { label: 'Home', to: '/', Icon: Home, end: true },
  { label: 'Browse', to: '/browse', Icon: Search, end: false },
  { label: 'Sell', to: '/join/farmer', Icon: Store, end: false },
  { label: 'Account', to: '/account', Icon: User, end: false },
];

export function MobileTabBar() {
  return (
    <nav className={styles.bar} aria-label="Primary mobile">
      {TABS.map(({ label, to, Icon, end }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) =>
            [styles.tab, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <Icon size={24} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
