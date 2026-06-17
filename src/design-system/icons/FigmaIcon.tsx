import emailUrl from './assets/email.svg';
import passwordUrl from './assets/password.svg';
import eyeSlashUrl from './assets/eye-slash.svg';
import googleUrl from './assets/google.svg';
import facebookUrl from './assets/facebook.svg';
import penUrl from './assets/pen.svg';
import verifiedUrl from './assets/verified.svg';
import passwordOutlineUrl from './assets/password-outline.svg';
import chevronUrl from './assets/chevron.svg';
import bellUrl from './assets/bell.svg';
import supportUrl from './assets/support.svg';
import logoutUrl from './assets/logout.svg';
import personUrl from './assets/person.svg';

// Real icons exported from the Figma file (the same iconpark / boxicons / mdi / logos assets the
// frames use), served as committed SVG files. Each keeps the exact artwork and colour from the
// frame, so they replace the earlier hand-drawn approximations. Decorative by default (alt="").
const ASSETS = {
  email: emailUrl,
  password: passwordUrl,
  'eye-slash': eyeSlashUrl,
  google: googleUrl,
  facebook: facebookUrl,
  pen: penUrl,
  verified: verifiedUrl,
  'password-outline': passwordOutlineUrl,
  chevron: chevronUrl,
  bell: bellUrl,
  support: supportUrl,
  logout: logoutUrl,
  person: personUrl,
} as const;

export type FigmaIconName = keyof typeof ASSETS;

export interface FigmaIconProps {
  name: FigmaIconName;
  /** Pixel size for both width and height. */
  size?: number;
  className?: string;
  /** Accessible label. Leave empty for decorative icons (default). */
  alt?: string;
}

export function FigmaIcon({ name, size = 24, className, alt = '' }: FigmaIconProps) {
  return (
    <img
      src={ASSETS[name]}
      width={size}
      height={size}
      className={className}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      draggable={false}
    />
  );
}
