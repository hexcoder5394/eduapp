/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A dark moody palette (inspired by your preferences)
        background: '#0f172a', // Slate 900
        surface: '#1e293b',    // Slate 800
        primary: '#3b82f6',    // Blue 500
        accent: '#8b5cf6',     // Violet 500
      }
    },
  },
  plugins: [],
}