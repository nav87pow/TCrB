/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
   fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      /* 🔹 symbols */
        symbol: ['"Noto Sans Symbols"', 'sans-serif'],
        symbols: ['"Noto Sans Symbols 2"', 'sans-serif'],
      },
  },
    },
  plugins: [],
}

