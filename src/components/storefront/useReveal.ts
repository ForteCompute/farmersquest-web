import { useEffect, useRef, useState } from 'react';

// Reveal-on-scroll: returns a ref to attach to a section and whether it has entered the viewport.
// Pair with the .fq-reveal class and data-revealed attribute (see motion.css). Reveals once, then
// stops observing. Respects reduced motion by revealing immediately. SSR and no-IntersectionObserver
// environments also reveal immediately so content is never hidden.
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (revealed || !node) {
      return;
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  return { ref, revealed };
}
