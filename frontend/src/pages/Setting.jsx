import React, { useEffect, useMemo, useState } from 'react'
import { applyThemeGlobally } from '../lib/theme.js'

const Setting = () => {
  const themes = useMemo(() => [
    "light","dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","autumn","business","acid","lemonade","night","coffee","winter"
  ], []);

  const [theme, setTheme] = useState('bumblebee');

  const getThemeColors = (name) => {
    const map = {
      light:       { bg: '#f3f4f6', text: '#111827', nav: '#ffffff' },
      dark:        { bg: '#111827', text: '#e5e7eb', nav: '#1f2937' },
      cupcake:     { bg: '#fdf2f8', text: '#3d2c2e', nav: '#ffffff' },
      bumblebee:   { bg: '#fff8c5', text: '#1f2937', nav: '#fff1a6' },
      emerald:     { bg: '#ecfdf5', text: '#064e3b', nav: '#a7f3d0' },
      corporate:   { bg: '#e5e7eb', text: '#111827', nav: '#ffffff' },
      synthwave:   { bg: '#2b1a4a', text: '#f9a8d4', nav: '#3b1c6e' },
      retro:       { bg: '#faf4d3', text: '#3f3a22', nav: '#efe4a1' },
      cyberpunk:   { bg: '#fffbeb', text: '#111827', nav: '#fde68a' },
      valentine:   { bg: '#ffe4e6', text: '#831843', nav: '#fecdd3' },
      halloween:   { bg: '#1f2937', text: '#f59e0b', nav: '#111827' },
      garden:      { bg: '#ecfccb', text: '#14532d', nav: '#bbf7d0' },
      forest:      { bg: '#052e16', text: '#e2e8f0', nav: '#064e3b' },
      aqua:        { bg: '#e0f2fe', text: '#0c4a6e', nav: '#bae6fd' },
      lofi:        { bg: '#f5f5f4', text: '#111827', nav: '#e7e5e4' },
      pastel:      { bg: '#f1f5f9', text: '#111827', nav: '#e2e8f0' },
      fantasy:     { bg: '#f5e1ff', text: '#3b0764', nav: '#e9d5ff' },
      wireframe:   { bg: '#ffffff', text: '#111827', nav: '#f3f4f6' },
      black:       { bg: '#000000', text: '#f3f4f6', nav: '#111111' },
      luxury:      { bg: '#0b0b0b', text: '#d4af37', nav: '#1a1a1a' },
      dracula:     { bg: '#282a36', text: '#f8f8f2', nav: '#44475a' },
      cmyk:        { bg: '#e5e7eb', text: '#111827', nav: '#ffffff' },
      autumn:      { bg: '#fff7ed', text: '#7c2d12', nav: '#fed7aa' },
      business:    { bg: '#111827', text: '#e5e7eb', nav: '#1f2937' },
      acid:        { bg: '#f0fdf4', text: '#052e16', nav: '#bbf7d0' },
      lemonade:    { bg: '#fef9c3', text: '#1f2937', nav: '#fde68a' },
      night:       { bg: '#0b1020', text: '#e5e7eb', nav: '#111827' },
      coffee:      { bg: '#3f2d20', text: '#f5f5f4', nav: '#4b3626' },
      winter:      { bg: '#eef2ff', text: '#111827', nav: '#e0e7ff' },
    };
    return map[name] || map.light;
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(saved);
  }, []);

  const applyTheme = (value) => {
    setTheme(value);
    localStorage.setItem('theme', value);
    applyThemeGlobally(value);
  };

  return (
    <div className="min-h-screen pt-24 container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Appearance</h1>
          <p className="text-sm opacity-70">Choose a theme to change the app background and colors.</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <select
            className="select select-bordered w-full max-w-xs"
            value={theme}
            onChange={(e) => applyTheme(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button className="btn" onClick={() => applyTheme('light')}>Reset</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => applyTheme(t)}
              className={`border hover:shadow-lg transition rounded-2xl overflow-hidden ${theme === t ? 'ring-2 ring-primary' : ''}`}
            >
              <div data-theme={t} className="card bg-base-100">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{t}</span>
                    {theme === t && <span className="badge badge-primary">Active</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded bg-primary" />
                    <div className="w-6 h-6 rounded bg-secondary" />
                    <div className="w-6 h-6 rounded bg-accent" />
                    <div className="w-6 h-6 rounded bg-neutral" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Setting
