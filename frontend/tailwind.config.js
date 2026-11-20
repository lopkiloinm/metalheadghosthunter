/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07070a',
        pit: '#0c0d11',
        iron: '#14161c',
        steel: '#1f222b',
        rim: '#2e323d',
        ember: { DEFAULT: '#ff5a1f', hot: '#ff7a3d', deep: '#b8400f', ink: '#1a0802' },
        spectral: { DEFAULT: '#3ff2e3', deep: '#0f4f4a' },
        brass: '#d9a85b',
        bone: '#ede8df',
        ash: '#a7a197',
        danger: '#ff6b6b',
      },
      fontFamily: {
        blackletter: ['"Pirata One"', 'Georgia', 'serif'],
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        ember: '0 12px 40px -12px rgba(255, 90, 31, 0.6)',
        spectral: '0 12px 40px -14px rgba(63, 242, 227, 0.5)',
        plate: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 30px 60px -30px rgba(0, 0, 0, 0.9)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'modal-in': {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
          to: { opacity: '1', transform: 'none' },
        },
        'drawer-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'menu-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        bump: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '46%': { opacity: '0.8' },
          '50%': { opacity: '0.45' },
          '54%': { opacity: '0.9' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'modal-in': 'modal-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'drawer-in': 'drawer-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'toast-in': 'toast-in 0.3s ease-out both',
        'menu-in': 'menu-in 0.25s ease-out both',
        bump: 'bump 0.45s ease-out',
        marquee: 'marquee 48s linear infinite',
        flicker: 'flicker 3.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
