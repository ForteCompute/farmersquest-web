import { useEffect, useId, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CategoryCard,
  ChevronDown,
  CircleCheck,
  CONTENT_ICONS,
  Handshake,
  ProductRow,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  useReveal,
} from '@/components/storefront';
import {
  getCategories,
  getStates,
  listProducts,
  type CategoryNode,
  type ProductSummary,
  type StateRef,
} from '@/services/catalog';
import {
  FAQ,
  FARMER_POINTS,
  HOT_SEARCHES,
  HOW_IT_WORKS,
  SELLER_BENEFITS,
  VALUE_CARDS,
} from './landingContent';
import styles from './LandingPage.module.css';

type Status = 'loading' | 'ok' | 'error';
const SPOTLIGHT_COUNT = 3;

interface Spotlight {
  category: CategoryNode;
  products: ProductSummary[];
  status: Status;
}

// The public landing at the root route: a storefront-led home (search and product discovery first,
// brand and trust sections below), in the confirmed section order. Product and category content is
// live catalog data with loading, empty, and error states. Marketing sections use our own wording.
export function LandingPage() {
  const navigate = useNavigate();
  const [states, setStates] = useState<StateRef[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [catStatus, setCatStatus] = useState<Status>('loading');
  const [featured, setFeatured] = useState<ProductSummary[]>([]);
  const [featuredStatus, setFeaturedStatus] = useState<Status>('loading');
  const [featuredTitle, setFeaturedTitle] = useState('Featured products');
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);

  useEffect(() => {
    let active = true;

    void getStates().then((r) => active && r.ok && setStates(r.data));

    // Featured products lead the discovery rows. If nothing is flagged featured yet, fall back to
    // the newest listings (the catalog default sort) so the row is always full, never an empty void.
    void listProducts({ featured: true, pageSize: 8 }).then(async (r) => {
      if (!active) return;
      if (!r.ok) {
        setFeaturedStatus('error');
        return;
      }
      const items = r.data.items ?? [];
      if (items.length > 0) {
        setFeatured(items);
        setFeaturedStatus('ok');
        return;
      }
      const fresh = await listProducts({ pageSize: 8 });
      if (!active) return;
      if (fresh.ok) {
        setFeatured(fresh.data.items ?? []);
        setFeaturedTitle('Fresh on the marketplace');
        setFeaturedStatus('ok');
      } else {
        setFeaturedStatus('error');
      }
    });

    void getCategories().then(async (r) => {
      if (!active) return;
      if (!r.ok) {
        setCatStatus('error');
        return;
      }
      setCategories(r.data);
      setCatStatus('ok');

      const top = r.data
        .filter((c) => (c.productCount ?? 0) > 0 && Boolean(c.slug))
        .slice(0, SPOTLIGHT_COUNT);
      setSpotlights(top.map((category) => ({ category, products: [], status: 'loading' })));
      for (const category of top) {
        const slug = category.slug;
        const res = await listProducts(
          slug ? { categorySlug: slug, pageSize: 8 } : { pageSize: 8 },
        );
        if (!active) return;
        setSpotlights((prev) =>
          prev.map((s) =>
            s.category.id === category.id
              ? {
                  ...s,
                  products: res.ok ? (res.data.items ?? []) : [],
                  status: res.ok ? 'ok' : 'error',
                }
              : s,
          ),
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Hero
        states={states}
        categories={categories}
        products={featured}
        loading={featuredStatus === 'loading'}
        onSearch={(qs) => navigate(`/browse${qs}`)}
      />

      <HotSearches />

      <Reveal className={styles.bandSoft}>
        <div className={styles.bandInner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>Browse by category</h2>
            <Link className={styles.seeAll} to="/browse">
              See all categories <ArrowRight size={16} />
            </Link>
          </div>
          <CategoryGrid categories={categories} status={catStatus} />
        </div>
      </Reveal>

      <Reveal className={styles.section}>
        <ProductRow
          title={featuredTitle}
          viewAllHref="/browse"
          products={featured}
          loading={featuredStatus === 'loading'}
          error={featuredStatus === 'error'}
          emptyState={
            <p className={styles.notice}>
              New listings are arriving. Check back shortly for fresh produce and livestock.
            </p>
          }
        />
      </Reveal>

      {spotlights.map((s) => (
        <Reveal key={s.category.id} className={styles.section}>
          <ProductRow
            title={s.category.name ?? 'Products'}
            viewAllHref={`/category/${s.category.slug ?? ''}`}
            products={s.products}
            loading={s.status === 'loading'}
            error={s.status === 'error'}
          />
        </Reveal>
      ))}

      <HowItWorks />
      <ValueCards />
      <DesignedForFarmer />
      <BecomeSeller />
      <Faq />
    </>
  );
}

// Reveal wrapper: fades and slides its section up once when it scrolls into view (reduced-motion
// safe via the shared utility).
function Reveal({ children, className }: { children: ReactNode; className?: string | undefined }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      data-revealed={revealed}
      className={['fq-reveal', className ?? ''].filter(Boolean).join(' ')}
    >
      {children}
    </section>
  );
}

function Hero({
  states,
  categories,
  products,
  loading,
  onSearch,
}: {
  states: StateRef[];
  categories: CategoryNode[];
  products: ProductSummary[];
  loading: boolean;
  onSearch: (queryString: string) => void;
}) {
  const [stateCode, setStateCode] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [keyword, setKeyword] = useState('');
  const labelId = useId();

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('query', keyword.trim());
    if (categorySlug) params.set('category', categorySlug);
    if (stateCode) params.set('state', stateCode);
    onSearch(params.toString() ? `?${params}` : '');
  }

  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Direct from verified farmers</p>
          <h1 className={styles.heroTitle}>
            Buy fresh produce and livestock direct from Nigerian farmers
          </h1>
          <p className={styles.heroLead}>
            Compare prices, order in minutes, and pay safely. Your money is held until you confirm
            delivery.
          </p>

          <form
            className={styles.heroSearch}
            onSubmit={submit}
            role="search"
            aria-labelledby={labelId}
          >
            <span id={labelId} className="sr-only">
              Search the marketplace
            </span>
            <label className={styles.heroField}>
              <span className="sr-only">State</span>
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
              <ChevronDown size={16} />
            </label>
            <label className={styles.heroField}>
              <span className="sr-only">Category</span>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                aria-label="Category"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug ?? ''}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </label>
            <input
              className={styles.heroInput}
              type="search"
              placeholder="What are you looking for?"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Keyword"
            />
            <button type="submit" className={styles.heroSearchButton}>
              <Search size={20} /> Search
            </button>
          </form>

          <div className={styles.heroActions}>
            <Link to="/browse" className={styles.heroPrimary}>
              Start buying
            </Link>
            <Link to="/join/farmer" className={styles.heroSecondary}>
              Start selling
            </Link>
          </div>
        </div>

        <HeroVisual products={products} loading={loading} />
      </div>
      <div className={styles.heroCurve} aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path d="M0,90 L0,46 C260,96 520,96 720,60 C940,22 1200,22 1440,58 L1440,90 Z" />
        </svg>
      </div>
    </section>
  );
}

// The hero's right side. There is no owned hero photo yet and we use no unlicensed stock, so we
// build a layered composition from our own data: floating cards of real catalogue listings with
// their images, plus a verified-trust card. It gives the hero depth and fills the space.
// TODO(design): replace with a real, owned hero photograph once one is available.
function HeroVisual({ products, loading }: { products: ProductSummary[]; loading: boolean }) {
  const tiles = products.slice(0, 2);
  const showSkeletons = loading || tiles.length === 0;

  return (
    <div className={styles.heroVisual} aria-hidden="true">
      <div className={styles.heroGlow} />
      {showSkeletons
        ? Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className={[styles.heroTile, styles[`heroTile${i + 1}`], 'fq-skeleton'].join(' ')}
            />
          ))
        : tiles.map((p, i) => (
            <div key={p.id} className={[styles.heroTile, styles[`heroTile${i + 1}`]].join(' ')}>
              {p.primaryImageUrl && (
                <img
                  className={styles.heroTileImg}
                  src={p.primaryImageUrl}
                  alt=""
                  loading="lazy"
                  width={220}
                  height={160}
                />
              )}
              <span className={styles.heroTileBody}>
                <span className={styles.heroTileTitle}>{p.title}</span>
                {p.state && <span className={styles.heroTileMeta}>{p.state}</span>}
              </span>
            </div>
          ))}
      <div className={styles.heroTrust}>
        <ShieldCheck size={20} />
        <span>
          <strong>Verified farmers</strong>
          <span className={styles.heroTrustSub}>Payment held until you confirm delivery</span>
        </span>
      </div>
    </div>
  );
}

