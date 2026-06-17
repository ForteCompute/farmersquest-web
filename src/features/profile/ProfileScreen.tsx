import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, FigmaIcon, PhoneIcon } from '@/design-system';
import { useSession } from '@/app/session';
import { ROLE_LABELS } from '@/app/roles';
import { VerificationBanner } from '@/features/accounts';
import { getMe, logout } from '@/services/auth';
import styles from './ProfileScreen.module.css';

// The Account screen, reproduced from the PROFILE frame: the account header with avatar and
// verification status, the account details, the Settings and Security list, and Log Out. Data comes
// from GET /me (seeded from the signed-in session so it renders immediately and refreshes when the
// call returns). The wallet shown in the second frame is out of scope (a future feature).
//
// Only fields the contract returns are shown. The frame's Farm Name, Location, and Primary Crops
// have no account fields yet; tracked as the same API gap noted for registration. Editing is reached
// through the avatar pen, matching the frame (Settings holds no Edit Profile row).
function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  return (parts[0]![0]! + (parts[1]?.[0] ?? '')).toUpperCase();
}

function formatMemberSince(iso: string | undefined): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const { account, role, updateAccount, signOut } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  // Refresh from the API on mount; the API is the source of truth for the account.
  useEffect(() => {
    let active = true;
    void getMe().then((result) => {
      if (active && result.ok) {
        updateAccount(result.data);
      }
    });
    return () => {
      active = false;
    };
  }, [updateAccount]);

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    signOut();
    navigate('/sign-in', { replace: true });
  }

  if (!account) {
    return (
      <div className={styles.empty}>
        <p>You are not signed in.</p>
        <Link className={styles.link} to="/sign-in">
          Go to sign in
        </Link>
      </div>
    );
  }

  const isFarmer = role === 'farmer';
  const verification = account.verificationStatus?.trim().toLowerCase();
  const isVerified = verification === 'verified' || verification === 'approved';
  const memberSince = formatMemberSince(account.createdAtUtc);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Account</h1>

      <header className={styles.identity}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(account.fullName)}
          </span>
          <Link className={styles.avatarEdit} to="/profile/edit" aria-label="Edit profile">
            <FigmaIcon name="pen" size={16} />
          </Link>
        </div>
        <div className={styles.nameRow}>
          <span className={styles.name}>{account.fullName ?? 'Your account'}</span>
          {isFarmer &&
            (isVerified ? (
              <span className={styles.verifiedPill}>
                <FigmaIcon name="verified" size={16} />
                VERIFIED
              </span>
            ) : (
              <span className={styles.pendingPill}>Pending</span>
            ))}
        </div>
        <p className={styles.subtitle}>{ROLE_LABELS[role]}</p>
      </header>

      {isFarmer && !isVerified && <VerificationBanner status={account.verificationStatus} />}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Details</h2>
        <dl className={styles.details}>
          <Detail icon={<FigmaIcon name="email" size={22} />} label="Email" value={account.email} />
          <Detail icon={<PhoneIcon size={22} />} label="Phone" value={account.phoneNumber} />
          <Detail
            icon={<FigmaIcon name="person" size={22} />}
            label="Username"
            value={account.username}
          />
          {memberSince && (
            <Detail
              icon={<FigmaIcon name="person" size={22} />}
              label="Member since"
              value={memberSince}
            />
          )}
        </dl>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Settings &amp; Security</h2>
        <nav className={styles.rows}>
          <SettingsRow
            to="/profile/security"
            icon={<FigmaIcon name="password-outline" size={24} />}
            label="Security & Password"
          />
          <SettingsRow
            to="/profile/notifications"
            icon={<FigmaIcon name="bell" size={24} />}
            label="Notifications"
          />
          <div className={[styles.row, styles.rowDisabled].join(' ')} aria-disabled="true">
            <span className={styles.rowIcon}>
              <FigmaIcon name="support" size={24} />
            </span>
            <span className={styles.rowLabel}>Support</span>
            <FigmaIcon name="chevron" size={20} />
          </div>
        </nav>
      </section>

      <Button
        className={styles.logout}
        variant="ghost"
        fullWidth
        onClick={handleSignOut}
        disabled={signingOut}
      >
        <span className={styles.logoutInner}>
          <FigmaIcon name="logout" size={24} /> Log Out
        </span>
      </Button>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className={styles.detail}>
      <span className={styles.detailIcon}>{icon}</span>
      <div className={styles.detailText}>
        <dt className={styles.detailLabel}>{label}</dt>
        <dd className={styles.detailValue}>{value || 'Not set'}</dd>
      </div>
    </div>
  );
}

function SettingsRow({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link className={styles.row} to={to}>
      <span className={styles.rowIcon}>{icon}</span>
      <span className={styles.rowLabel}>{label}</span>
      <FigmaIcon name="chevron" size={20} />
    </Link>
  );
}
