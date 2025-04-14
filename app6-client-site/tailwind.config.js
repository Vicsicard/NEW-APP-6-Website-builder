/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
