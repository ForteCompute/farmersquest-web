import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Heart, MapPin, Plus, Sprout, Star } from './icons';
import { useSession } from '@/app/session';
import type { ProductSummary } from '@/services/catalog';
import {
  formatLocation,
  formatProductPrice,
  formatRating,
  stockView,
} from '@/services/productView';
import { useSignInPrompt } from './SignInPrompt';
import styles from './ProductCard.module.css';

// The one reusable product card used on the landing, browse, category, and related rows. Image,
// data-driven badges (verified farmer, featured), location, title, price with unit or contact for
// price, the add control, stock when present, seller, and rating. The whole card opens product
// detail. The heart and add-to-cart are present but gated: signed out, they open the sign-in prompt
// (wishlist and cart persistence land later). All content is real catalog data; nothing is invented.
// When a photo is missing or fails to load we show a clean produce placeholder, never an unrelated
// image.
export interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useSession();
  const { promptSignIn } = useSignInPrompt();
  const [imageFailed, setImageFailed] = useState(false);

  const href = `/product/${product.slug ?? ''}`;
  const location = formatLocation(product.state);
  const price = formatProductPrice(product);
  const stock = stockView(product.stock);
  const rating = formatRating(product.rating?.value, product.rating?.count);
  const verified = product.badges?.verifiedFarmer === true;
  const featured = product.badges?.featured === true;
  const title = product.title ?? 'Untitled product';
  const showImage = Boolean(product.primaryImageUrl) && !imageFailed;

  function gated(reason: string) {
    return (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        promptSignIn(reason);
      }
    };
  }

  return (
    <article className={styles.card}>
      <Link to={href} className={styles.media} aria-label={title}>
        {showImage ? (
          <img
            className={styles.image}
            src={product.primaryImageUrl ?? ''}
            alt={title}
            loading="lazy"
            width={320}
            height={320}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className={styles.imageFallback} aria-hidden="true">
            <Sprout size={40} />
          </span>
        )}
        {(verified || featured) && (
          <span className={styles.badges}>
            {verified && (
              <span className={[styles.badge, styles.badgeVerified].join(' ')}>
                <BadgeCheck size={14} /> Verified
              </span>
            )}
            {featured && (
              <span className={[styles.badge, styles.badgeFeatured].join(' ')}>Featured</span>
            )}
          </span>
        )}
        <button
          type="button"
          className={styles.heart}
          aria-label="Save to wishlist"
          onClick={gated('save this to your wishlist')}
        >
          <Heart size={18} />
        </button>
      </Link>

      <div className={styles.body}>
        {location && (
          <p className={styles.location}>
            <MapPin size={14} /> {location}
          </p>
        )}
        <Link to={href} className={styles.title}>
          {title}
        </Link>
        <div className={styles.priceRow}>
          <span className={styles.price}>{price}</span>
          <button
            type="button"
            className={styles.add}
            aria-label="Add to cart"
            onClick={gated('add this to your cart')}
          >
            <Plus size={18} />
          </button>
        </div>
        {stock && (
          <p className={[styles.stock, styles[`stock_${stock.tone}`]].join(' ')}>{stock.label}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.seller}>
            {product.seller?.avatarUrl ? (
              <img
                className={styles.avatar}
                src={product.seller.avatarUrl}
                alt=""
                loading="lazy"
                width={22}
                height={22}
              />
            ) : (
              <span className={styles.avatarFallback} aria-hidden="true" />
            )}
            <span className={styles.sellerName}>{product.seller?.name ?? 'Farmer'}</span>
          </span>
          {rating && (
            <span className={styles.rating}>
              <Star size={13} /> {rating.value} ({rating.count})
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
