/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111827',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C59D5F',
          foreground: '#111827',
        },
        success: '#22C55E',
        danger: '#EF4444',
        reserved: '#3B82F6',
        unavailable: '#6B7280',
        background: '#F8F8F8',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
