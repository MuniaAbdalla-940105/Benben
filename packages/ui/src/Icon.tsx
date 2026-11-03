import type { SVGProps } from 'react';

/** Stroke icons from the design system sprite (24px grid, 1.8 stroke). */
const PATHS = {
  back: 'M15 5l-7 7 7 7',
  auction: 'M4 20h16M7 16v-4M12 16V8M17 16V4',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  key: 'M8 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11 12l9-9M17 6l3 3',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  id: 'M3 5h18v14H3zM9 9a2.2 2.2 0 1 0 0 4.4A2.2 2.2 0 0 0 9 9zM6 16a3 3 0 0 1 6 0M14 10h4M14 14h4',
  check: 'M5 12.5l4.5 4.5L19 7',
  alert: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5v5.5M12 16.5v.5',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4',
  clock: 'M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 9v4l2.5 1.5M9 2h6',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
