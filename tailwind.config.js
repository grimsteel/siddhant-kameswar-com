const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{liquid,html,js,md}"],
  theme: {
    extend: {
      colors: {
        primary: colors.amber,
        gray: colors.zinc
      },
      fontFamily: {
        'sans': ['"Fira Code"', ...defaultTheme.fontFamily.sans]
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}