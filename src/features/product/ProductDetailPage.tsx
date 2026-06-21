import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  CircleCheck,
  Heart,
  MapPin,
  ProductRow,
  ShoppingCart,
  Star,
  useAddToCart,
  useSignInPrompt,
} from '@/components/storefront';
import { useSession } from '@/app/session';
import { getProduct, type ProductDetail } from '@/services/catalog';
import {
  formatLocation,
  formatProductPrice,
  formatRating,
  isContactForPrice,
  stockView,
} from '@/services/productView';
import { Gallery } from './Gallery';
import { Reviews } from './Reviews';
import styles from './ProductDetailPage.module.css';

// The product detail page at /product/:slug. Shows the gallery, price, stock, seller, attributes,
// description, reviews, related products, and more from the same farmer, all from the catalog. The
// wishlist and cart actions are gated: signed out they open the sign-in prompt. Loading, not-found
// (404), and error states are handled. No money math: the API supplies price, stock, and rating.
type Status = 'loading' | 'ok' | 'notfound' | 'error';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { isAuthenticated } = useSession();
  const { promptSignIn } = useSignInPrompt();
  const { add, adding, added, error: addError } = useAddToCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void getProduct(slug).then((r) => {
      if (!active) return;
      if (r.ok) {
        setProduct(r.data);
        setStatus('ok');
      } else {
        setStatus(r.notFound ? 'notfound' : 'error');
      }
    });
    return () => {
      active = false;
    };
  }, [slug, reloadTick]);

  function gated(reason: string) {
    return (e: MouseEvent) => {
      e.preventDefault();
      if (!isAuthenticated) promptSignIn(reason);
    };
  }

  // Add to cart: signed out opens the sign-in prompt (in the hook); signed in adds the chosen
  // quantity. The API owns stock and pricing; this only sends the request and shows the outcome.
  function handleAddToCart() {
    if (!product) return;
    void add(product.id ?? '', quantity, 'add this to your cart');
  }

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.top}>
          <div className={['fq-skeleton', styles.gallerySkeleton].join(' ')} />
          <div className={styles.infoSkeleton}>
            <div className={['fq-skeleton', styles.lineWide].join(' ')} />
            <div className={['fq-skeleton', styles.line].join(' ')} />
            <div className={['fq-skeleton', styles.lineWide].join(' ')} />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={styles.page}>
        <div className={styles.state}>
          <h1 className={styles.stateTitle}>Product not found</h1>
          <p>This product may have sold out or been removed.</p>
          <Link to="/browse" className={styles.stateLink}>
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error' || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.state} role="alert">
          <p>We could not load this product right now.</p>
          <button
            type="button"
            className={styles.retry}
            onClick={() => setReloadTick((t) => t + 1)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const title = product.title ?? 'Untitled product';
  const price = formatProductPrice(product);
  const stock = stockView(product.stock);
  const rating = formatRating(product.rating?.value, product.rating?.count);
  const location = formatLocation(product.state);
  const verified = product.badges?.verifiedFarmer === true;
  const contact = isContactForPrice(product);
  const outOfStock = stock?.tone === 'out';
  const attributes = (product.attributes ?? []).filter((a) => a.name && a.value);
  const related = product.relatedProducts ?? [];
  const moreFromFarmer = product.moreFromFarmer ?? [];

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/browse">Browse</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <div className={styles.top}>
        <Gallery images={product.images ?? []} title={title} />

        <div className={styles.info}>
          {(verified || product.badges?.featured) && (
            <div className={styles.badges}>
              {verified && (
                <span className={[styles.badge, styles.badgeVerified].join(' ')}>
                  <BadgeCheck size={14} /> Verified farmer
                </span>
              )}
              {product.badges?.featured && (
                <span className={[styles.badge, styles.badgeFeatured].join(' ')}>Featured</span>
              )}
            </div>
          )}

          <h1 className={styles.title}>{title}</h1>

          <div className={styles.meta}>
            {location && (
              <span className={styles.location}>
                <MapPin size={16} /> {location}
              </span>
            )}
            {rating && (
              <span className={styles.rating}>
                <Star size={16} className={styles.ratingStar} /> {rating.value} ({rating.count})
              </span>
            )}
          </div>

          <p className={styles.price}>{price}</p>
          {stock && (
            <p className={[styles.stock, styles[`stock_${stock.tone}`]].join(' ')}>{stock.label}</p>
          )}

          <div className={styles.actions}>
            {contact ? (
              <button
                type="button"
                className={styles.primary}
                onClick={gated('contact this seller')}
              >
                Contact seller
              </button>
            ) : (
              <>
                {!outOfStock && (
                  <div className={styles.quantity}>
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || adding}
                    >
                      −
                    </button>
                    <span aria-label="Quantity">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={adding}
                    >
                      +
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className={styles.primary}
                  onClick={handleAddToCart}
                  disabled={outOfStock || adding}
                >
                  {added ? <CircleCheck size={18} /> : <ShoppingCart size={18} />}{' '}
                  {outOfStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
                </button>
              </>
            )}
            <button
              type="button"
              className={styles.wishlist}
              onClick={gated('save this to your wishlist')}
              aria-label="Save to wishlist"
            >
              <Heart size={18} /> Save
            </button>
          </div>

          {added && (
            <p className={styles.cartNote} role="status">
              Added to your cart.{' '}
              <Link to="/checkout" className={styles.cartNoteLink}>
                View cart
              </Link>
            </p>
          )}
          {addError && (
            <p className={styles.cartError} role="alert">
              {addError}
            </p>
          )}

          <div className={styles.seller}>
            {product.seller?.avatarUrl ? (
              <img
                className={styles.sellerAvatar}
                src={product.seller.avatarUrl}
                alt=""
                loading="lazy"
                width={44}
                height={44}
              />
            ) : (
              <span className={styles.sellerAvatarFallback} aria-hidden="true" />
            )}
            <div>
              <p className={styles.sellerName}>
                {product.seller?.name ?? 'Farmer'}
                {product.seller?.verified && (
                  <BadgeCheck size={15} className={styles.sellerVerified} aria-label="Verified" />
                )}
              </p>
              {product.farmName && <p className={styles.farmName}>{product.farmName}</p>}
            </div>
          </div>

          {attributes.length > 0 && (
            <dl className={styles.attributes}>
              {attributes.map((attr) => (
                <div key={attr.name} className={styles.attribute}>
                  <dt className={styles.attrName}>{attr.name}</dt>
                  <dd className={styles.attrValue}>{attr.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {product.description && (
        <section className={styles.description} aria-labelledby="description-heading">
          <h2 className={styles.sectionHeading} id="description-heading">
            Description
          </h2>
          <p className={styles.descriptionText}>{product.description}</p>
        </section>
      )}

      <Reviews
        slug={product.slug ?? slug}
        ratingValue={product.rating?.value ?? null}
        ratingCount={product.rating?.count ?? null}
      />

      {related.length > 0 && (
        <div className={styles.relatedRow}>
          <ProductRow title="Related products" products={related} />
        </div>
      )}
      {moreFromFarmer.length > 0 && (
        <div className={styles.relatedRow}>
          <ProductRow
            title={`More from ${product.farmName ?? product.seller?.name ?? 'this farmer'}`}
            products={moreFromFarmer}
          />
        </div>
      )}
    </div>
  );
}
