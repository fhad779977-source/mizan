/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['-apple-system', '"SF Arabic"', '"Segoe UI"', 'Tahoma', '"Noto Naskh Arabic"', 'sans-serif'],
      },
      colors: {
        brand: { 50: '#ecfdf5', 100: '#d1fae5', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
      },
    },
  },
  plugins: [],
};
