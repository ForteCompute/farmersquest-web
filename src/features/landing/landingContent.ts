// Static landing content in one place: our own marketing wording, not API data and not invented
// facts. Product rows, categories, and counts are live catalog data and never live here. The
// stats medallions, testimonials, and leadership sections from the Figma frame are intentionally
// left out until we have real values and real content.

// A short, controlled list of popular search terms for the hot-search chips. Kept here, not typed
// into the page, so it is easy to change. Later this can come from real top searches.
export const HOT_SEARCHES = [
  'Maize',
  'Broilers',
  'Catfish',
  'Tomatoes',
  'Rice',
  'Goats',
  'Eggs',
  'Yam',
];

// The four buyer-protection steps, exact wording confirmed in the design.
export const HOW_IT_WORKS = [
  {
    icon: 'search',
    title: 'Find and order',
    text: 'Browse verified farmers, compare prices, and place your order in minutes.',
  },
  {
    icon: 'shield',
    title: 'Secure payment',
    text: 'Your payment is held safely and is not released until you confirm your order.',
  },
  {
    icon: 'truck',
    title: 'Delivery',
    text: 'The farmer prepares and ships your order, and you track it to your door.',
  },
  {
    icon: 'check',
    title: 'Confirm and release',
    text: 'Confirm you are satisfied and the farmer is paid. If something is wrong, you can raise a dispute.',
  },
] as const;

// The four value cards, our wording, matching the Figma frame's intent.
export const VALUE_CARDS = [
  {
    icon: 'handshake',
    title: 'Direct buyer connections',
    text: 'Skip the middlemen and deal directly with processors, hotels, and bulk buyers near you.',
  },
  {
    icon: 'shield',
    title: 'Verified trades',
    text: 'Every order is protected. Payment is held in escrow until the buyer confirms delivery.',
  },
  {
    icon: 'truck',
    title: 'Smart logistics',
    text: 'Get your produce to the market faster with planned, reliable delivery.',
  },
  {
    icon: 'trending',
    title: 'Price transparency',
    text: 'See real prices across the states so you always trade at a fair value.',
  },
] as const;

// Designed for the Nigerian farmer, our wording and benefit points.
export const FARMER_POINTS = [
  'Reach buyers in every state',
  'Get paid after the buyer confirms delivery',
  'List your produce for free, in minutes',
];

// Become a seller benefits.
export const SELLER_BENEFITS = [
  'Free to list your produce',
  'Reach buyers nationwide',
  'Get paid after delivery',
  'Dedicated seller support',
];

// FAQ, our own plain answers grounded only in the buyer-protection promise and the selling flow.
export const FAQ = [
  {
    q: 'What is FarmersQuest?',
    a: 'A marketplace where buyers across Nigeria order crops and livestock directly from verified farmers, with payment protection on every order.',
  },
  {
    q: 'How do I sell my produce on FarmersQuest?',
    a: 'Create a seller account, complete a short verification, and list your produce with a price and unit. Buyers can then find and order it.',
  },
  {
    q: 'How do buyers place orders?',
    a: 'Browse or search, open a product, and place an order. Your payment is held safely until you confirm the order has arrived.',
  },
  {
    q: 'Is there a fee to use FarmersQuest?',
    a: 'Listing your produce is free. A fee applies only when you make a sale.',
  },
  {
    q: 'How does FarmersQuest keep trades safe?',
    a: 'Farmers are verified, payment is held until you confirm delivery, and you can raise a dispute if something is wrong.',
  },
];
