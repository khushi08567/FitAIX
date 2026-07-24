/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fitbg: 'var(--bg-primary)',
        fitcard: 'var(--bg-card)',
        fittext: 'var(--text-primary)',
        fittextdim: 'var(--text-secondary)',
        fitgold: 'var(--color-gold)',
        fitteal: 'var(--color-teal)',
        fitlime: 'var(--color-lime)',
        fitamber: 'var(--color-amber)',
        fitrose: 'var(--color-rose)',
        fitviolet: 'var(--color-violet)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'spark': 'sparkMove 4s linear infinite',
      },
      keyframes: {
        sparkMove: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
