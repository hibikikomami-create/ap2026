/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Existing app colors
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Magazine theme
        mag: {
          bg:      '#0a0a0a',
          surface: '#131313',
          border:  '#1e1e1e',
          muted:   '#3d3d3d',
          dim:     '#6b6560',
          text:    '#e8e3dc',
          gold:    '#c9a84c',
          'gold-dim': '#8a7133',
          'warm-white': '#f2ede6',
        },
      },
      fontFamily: {
        sans:  ['"Noto Sans JP"', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:  ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        'widest-2': '0.3em',
        'widest-3': '0.5em',
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
