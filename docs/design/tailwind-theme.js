/*
 * BEN-BEN Tailwind theme mapping, v1.0 (2026-11-03)
 * Every value points at a CSS variable from docs/design/tokens.css (which imports docs/design/brand/tokens.css),
 * so light, dark and the live stage switch by changing the variables, not the class names.
 *
 * Use in the app (tailwind.config.ts):   import { benbenTheme } from './design/tailwind-theme.js'
 *                                         export default { content: [...], theme: { extend: benbenTheme } }
 * Use in prototypes (Tailwind CDN 3.4.17): <script src="https://cdn.tailwindcss.com/3.4.17"></script>
 *                                         <script src="../tailwind-theme.js"></script>
 *
 * Semantic colours have no opacity channel on purpose: use the *-tint tokens instead of bg-ok/10.
 */
(function (root) {
  var v = function (name) { return 'var(--' + name + ')'; };
  var benbenTheme = {
    colors: {
      // semantic roles (preferred in components)
      bg: v('ds-bg'),
      surface: { DEFAULT: v('ds-surface'), 2: v('ds-surface-2'), 3: v('ds-surface-3') },
      line: { DEFAULT: v('ds-line'), strong: v('ds-line-strong') },
      ink: { DEFAULT: v('ds-ink'), muted: v('ds-ink-muted'), disabled: v('ds-ink-disabled') },
      primary: { DEFAULT: v('ds-primary'), hover: v('ds-primary-hover'), on: v('ds-on-primary') },
      accent: { DEFAULT: v('ds-accent'), text: v('ds-accent-text'), tint: v('ds-accent-tint') },
      focus: v('ds-focus'),
      live: { DEFAULT: v('ds-live'), on: v('ds-on-live') },
      ok: { DEFAULT: v('ds-ok'), tint: v('ds-ok-tint') },
      warn: { DEFAULT: v('ds-warn'), tint: v('ds-warn-tint') },
      danger: { DEFAULT: v('ds-danger'), tint: v('ds-danger-tint') },
      scrim: v('ds-scrim'),
      // raw brand palette (brand/tokens.css), for illustrations and the stage only
      navy: { 950: v('bb-navy-950'), 900: v('bb-navy-900'), 800: v('bb-navy-800'), 700: v('bb-navy-700') },
      charcoal: { 900: v('bb-charcoal-900') },
      gold: { 300: v('bb-gold-300'), 500: v('bb-gold-500'), 600: v('bb-gold-600'), 700: v('bb-gold-700') },
      ivory: { 50: v('bb-ivory-50'), 100: v('bb-ivory-100'), 200: v('bb-ivory-200') },
      stone: { 100: v('bb-stone-100'), 300: v('bb-stone-300'), 500: v('bb-stone-500'), 600: v('bb-stone-600'), 700: v('bb-stone-700'), 900: v('bb-stone-900') },
      white: '#FFFFFF',
      transparent: 'transparent',
      current: 'currentColor'
    },
    fontFamily: {
      text: ['IBM Plex Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
      display: ['Readex Pro', 'IBM Plex Sans Arabic', 'Inter', 'sans-serif'],
      latin: ['Inter', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      num: ['Inter', 'system-ui', 'sans-serif'],
      brand: ['Outfit', 'system-ui', 'sans-serif']
    },
    fontSize: {
      xs: [v('ds-text-xs'), { lineHeight: v('ds-lh-xs') }],
      sm: [v('ds-text-sm'), { lineHeight: v('ds-lh-sm') }],
      base: [v('ds-text-body'), { lineHeight: v('ds-lh-body') }],
      h3: [v('ds-text-h3'), { lineHeight: v('ds-lh-h3'), fontWeight: '600' }],
      h2: [v('ds-text-h2'), { lineHeight: v('ds-lh-h2'), fontWeight: '600' }],
      h1: [v('ds-text-h1'), { lineHeight: v('ds-lh-h1'), fontWeight: '600' }],
      display: [v('ds-text-display'), { lineHeight: v('ds-lh-display'), fontWeight: '600' }],
      'num-sm': [v('ds-num-sm'), { lineHeight: '1.3' }],
      'num-md': [v('ds-num-md'), { lineHeight: '1.2' }],
      'num-lg': [v('ds-num-lg'), { lineHeight: '1.1' }],
      'num-xl': [v('ds-num-xl'), { lineHeight: '1.1' }]
    },
    borderRadius: {
      none: '0', sm: v('ds-radius-sm'), md: v('ds-radius-md'), lg: v('ds-radius-lg'),
      xl: v('ds-radius-xl'), sheet: v('ds-radius-sheet'), full: v('ds-radius-pill')
    },
    boxShadow: {
      none: 'none', card: v('ds-shadow-card'), raised: v('ds-shadow-raised'),
      sheet: v('ds-shadow-sheet'), toast: v('ds-shadow-toast')
    },
    spacing: { target: v('ds-target'), 'target-bid': v('ds-target-bid'), 'bottom-nav': v('ds-bottom-nav') },
    minHeight: { target: v('ds-target'), 'target-bid': v('ds-target-bid') },
    minWidth: { target: v('ds-target') },
    transitionDuration: { fast: '120ms', base: '200ms', slow: '320ms' },
    transitionTimingFunction: { standard: 'cubic-bezier(.2,0,0,1)', exit: 'cubic-bezier(.3,0,1,1)' },
    screens: { md: '768px', xl: '1280px' }
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = { benbenTheme: benbenTheme }; }
  if (typeof root !== 'undefined' && root) {
    root.benbenTheme = benbenTheme;
    // Prototype mode: configure the Tailwind CDN. `colors` replaces the default palette on purpose,
    // so prototypes cannot use off-system colours.
    var ext = {};
    for (var k in benbenTheme) { if (k !== 'colors' && k !== 'fontSize' && k !== 'borderRadius' && k !== 'boxShadow' && k !== 'screens') ext[k] = benbenTheme[k]; }
    root.tailwind = root.tailwind || {};
    root.tailwind.config = {
      theme: {
        colors: benbenTheme.colors,
        fontSize: benbenTheme.fontSize,
        borderRadius: benbenTheme.borderRadius,
        boxShadow: benbenTheme.boxShadow,
        screens: benbenTheme.screens,
        extend: ext
      }
    };
  }
})(typeof window !== 'undefined' ? window : undefined);
