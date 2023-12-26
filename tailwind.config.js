const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{liquid,html,js,md}"],
  theme: {
    extend: {
      colors: {
        primary: colors.amber,
        gray: colors.stone
      }
    },
  },
  plugins: [],
}