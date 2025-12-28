const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{liquid,html,js,md}"],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { backgroundPosition: '200% center' },
        },
        scroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        scroll: 'scroll 25s linear infinite'
      },
      colors: {
        primary: colors.amber,
        //gray: colors.zinc,
        gray: {
          50: "#f3e9e1",
          100: "#ede3dc",
          200: "#dfd5d0",
          300: "#d0c6c2",
          400: "#a39999",
          500: "#786e6e",
          600: "#5c5252",
          700: "#4b413f",
          800: "#352b26",
          900: "#281e18",
          950: "#1a100a"
        }
      },
      fontFamily: {
        'sans': ['"Fira Sans"', ...defaultTheme.fontFamily.sans],
        'mono': ['"Fira Code"', ...defaultTheme.fontFamily.mono]
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}
