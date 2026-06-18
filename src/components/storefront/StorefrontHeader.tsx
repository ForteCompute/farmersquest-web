import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CartIcon,
  ChevronDownIcon,
  HeartIcon,
  LeafIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
} from '@/design-system';
import { config } from '@/services/config';
import { getCategories, getStates, type CategoryNode, type StateRef } from '@/services/catalog';
import { useSession } from '@/app/session';
import { useSignInPrompt } from './SignInPrompt';
import styles from './StorefrontHeader.module.css';

// The shared storefront header used across the whole public site. Logo, primary nav, a state
// selector, the search row (state, category, keyword), gated wishlist and cart, and Sign in and
// Register. On phones the nav collapses behind a hamburger into a slide-in panel and the search sits
// below the logo. The state and category lists come from the catalog; nothing is hardcoded.
const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'About', to: '/#about' },
];

export function StorefrontHeader() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { promptSignIn } = useSignInPrompt();
  const [states, setStates] = useState<StateRef[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [stateCode, setStateCode] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const searchLabelId = useId();

  useEffect(() => {
    let active = true;
    void getStates().then((r) => {
      if (active && r.ok) setStates(r.data);
    });
    void getCategories().then((r) => {
      if (active && r.ok) setCategories(r.data);
    });
    return () => {
      active = false;
    };
  }, []);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('query', keyword.trim());
    if (categorySlug) params.set('category', categorySlug);
    if (stateCode) params.set('state', stateCode);
    navigate(`/browse${params.toString() ? `?${params}` : ''}`);
    setMenuOpen(false);
  }

  function gatedCount(reason: string) {
    return () => {
      if (!isAuthenticated) promptSignIn(reason);
    };
  }

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.hamburger}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon size={24} />
        </button>

        <Link to="/" className={styles.logo}>
          <LeafIcon size={26} />
          <span>{config.appName}</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <label className={styles.stateSelect}>
            <span className="sr-only">Choose a state</span>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              aria-label="State"
            >
              <option value="">All Nigeria</option>
              {states.map((s) => (
                <option key={s.code ?? s.name ?? ''} value={s.code ?? ''}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} />
          </label>

          <button
            type="button"
            className={styles.iconButton}
            aria-label="Wishlist"
            onClick={gatedCount('save items to your wishlist')}
          >
            <HeartIcon size={22} />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Cart"
            onClick={gatedCount('use your cart')}
          >
            <CartIcon size={22} />
          </button>

          <Link to="/sign-in" className={styles.signIn}>
            Sign in
          </Link>
          <Link to="/join" className={styles.register}>
            Register
          </Link>
        </div>
      </div>

      <form
        className={styles.search}
        onSubmit={submitSearch}
        role="search"
        aria-labelledby={searchLabelId}
      >
        <span id={searchLabelId} className="sr-only">
          Search products
        </span>
        <label className={styles.searchState}>
          <span className="sr-only">State</span>
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            aria-label="Search state"
          >
            <option value="">All Nigeria</option>
            {states.map((s) => (
              <option key={s.code ?? s.name ?? ''} value={s.code ?? ''}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.searchCategory}>
          <span className="sr-only">Category</span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            aria-label="Search category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug ?? ''}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search crops, livestock, equipment"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          aria-label="Search keyword"
        />
        <button type="submit" className={styles.searchButton} aria-label="Search">
          <SearchIcon size={20} />
          <span className={styles.searchButtonText}>Search</span>
        </button>
      </form>

      {menuOpen && (
        <div className={styles.drawer} role="dialog" aria-label="Menu" aria-modal="true">
          <div className={styles.drawerBackdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.drawerPanel}>
            <div className={styles.drawerHead}>
              <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
                <LeafIcon size={24} />
                <span>{config.appName}</span>
              </Link>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <XIcon size={24} />
              </button>
            </div>
            <nav className={styles.drawerNav} aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={styles.drawerLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className={styles.drawerAuth}>
              <Link to="/sign-in" className={styles.signIn} onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/join" className={styles.register} onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
