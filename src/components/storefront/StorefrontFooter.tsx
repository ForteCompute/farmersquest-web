import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BrandFacebook, BrandLinkedin, BrandX, Leaf } from './icons';
import { config } from '@/services/config';
import styles from './StorefrontFooter.module.css';

// The shared storefront footer, the full farmlinkup footer arrangement reskinned to our brand: a
// newsletter band, then a brand blurb with social links and four link columns (Marketplace, Support,
// Company, Legal), then the copyright line. Reused on every storefront page. Our own wording and
// links; nothing from farmlinkup is copied.
//
// The newsletter has no backend endpoint yet, so on a valid submit it shows a friendly confirmation
// and the subscribe endpoint is flagged as a small backend follow-up. It never silently does
// nothing, and it is never omitted.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Browse listings', to: '/browse' },
      { label: 'Categories', to: '/browse' },
      { label: 'Become a seller', to: '/join/farmer' },
      { label: 'Sell your harvest', to: '/join/farmer' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Help centre', to: '#' },
      { label: 'Disputes', to: '#' },
      { label: 'Contact us', to: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/#about' },
      { label: 'Blog', to: '#' },
      { label: 'Careers', to: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', to: '#' },
      { label: 'Privacy policy', to: '#' },
      { label: 'Seller guidelines', to: '#' },
    ],
  },
];

export function StorefrontFooter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle');
  const year = new Date().getFullYear();

  function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      return;
    }
    // No subscribe endpoint yet (flagged as a backend follow-up). Confirm to the visitor so the
    // control never silently does nothing.
    setStatus('done');
  }

  return (
    <footer className={styles.footer}>
      <section className={styles.newsletter} aria-labelledby="newsletter-heading">
        <h2 id="newsletter-heading" className={styles.newsletterHeading}>
          Join our newsletter to stay informed about fresh listings and updates
        </h2>
        {status === 'done' ? (
          <p className={styles.newsletterDone} role="status">
            Thanks, you are on the list. We will keep you posted.
          </p>
        ) : (
          <form className={styles.newsletterForm} onSubmit={subscribe} noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              className={styles.newsletterInput}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Type your email address here"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              aria-invalid={status === 'error'}
              aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
            />
            <button type="submit" className={styles.newsletterButton}>
              Subscribe
            </button>
            {status === 'error' && (
              <p id="newsletter-error" className={styles.newsletterError} role="alert">
                Enter a valid email address.
              </p>
            )}
          </form>
        )}
      </section>

      <div className={styles.columns}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLogo}>
            <Leaf size={24} />
            <span>{config.appName}</span>
          </Link>
          <p className={styles.brandBlurb}>
            Nigeria&rsquo;s marketplace for crops and livestock. Buy direct from verified farmers,
            with payment held safely until you confirm your order.
          </p>
          <div className={styles.social}>
            <a className={styles.socialLink} href="#" aria-label="Facebook">
              <BrandFacebook size={18} />
            </a>
            <a className={styles.socialLink} href="#" aria-label="X">
              <BrandX size={18} />
            </a>
            <a className={styles.socialLink} href="#" aria-label="LinkedIn">
              <BrandLinkedin size={18} />
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} className={styles.column} aria-label={col.title}>
            <h3 className={styles.columnTitle}>{col.title}</h3>
            <ul className={styles.columnList}>
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith('#') || link.to.includes('/#') ? (
                    <a className={styles.columnLink} href={link.to}>
                      {link.label}
                    </a>
                  ) : (
                    <Link className={styles.columnLink} to={link.to}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className={styles.copyright}>
        &copy; {year} {config.appName}. All rights reserved.
      </p>
    </footer>
  );
}
