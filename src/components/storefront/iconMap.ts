// Icon mappings kept separate from the icon components so the components file can stay
// component-only (keeps React Fast Refresh happy). One clear icon per category, plus the mapping
// for the static landing content keys. All icons are from lucide-react, our single storefront set.
import {
  Apple,
  Bean,
  Beef,
  Carrot,
  CircleCheck,
  Egg,
  Fish,
  Handshake,
  Leaf,
  PawPrint,
  Salad,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Truck,
  Wheat,
  type LucideIcon,
} from 'lucide-react';

// Each category gets its own clear icon. Keyed by slug, with a sensible fallback so any new
// category still gets a real icon, never a repeated placeholder.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  crops: Sprout,
  grains: Wheat,
  tubers: Carrot,
  vegetables: Salad,
  fruits: Apple,
  legumes: Bean,
  livestock: Beef,
  poultry: Egg,
  cattle: Beef,
  'goats-sheep': PawPrint,
  fish: Fish,
};

export function categoryIcon(slug: string | null | undefined): LucideIcon {
  return (slug && CATEGORY_ICONS[slug]) || Leaf;
}

// Maps the static-content icon keys (landing how-it-works and value cards) to real icons.
export const CONTENT_ICONS: Record<string, LucideIcon> = {
  search: Search,
  shield: ShieldCheck,
  truck: Truck,
  check: CircleCheck,
  handshake: Handshake,
  trending: TrendingUp,
};
