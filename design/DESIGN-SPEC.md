# FarmersQuest Design Spec (from the Figma export)

This is the single source of truth for the look of every screen. It is taken directly from the exported Figma frames (the 90 screen set). Build the design system and every screen to match these frames exactly: the same colours, type, spacing, radii, and components. Do not invent or approximate. When a screen exists in the Figma, match that frame. The reference frames live in `design/figma/` in this repo.

These values were reconciled against the live Figma file and corrected where earlier PNG-derived notes were wrong: the brand family is Nunito (not Poppins), input radius is 10px (not 12), control heights are 46px inputs / 48px buttons (not 52), page padding is about 26px (not 16), body text is `#1E1E1E` and secondary text `#808080`. The live file is the source of truth.

Brand note to confirm with the team: the frames carry the wordmark "Naija AgriHub". Keep the exact layout and theme either way; only the wordmark and logo may be swapped to FarmersQuest if the team decides. Do not change anything else.

## Colours (exact, sampled from the frames)

Greens

- Primary deep green: `#003C00` (top bar wordmark, bottom nav bar, headings on light, profile header)
- Button green: `#006400` (primary buttons such as Continue and Sell, focused input border)
- Action green: `#008000` (add button, filter button, prices, links, "See All")
- Deepest green: `#002300` (deep shadow accents)

Surfaces

- App background: `#FFFFFF`
- Light green surface: `#E6F0E6` (cards, profile sections)
- Lighter green surface: `#EBF3EB` (home background, product card background)
- Warm neutral surface: `#F4F4F0` (product detail background)

Neutrals and text

- Input fill / divider: `#DDDDDD` (lighter variant `#E9E9E9`)
- Muted green border / disabled: `#B0CFB0` (lighter `#A6C9A6`)
- Secondary text / labels / placeholder: `#808080` (lighter `#B8B8B8`)
- Body text: `#1E1E1E` (near-black)
- Text on green: `#FFFFFF`

Semantic

- Price and positive: `#008000`
- Wishlist active heart and notification dot: red `#E23B3B`

## Typography

- Family: Nunito (rounded humanist sans, OFL licensed), with a system sans fallback. Weights used: regular 400, medium 500, semibold 600, bold 700.
- Page heading: 24px, bold (for example "Sign In To Your Account", "Create Your Account").
- Section heading: 20px, bold (for example "Categories", "All Listings").
- Body and inputs: 16px, regular.
- Button label: 18px, bold, white.
- Label / caption / subtitle: 12px (secondary colour).
- Fine print (for example terms): 10px, semibold, secondary colour.
- Currency shown as Naira, for example `₦80,000`.

## Shape and spacing

- Corner radius: 10px on inputs, buttons, cards, and search; rounded squares (about 14px) on category chips; 8 to 10px on images.
- Circular: add button, top-bar icon buttons (heart, bell), social buttons.
- Control height: 46px for inputs, 48px for primary buttons.
- Page padding: about 26px. Gaps: about 24px between stacked fields. Two-column product grid with about 12px gutter.
- Mobile-first at 402px wide. Web scales these up on a wider canvas; keep the same system.

## Components (match the frames)

- Input: filled `#DDDDDD`, radius 10px, 46px tall, left icon, grey placeholder, focus shows a `#006400` border. Password field has a show/hide eye on the right.
- Primary button: `#006400`, white bold label, radius 10px, full width, 48px tall. Disabled is the same green at 35% opacity.
- Action button: circular `#008000` with a white plus, used to add a listing to cart.
- Filter button: rounded square `#008000` with a white icon, beside the search bar.
- Link: `#008000`, underlined (for example "Forgot Password?", "See All", "Sign-In Instead").
- Checkbox: square, green check.
- Category chip: white rounded-square card with a green border, an image, and a label below.
- Product card: background `#EBF3EB`, radius 10px, product image, small grey category label, bold name, green bold price, small grey unit (for example "Per basket"), a heart at top-right, and a green circular plus at bottom-right.
- Top bar: location with a pin icon on the left; circular heart and bell buttons on the right (bell has a red dot).
- Bottom navigation: solid `#003C00` bar with five tabs (Home, Cart, Order, Messages, Profile), white icons and labels, the active tab inside a white rounded container.
- Icons: outline style, consistent weight (Iconpark or feather style).

## Screen inventory mapped to our build

Match each of these to its Figma frame when the feature is built.

- Onboarding and splash: ONBOARDING (1 to 4), SPLASH SCREEN.
- Accounts (Sprint 2): CREATE ACCOUNT (and 1 to 5), SIGN IN (and 1 to 3), FORGOT PASSWORD (and 1 to 9), PROFILE (and 1).
- Discovery and catalog (Sprint 3): BUYER'S HOMEPAGE, SEARCH, PRODUCT DETAILS, WISHLIST, GRID, category chips.
- Farmer listings (Sprint 3): MY LISTINGS, SELL (and 1 to 5).
- Cart and orders (Sprint 4): CART, ORDER (and 1), PAYMENT SUCCESS.
- Messaging (Sprint 5): MESSAGE INBOX, MESSAGE CHAT (and 1), notifications: NOTIFICATION (and 1, 2).

## In the Figma but not in our build scope (coming soon, design only)

Do not build these now; they are future features. Keep them out of the foundation.

- Wallet: WALLET (and 1, 2), FUND (and 1 to 4), WITHDRAW.
- In-app calling: CALL INTERFACE (and 1 to 3).
- Market prices: MARKET PRICES (and 1).

## How to use this

1. Build the shared design tokens (colours, type, spacing, radii) in farmersquest-web exactly as above. This is the one source of truth; back office and mobile reuse it.
2. Build the core components above to match the frames.
3. For every feature screen, open its frame in `design/figma/` and reproduce it faithfully on these tokens, web sized up from the mobile frame, mobile matching it directly.
4. If anything in a frame is unclear or conflicts with this spec, ask before guessing.
