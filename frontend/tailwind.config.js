/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        "plant-title": ['"Saira Stencil One"', "sans-serif"],
        "plant-body": ['"DM Serif Display"', "serif"],
      },
    },
  },
  plugins: [],
};
