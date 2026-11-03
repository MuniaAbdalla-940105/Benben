import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('@benben/ui/tailwind-preset')],
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};
