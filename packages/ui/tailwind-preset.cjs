/*
 * Tailwind preset shared by apps/web and apps/admin.
 * The single source of truth is docs/design/tailwind-theme.js (owned by ui-ux-designer); this file
 * only adapts it to a Tailwind preset, following the usage note in that file (theme.extend).
 */
const { benbenTheme } = require('../../docs/design/tailwind-theme.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: { extend: benbenTheme },
};
