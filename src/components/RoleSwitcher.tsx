import { useNavigate } from 'react-router-dom';
import { ROLES, ROLE_LABELS, type Role } from '@/app/roles';
import { homePathForRole } from '@/app/navigation';
import { useSession } from '@/app/session';
import styles from './RoleSwitcher.module.css';

// Switches the active role. This stands in for real authentication so the role-gated shell can be
// demonstrated: changing role swaps the available navigation and lands on that role's home. It is
// replaced by the signed-in role when authentication is built.
export function RoleSwitcher() {
  const { role, setRole } = useSession();
  const navigate = useNavigate();

  function handleChange(next: Role) {
    setRole(next);
    navigate(homePathForRole(next));
  }

  return (
    <label className={styles.switcher}>
      <span className={styles.caption}>Viewing as</span>
      <select
        className={styles.select}
        value={role}
        onChange={(event) => handleChange(event.target.value as Role)}
      >
        {ROLES.map((option) => (
          <option key={option} value={option}>
            {ROLE_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
