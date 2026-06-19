import { config } from '@/services/config';
import { LegalPage, type LegalSection } from './LegalPage';

// Plain-language Terms of Service for the marketplace MVP. Content is summary guidance, not a
// substitute for the final legal text, which the business will supply.
const SECTIONS: LegalSection[] = [
  {
    heading: '1. Accepting these terms',
    body: [
      `By creating an account or using ${config.appName}, you agree to these terms. If you do not agree, please do not use the service.`,
    ],
  },
  {
    heading: '2. Your account',
    body: [
      'You are responsible for the information you provide and for keeping your password safe. Tell us straight away if you think someone else is using your account.',
      'Farmers complete identity verification before they can sell. We may limit or suspend accounts that break these terms.',
    ],
  },
  {
    heading: '3. Buying and selling',
    body: [
      'Farmers are responsible for the listings they post, including descriptions, prices, and availability. Buyers are responsible for the orders they place.',
      `${config.appName} is a marketplace that connects buyers and farmers. We are not the seller of the produce listed.`,
    ],
  },
  {
    heading: '4. Payments',
    body: [
      'Payment for an order is held and released to the farmer after the buyer confirms delivery. Fees, payouts, and any commission are shown before you confirm and are calculated by us, not on this website.',
    ],
  },
  {
    heading: '5. Acceptable use',
    body: [
      'Do not post false, unlawful, or misleading listings, attempt to defraud other users, or interfere with the service. We may remove content and accounts that do.',
    ],
  },
  {
    heading: '6. Liability',
    body: [
      'The service is provided as is. To the extent the law allows, we are not liable for losses outside our reasonable control. Nothing here limits rights you have under Nigerian law.',
    ],
  },
  {
    heading: '7. Changes',
    body: [
      'We may update these terms as the service grows. We will post the current version here and, where appropriate, let you know of significant changes.',
    ],
  },
];

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms explain the rules for using ${config.appName}. Please read them before you buy or sell.`}
      sections={SECTIONS}
    />
  );
}
