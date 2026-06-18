// Storefront iconography. We use lucide-react (ISC licensed, a consistent outline set in the same
// visual weight as our design system) for every storefront surface: header, product and category
// cards, how it works, value cards, the footer social links, and the bottom tab bar. One set, no
// repeated placeholder glyphs.
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleCheck,
  Handshake,
  Heart,
  Home,
  Leaf,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  Truck,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';

export {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleCheck,
  Handshake,
  Heart,
  Home,
  Leaf,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  Truck,
  User,
  X,
};
export type { LucideIcon };

// Social brand marks. lucide-react dropped brand logos (trademark reasons), so we keep small,
// recognisable brand glyphs here rather than pull in a second icon dependency. They take the same
// `size` prop shape as the lucide icons so usage stays uniform.
interface BrandProps {
  size?: number;
}

export function BrandFacebook({ size = 18 }: BrandProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export function BrandX({ size = 18 }: BrandProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26L22.86 21.75h-6.66l-5.22-6.82-5.97 6.82H1.7l7.73-8.84L1.14 2.25h6.83l4.71 6.23 5.56-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z" />
    </svg>
  );
}

export function BrandLinkedin({ size = 18 }: BrandProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
