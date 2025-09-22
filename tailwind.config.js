/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // αν έχεις React/Vite/Next κ.λπ.
  ],
  theme: {
    extend: {
      colors: {
        // δικό σου custom color
        primaryText: "#1a1a1a",
        monkey: "#89cff0",
      },
    },
  },
  plugins: [],
};
