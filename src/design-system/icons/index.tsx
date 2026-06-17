import type { SVGProps } from 'react';

// Outline icons in the feather / Iconpark style the design spec calls for: 24x24 viewBox, no fill,
// 2px strokes in currentColor so they inherit text colour. Brand marks (Google, Facebook) and the
// Nigeria flag are the deliberate exceptions, since those carry fixed brand colours.
//
// Icons live in the design system so every client draws them the same way; features never inline
// raw SVG. Each icon is decorative by default (aria-hidden); pass a title/role from the caller when
// an icon needs to be announced.

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Pixel size for both width and height. Defaults to 20 (the inline-with-text size). */
  size?: number;
}

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 6 9 6 9-6" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <circle cx="12" cy="15.5" r="1.2" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M1.8 12S5 5.5 12 5.5 22.2 12 22.2 12 19 18.5 12 18.5 1.8 12 1.8 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.9 5.7A9.9 9.9 0 0 1 12 5.5c7 0 10.2 6.5 10.2 6.5a17 17 0 0 1-3.2 4.1M6.5 7.4A16.7 16.7 0 0 0 1.8 12S5 18.5 12 18.5a9.6 9.6 0 0 0 4-.85" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3 3 18 18" />
    </svg>
  );
}

export function IdCardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8" cy="11" r="2" />
      <path d="M5 16c.5-1.6 1.7-2.4 3-2.4s2.5.8 3 2.4" />
      <path d="M14.5 10h4M14.5 13h4" />
    </svg>
  );
}

export function UserCheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.7-3 2.9-4.6 5.5-4.6 1.3 0 2.5.4 3.5 1.1" />
      <path d="m15.5 15 2 2 3.5-3.6" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 13.5 4.7 8a2 2 0 0 1 1.9-1.4h10.8A2 2 0 0 1 19.3 8L21 13.5" />
      <path d="M3 13.5h18V18a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <circle cx="7" cy="16" r="0.6" />
      <circle cx="17" cy="16" r="0.6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8.5h2.2l1.3-2h8.9l1.3 2H20a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z" />
      <circle cx="12" cy="13.5" r="3.2" />
      <path d="M18.5 6.5v3M20 8h-3" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4.5 9.5-10" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.4 2.4 4.6-4.8" />
    </svg>
  );
}

// Brand marks: fixed colours, so they do not take currentColor. Sized like the outline icons.
export function GoogleLogo({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable={false} {...rest}>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.66-.06-1.29-.17-1.9H12v3.6h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.22Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.6A10 10 0 0 0 12 22Z"
      />
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8v-2.6H3.06a10 10 0 0 0 0 9l3.34-2.6Z" />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.86-2.86C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.06 7.5l3.34 2.6C7.19 7.72 9.4 5.96 12 5.96Z"
      />
    </svg>
  );
}

export function FacebookLogo({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable={false} {...rest}>
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.1 12.5h-2v6.4h-2.6v-6.4H9.1V10.3h1.4V8.9c0-1.7.8-2.8 2.9-2.8h1.7v2.1h-1c-.8 0-.9.3-.9.9v1.2h1.9l-.3 2.2Z"
      />
    </svg>
  );
}

// The Nigeria flag for the +234 dialling prefix on the phone step: green, white, green vertical
// bands. Decorative (the "+234" text carries the meaning).
export function NigeriaFlag({ size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={Math.round((size * 3) / 2)}
      height={size}
      viewBox="0 0 24 16"
      aria-hidden
      focusable={false}
      {...rest}
    >
      <rect width="24" height="16" rx="2" fill="#fff" />
      <rect width="8" height="16" fill="#008751" />
      <rect x="16" width="8" height="16" fill="#008751" />
    </svg>
  );
}
