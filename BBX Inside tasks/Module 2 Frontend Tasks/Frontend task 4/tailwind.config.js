/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af"
        }
      },
      fontFamily: {
        lab: ["Arial", "Helvetica", "sans-serif"]
      },
      spacing: {
        13: "3.25rem",
        18: "4.5rem"
      }
    }
  },
  plugins: []
};
