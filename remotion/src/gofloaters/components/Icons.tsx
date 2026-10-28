import React from 'react';

// Simple line icons for the phone UI (drawn here; no third-party or game artwork).
type P = {size?: number; color?: string; stroke?: number};
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconFocus: React.FC<P> = ({size = 28, color = '#111', stroke = 2}) =>
  svg(
    size,
    <g stroke={color} strokeWidth={stroke}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </g>,
  );

export const IconMeeting: React.FC<P> = ({size = 28, color = '#111', stroke = 2}) =>
  svg(
    size,
    <g stroke={color} strokeWidth={stroke}>
      <path d="M3 5h11v7H8l-3 3v-3H3z" />
      <path d="M17 9h4v7h-2v3l-3-3h-5v-2" />
    </g>,
  );

export const IconTeam: React.FC<P> = ({size = 28, color = '#111', stroke = 2}) =>
  svg(
    size,
    <g stroke={color} strokeWidth={stroke}>
      <circle cx="12" cy="8" r="3" />
      <circle cx="5" cy="10" r="2.2" />
      <circle cx="19" cy="10" r="2.2" />
      <path d="M7 20v-1a5 5 0 0 1 10 0v1" />
      <path d="M2 19v-.5A3.5 3.5 0 0 1 6 15" />
      <path d="M22 19v-.5A3.5 3.5 0 0 0 18 15" />
    </g>,
  );

export const IconDesk: React.FC<P> = ({size = 28, color = '#111', stroke = 2}) =>
  svg(
    size,
    <g stroke={color} strokeWidth={stroke}>
      <path d="M2 12h20" />
      <path d="M4 12v8M20 12v8" />
      <path d="M9 12V9l-2-4h5" />
      <rect x="13" y="7" width="6" height="5" rx="1" />
    </g>,
  );

export const IconRoom: React.FC<P> = ({size = 28, color = '#111', stroke = 2}) =>
  svg(
    size,
    <g stroke={color} strokeWidth={stroke}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <circle cx="15" cy="12" r="1" fill={color} />
      <path d="M2 21h20" />
    </g>,
  );

export const IconCabin: React.FC<P> = ({size = 28, color = '#111', stroke = 2}) =>
  svg(
    size,
    <g stroke={color} strokeWidth={stroke}>
      <ellipse cx="12" cy="12" rx="7" ry="3.5" />
      <path d="M12 15.5V20" />
      <circle cx="3.5" cy="9" r="1.5" />
      <circle cx="20.5" cy="9" r="1.5" />
      <circle cx="3.5" cy="16" r="1.5" />
      <circle cx="20.5" cy="16" r="1.5" />
    </g>,
  );

export const Check: React.FC<P> = ({size = 18, color = '#111', stroke = 3}) =>
  svg(size, <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={stroke} />);
