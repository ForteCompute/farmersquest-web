import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Store } from '@/components/storefront';
import { AuthLayout } from './AuthLayout';
import { AuthLegal } from './AuthLegal';
import styles from './AccountTypeScreen.module.css';

// The first onboarding step: choose how you want to use FarmersQuest. Each option routes to the
// matching registration form. Buyers shop; farmers sell. Both options are clear, equal-weight cards.
const OPTIONS = [
  {
    to: '/register/buyer',
    Icon: ShoppingCart,
    title: 'I want to buy',
    text: 'Shop fresh crops and livestock direct from verified farmers across Nigeria.',
  },
  {
    to: '/register/farmer',
    Icon: Store,
    title: 'I want to sell',
    text: 'List your harvest and reach buyers nationwide. Identity verification comes later.',
  },
] as const;

export function AccountTypeScreen() {
  return (
    <AuthLayout wide>
      <header className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>How would you like to use FarmersQuest?</p>
      </header>

      <div className={styles.options}>
        {OPTIONS.map(({ to, Icon, title, text }) => (
          <Link key={to} to={to} className={styles.option}>
            <span className={styles.optionIcon} aria-hidden="true">
              <Icon size={26} />
            </span>
            <span className={styles.optionBody}>
              <span className={styles.optionTitle}>{title}</span>
              <span className={styles.optionText}>{text}</span>
            </span>
            <ArrowRight size={20} className={styles.optionArrow} aria-hidden="true" />
          </Link>
        ))}
      </div>

      <p className={styles.signInRow}>
        Already have an account?{' '}
        <Link className={styles.link} to="/sign-in">
          Sign in
        </Link>
      </p>

      <AuthLegal action="creating an account" />
    </AuthLayout>
  );
}
