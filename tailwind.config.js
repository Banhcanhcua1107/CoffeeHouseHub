/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        viet: ['"Be Vietnam Pro"', 'sans-serif'],
        heading: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [require("daisyui")],
}

