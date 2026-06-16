import { NavLink, Outlet } from 'react-router-dom';
import { Nav, NavItemContent, type NavItem } from '@/design-system';
import { config } from '@/services/config';
import { useSession } from '@/app/session';
import { navForRole } from '@/app/navigation';
import { ROLE_LABELS } from '@/app/roles';
import { RoleSwitcher } from './RoleSwitcher';
import styles from './AppShell.module.css';

// The application chrome: brand header, role switcher, role-gated sidebar navigation, and the
// routed content area. The navigation shown is driven entirely by the active role.
export function AppShell() {
  const { role } = useSession();
  const entries = navForRole(role);

  const navItems: NavItem[] = entries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    icon: entry.icon,
  }));
  const pathByKey = new Map(entries.map((entry) => [entry.key, entry.path]));

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            🌱
          </span>
          <span className={styles.appName}>{config.appName}</span>
          {config.environment !== 'Production' && (
            <span className={styles.envTag}>{config.environment}</span>
          )}
        </div>
        <RoleSwitcher />
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <Nav
            title={`${ROLE_LABELS[role]} menu`}
            items={navItems}
            renderLink={(item, classNames) => {
              const to = pathByKey.get(item.key) ?? '/';
              return (
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    [classNames.link, isActive ? classNames.active : ''].filter(Boolean).join(' ')
                  }
                >
                  <NavItemContent item={item} />
                </NavLink>
              );
            }}
          />
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
