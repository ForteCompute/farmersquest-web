import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, FigmaIcon, PhoneIcon } from '@/design-system';
import { useSession } from '@/app/session';
import { getFarmerKyc } from '@/app/kyc';
import { ROLE_LABELS } from '@/app/roles';
import { VerificationBanner } from '@/features/accounts';
import { getMe, logout } from '@/services/auth';
import styles from './ProfileScreen.module.css';

// The account screen, in the storefront chrome. It reads the signed-in account from GET /me (seeded
// from the session so it renders at once and refreshes when the call returns), shows the identity,
// account details, farm details for a farmer, and links to the settings sub-screens. Farmer KYC is
// driven by getFarmerKyc: verified shows the badge, unverified shows the pending banner with a link
// to /sell/verify. Only fields the contract returns are shown; nothing is hardcoded.
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
    navigate('/', { replace: true });
  }

  // The account layout guards access, so a signed-in account is always present here.
  if (!account) {
    return null;
  }

  const kyc = getFarmerKyc(account);
  const isFarmer = role === 'farmer';
  const memberSince = formatMemberSince(account.createdAtUtc);
  const location = [account.region, account.state].filter(Boolean).join(', ');
  const crops = (account.crops ?? []).filter(Boolean).join(', ');

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your account</h1>

      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">
          {initials(account.fullName)}
        </span>
        <div className={styles.identityBody}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{account.fullName ?? 'Your account'}</span>
            {isFarmer &&
              (kyc.isVerified ? (
                <Badge tone="success">Verified farmer</Badge>
              ) : (
                <Badge tone="neutral">Pending verification</Badge>
              ))}
          </div>
          <p className={styles.role}>
            {ROLE_LABELS[role]}
            {memberSince ? ` · Member since ${memberSince}` : ''}
          </p>
        </div>
        <Link to="/profile/edit" className={styles.editLink}>
          <FigmaIcon name="pen" size={16} /> Edit profile
        </Link>
      </div>

      <VerificationBanner account={account} />

      <Card title="Account details">
        <dl className={styles.details}>
          <Detail icon={<FigmaIcon name="email" size={22} />} label="Email" value={account.email} />
          <Detail icon={<PhoneIcon size={22} />} label="Phone" value={account.phoneNumber} />
          <Detail
            icon={<FigmaIcon name="person" size={22} />}
            label="Username"
            value={account.username}
          />
          <Detail
            icon={<FigmaIcon name="person" size={22} />}
            label="Location"
            value={location || null}
          />
        </dl>
      </Card>

      {isFarmer && (
        <Card title="Farm details">
          <dl className={styles.details}>
            <Detail
              icon={<FigmaIcon name="person" size={22} />}
              label="Farm name"
              value={account.farmName}
            />
            <Detail
              icon={<FigmaIcon name="person" size={22} />}
              label="Your crops"
              value={crops || null}
            />
          </dl>
        </Card>
      )}

      <Card title="Settings and security" flush>
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
        </nav>
      </Card>

      <Button
        className={styles.logout}
        variant="ghost"
        fullWidth
        onClick={handleSignOut}
        loading={signingOut}
        loadingLabel="Signing out"
      >
        <span className={styles.logoutInner}>
          <FigmaIcon name="logout" size={22} /> Log out
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
