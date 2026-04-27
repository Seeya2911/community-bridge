/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        cb: {
          green: 'var(--cb-green)',
          'green-mid': 'var(--cb-green-mid)',
          'green-light': 'var(--cb-green-light)',
          'green-border': 'var(--cb-green-border)',
          'admin-dark': 'var(--cb-admin-dark)',
          'ngo-dark': 'var(--cb-ngo-dark)',
          'vol-dark': 'var(--cb-vol-dark)',
          'critical': 'var(--cb-critical)',
          'critical-bg': 'var(--cb-critical-bg)',
          'high': 'var(--cb-high)',
          'high-bg': 'var(--cb-high-bg)',
          'moderate': 'var(--cb-moderate)',
          'moderate-bg': 'var(--cb-moderate-bg)',
          'low': 'var(--cb-low)',
          'low-bg': 'var(--cb-low-bg)',
          'slate': 'var(--cb-slate)',
          'slate-mid': 'var(--cb-slate-mid)',
          'gray': 'var(--cb-gray)',
          'gray-light': 'var(--cb-gray-light)',
          'border': 'var(--cb-border)',
          'border-dark': 'var(--cb-border-dark)',
          'bg': 'var(--cb-bg)',
          'surface': 'var(--cb-surface)',
        }
      }
    },
  },
  plugins: [],
}