function HotSearches() {
  return (
    <div className={styles.hotWrap}>
      <span className={styles.hotLabel}>Popular:</span>
      <div className={styles.hotChips}>
        {HOT_SEARCHES.map((term) => (
          <Link
            key={term}
            to={`/browse?query=${encodeURIComponent(term)}`}
            className={styles.hotChip}
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoryGrid({ categories, status }: { categories: CategoryNode[]; status: Status }) {
  if (status === 'loading') {
    return (
      <div className={styles.categoryGrid} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={['fq-skeleton', styles.categorySkeleton].join(' ')} />
        ))}
      </div>
    );
  }
  if (status === 'error') {
    return <p className={styles.notice}>We could not load categories right now.</p>;
  }
  if (categories.length === 0) {
    return <p className={styles.notice}>Categories are on the way. Check back soon.</p>;
  }
  // A full grid: each top category followed by its subcategories, every tile with its own icon and
  // live product count, so the section is dense like a real marketplace rather than two lone cards.
  const tiles = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  return (
    <div className={styles.categoryGrid}>
      {tiles.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}

function HowItWorks() {
  return (
    <Reveal className={[styles.section, styles.howSection].join(' ')}>
      <h2 className={styles.h2} id="how-it-works">
        How it works
      </h2>
      <div className={styles.steps}>
        {HOW_IT_WORKS.map((step, i) => {
          const Icon = CONTENT_ICONS[step.icon] ?? Search;
          return (
            <div key={step.title} className={styles.step}>
              <span className={styles.stepIcon}>
                <Icon size={26} />
              </span>
              <span className={styles.stepNumber}>Step {i + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}

function ValueCards() {
  return (
    <Reveal className={styles.section}>
      <div className={styles.valueGrid}>
        {VALUE_CARDS.map((card) => {
          const Icon = CONTENT_ICONS[card.icon] ?? ShieldCheck;
          return (
            <div key={card.title} className={styles.valueCard}>
              <span className={styles.valueIcon}>
                <Icon size={24} />
              </span>
              <h3 className={styles.valueTitle}>{card.title}</h3>
              <p className={styles.valueText}>{card.text}</p>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}

const FARMER_HIGHLIGHTS = [
  { Icon: Store, label: 'List your produce for free' },
  { Icon: ShieldCheck, label: 'Verified buyers, payment in escrow' },
  { Icon: Truck, label: 'Logistics support across Nigeria' },
  { Icon: TrendingUp, label: 'Transparent, fair market prices' },
];

function DesignedForFarmer() {
  return (
    <Reveal className={[styles.section, styles.farmerSection].join(' ')}>
      <div className={styles.farmerInner} id="about">
        <div className={styles.farmerCopy}>
          <h2 className={styles.h2}>Designed for the Nigerian farmer</h2>
          <p className={styles.farmerLead}>
            From the grain stores of Kano to the farms of Oyo, FarmersQuest helps you reach buyers
            and grow your trade.
          </p>
          <ul className={styles.farmerPoints}>
            {FARMER_POINTS.map((point) => (
              <li key={point} className={styles.farmerPoint}>
                <CircleCheck size={20} /> {point}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.farmerVisual} aria-hidden="true">
          <div className={styles.farmerBadge}>
            <Handshake size={26} />
            <span>Trusted marketplace</span>
          </div>
          <ul className={styles.farmerChips}>
            {FARMER_HIGHLIGHTS.map(({ Icon, label }) => (
              <li key={label} className={styles.farmerChip}>
                <span className={styles.farmerChipIcon}>
                  <Icon size={20} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

const SELLER_STEPS = [
  'List your produce for free in minutes',
  'Connect with verified buyers nationwide',
  'Get paid after the buyer confirms delivery',
];

function BecomeSeller() {
  return (
    <Reveal className={[styles.section, styles.sellerSection].join(' ')}>
      <div className={styles.sellerInner}>
        <div className={styles.sellerCopy}>
          <h2 className={styles.sellerTitle}>Sell your harvest to buyers nationwide</h2>
          <p className={styles.sellerLead}>
            List your produce for free and get paid after the buyer confirms delivery.
          </p>
          <ul className={styles.sellerBenefits}>
            {SELLER_BENEFITS.map((b) => (
              <li key={b} className={styles.sellerBenefit}>
                <CircleCheck size={18} /> {b}
              </li>
            ))}
          </ul>
          <Link to="/join/farmer" className={styles.sellerButton}>
            Create seller account
          </Link>
        </div>
        <div className={styles.sellerVisual} aria-hidden="true">
          <p className={styles.sellerStepsTitle}>Start in three steps</p>
          <ol className={styles.sellerSteps}>
            {SELLER_STEPS.map((step, i) => (
              <li key={step} className={styles.sellerStep}>
                <span className={styles.sellerStepNum}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Reveal>
  );
}

function Faq() {
  return (
    <Reveal className={[styles.section, styles.faqSection].join(' ')}>
      <div className={styles.faqGrid}>
        <div className={styles.faqMain}>
          <h2 className={styles.h2}>Frequently asked questions</h2>
          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQ}>
                  {item.q}
                  <ChevronDown size={20} />
                </summary>
                <p className={styles.faqA}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
        <aside className={styles.faqHelp}>
          <span className={styles.faqHelpIcon}>
            <Handshake size={24} />
          </span>
          <h3 className={styles.faqHelpTitle}>Still have questions?</h3>
          <p className={styles.faqHelpText}>
            Our support team can help with buying, selling, payments, and delivery. Reach out and we
            will get back to you quickly.
          </p>
          <Link to="/#how-it-works" className={styles.faqHelpButton}>
            See how it works
          </Link>
          <a href="#" className={styles.faqHelpLink}>
            Contact support
          </a>
        </aside>
      </div>
    </Reveal>
  );
}
