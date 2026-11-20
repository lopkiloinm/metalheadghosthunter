/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#060608',
        iron: '#0e0f13',
        steel: '#171920',
        crimson: '#ff2a4b',
        blood: '#991128',
        ecto: '#22ff88',
        brass: '#d4a24c',
        bone: '#eae5dc',
      },
      fontFamily: {
        gothic: ['"Cinzel Decorative"', '"UnifrakturMaguntia"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        crimson: '0 0 32px rgba(255, 42, 75, 0.35)',
        ecto: '0 0 28px rgba(34, 255, 136, 0.28)',
        brass: '0 0 22px rgba(212, 162, 76, 0.25)',
      },
    },
  },
  plugins: [],
};
