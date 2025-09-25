export const THEME_COLORS = {
  light:       { bg: '#f3f4f6', text: '#111827', surface: '#ffffff', primary: '#4f46e5' },
  dark:        { bg: '#111827', text: '#e5e7eb', surface: '#1f2937', primary: '#60a5fa' },
  cupcake:     { bg: '#fdf2f8', text: '#3d2c2e', surface: '#ffffff', primary: '#ef9fbc' },
  bumblebee:   { bg: '#fff8c5', text: '#1f2937', surface: '#fff1a6', primary: '#f59e0b' },
  emerald:     { bg: '#ecfdf5', text: '#064e3b', surface: '#a7f3d0', primary: '#10b981' },
  corporate:   { bg: '#e5e7eb', text: '#111827', surface: '#ffffff', primary: '#4b6bfb' },
  synthwave:   { bg: '#2b1a4a', text: '#f9a8d4', surface: '#3b1c6e', primary: '#ff00ea' },
  retro:       { bg: '#faf4d3', text: '#3f3a22', surface: '#efe4a1', primary: '#ef4444' },
  cyberpunk:   { bg: '#fffbeb', text: '#111827', surface: '#fde68a', primary: '#06b6d4' },
  valentine:   { bg: '#ffe4e6', text: '#831843', surface: '#fecdd3', primary: '#db2777' },
  halloween:   { bg: '#1f2937', text: '#f59e0b', surface: '#111827', primary: '#f97316' },
  garden:      { bg: '#ecfccb', text: '#14532d', surface: '#bbf7d0', primary: '#84cc16' },
  forest:      { bg: '#052e16', text: '#e2e8f0', surface: '#064e3b', primary: '#22c55e' },
  aqua:        { bg: '#e0f2fe', text: '#0c4a6e', surface: '#bae6fd', primary: '#06b6d4' },
  lofi:        { bg: '#f5f5f4', text: '#111827', surface: '#e7e5e4', primary: '#111827' },
  pastel:      { bg: '#f1f5f9', text: '#111827', surface: '#e2e8f0', primary: '#6366f1' },
  fantasy:     { bg: '#f5e1ff', text: '#3b0764', surface: '#e9d5ff', primary: '#7c3aed' },
  wireframe:   { bg: '#ffffff', text: '#111827', surface: '#f3f4f6', primary: '#000000' },
  black:       { bg: '#000000', text: '#f3f4f6', surface: '#111111', primary: '#ffffff' },
  luxury:      { bg: '#0b0b0b', text: '#d4af37', surface: '#1a1a1a', primary: '#d4af37' },
  dracula:     { bg: '#282a36', text: '#f8f8f2', surface: '#44475a', primary: '#bd93f9' },
  cmyk:        { bg: '#e5e7eb', text: '#111827', surface: '#ffffff', primary: '#06b6d4' },
  autumn:      { bg: '#fff7ed', text: '#7c2d12', surface: '#fed7aa', primary: '#f97316' },
  business:    { bg: '#111827', text: '#e5e7eb', surface: '#1f2937', primary: '#2563eb' },
  acid:        { bg: '#f0fdf4', text: '#052e16', surface: '#bbf7d0', primary: '#22c55e' },
  lemonade:    { bg: '#fef9c3', text: '#1f2937', surface: '#fde68a', primary: '#f59e0b' },
  night:       { bg: '#0b1020', text: '#e5e7eb', surface: '#111827', primary: '#60a5fa' },
  coffee:      { bg: '#3f2d20', text: '#f5f5f4', surface: '#4b3626', primary: '#d6b16d' },
  winter:      { bg: '#eef2ff', text: '#111827', surface: '#e0e7ff', primary: '#60a5fa' },
};

export function applyThemeGlobally(themeName) {
  const t = THEME_COLORS[themeName] || THEME_COLORS.light;
  const root = document.documentElement;
  // CSS variables used by index.css across all pages
  root.style.setProperty('--app-bg', t.bg);
  root.style.setProperty('--app-text', t.text);
  root.style.setProperty('--app-surface', t.surface);
  root.style.setProperty('--app-primary', t.primary);
  // Also keep DaisyUI data-theme for components using tokens
  root.setAttribute('data-theme', themeName);
}


