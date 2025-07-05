/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'Figtree', 'system-ui', 'sans-serif'],
        casual: ['Zain', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
