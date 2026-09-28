/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#020617",
          900: "#0f172a",
          850: "#131c31",
          800: "#1e293b",
        },
        cyan: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif']
      }
    }
  },
  plugins: []
};
