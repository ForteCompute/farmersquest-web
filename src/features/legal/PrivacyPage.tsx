import { config } from '@/services/config';
import { LegalPage, type LegalSection } from './LegalPage';

// Plain-language Privacy Policy for the marketplace MVP. Content is summary guidance, not a
// substitute for the final legal text, which the business will supply.
const SECTIONS: LegalSection[] = [
  {
    heading: '1. Information we collect',
    body: [
      'Account details you give us, such as your name, email, and password. For farmers, the identity details needed for verification, including your National Identification Number.',
      'Information about how you use the service, so we can keep it secure and improve it.',
    ],
  },
  {
    heading: '2. How we use your information',
    body: [
      'To create and run your account, process orders, verify farmers, prevent fraud, and provide support. We do not sell your personal information.',
    ],
  },
  {
    heading: '3. Sharing',
    body: [
      'We share only what is needed to provide the service, for example delivery details with the other party to an order, and with providers who help us operate (such as payments), under appropriate safeguards.',
    ],
  },
  {
    heading: '4. Keeping your data safe',
    body: [
      'Sensitive details such as your National Identification Number are protected in the backend and are never exposed in this website. We take reasonable measures to protect your information.',
    ],
  },
  {
    heading: '5. Your rights',
    body: [
      'You can access and update your profile in the app, and ask us to correct or delete your information, subject to legal requirements.',
    ],
  },
  {
    heading: '6. Changes',
    body: [
      'We may update this policy as the service grows. We will post the current version here and, where appropriate, let you know of significant changes.',
    ],
  },
];

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what ${config.appName} collects, how we use it, and the choices you have.`}
      sections={SECTIONS}
    />
  );
}
