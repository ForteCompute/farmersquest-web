import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Nav, NavItemContent, type NavItem } from '@/design-system';
import { config } from '@/services/config';
import { useSession } from '@/app/session';
import { navForRole } from '@/app/navigation';
import { ROLE_LABELS } from '@/app/roles';
import { logout } from '@/services/auth';
import { RoleSwitcher } from './RoleSwitcher';
import styles from './AppShell.module.css';

// The application chrome: brand header, role-gated sidebar navigation, and the routed content area.
// When signed in, the header shows the account and a sign-out control; before sign in, the role
// switcher drives the role-gated navigation for previewing the shell.
export function AppShell() {
  const { role, account, isAuthenticated, signOut } = useSession();
  const navigate = useNavigate();
  const entries = navForRole(role);

  async function handleSignOut() {
    // Tell the API to revoke the token, then clear the local session regardless of the result and
    // return to sign in. Clearing locally always happens so sign out never leaves a stuck session.
    await logout();
    signOut();
    navigate('/sign-in', { replace: true });
  }

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
        {isAuthenticated ? (
          <div className={styles.account}>
            {account?.fullName && <span className={styles.accountName}>{account.fullName}</span>}
            <button type="button" className={styles.signOut} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <RoleSwitcher />
        )}
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
