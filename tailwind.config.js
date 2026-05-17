/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf3ed',
          100: '#fae2d0',
          200: '#f5c4a1',
          300: '#efa572',
          400: '#e87f47',
          500: '#d96831',
          600: '#C4622D',
          700: '#a34e22',
          800: '#833c19',
          900: '#6a2f13',
          950: '#3d1a07',
        },
        ink: {
          DEFAULT: '#1C1814',
          mid: '#3A3530',
          soft: '#5A5550',
          stone: '#8A8278',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans JP"', 'system-ui', '-apple-system', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
