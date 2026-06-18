import { useEffect, useState } from 'react';
import { Sprout } from '@/components/storefront';
import styles from './Gallery.module.css';

// Product image gallery: a large main image with a thumbnail strip. Selecting a thumbnail swaps the
// main image. Falls back to a clean produce placeholder when an image is missing or fails to load,
// never an unrelated image. Image-only, so it is aria-hidden; the title carries the accessible name.
export interface GalleryProps {
  images: string[];
  title: string;
}

export function Gallery({ images, title }: GalleryProps) {
  const usable = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  // Reset when the product (its image set) changes.
  useEffect(() => {
    setActive(0);
    setFailed({});
  }, [images]);

  const current = usable[active];
  const showImage = Boolean(current) && !failed[active];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        {showImage ? (
          <img
            className={styles.mainImage}
            src={current}
            alt={title}
            width={640}
            height={640}
            onError={() => setFailed((f) => ({ ...f, [active]: true }))}
          />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            <Sprout size={64} />
          </span>
        )}
      </div>

      {usable.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="Product images">
          {usable.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Image ${i + 1} of ${usable.length}`}
              className={[styles.thumb, i === active ? styles.thumbActive : ''].join(' ')}
              onClick={() => setActive(i)}
            >
              {failed[i] ? (
                <span className={styles.thumbPlaceholder} aria-hidden="true">
                  <Sprout size={20} />
                </span>
              ) : (
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  width={80}
                  height={80}
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
