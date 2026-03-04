/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./components/**/*.{ts,tsx}",
    "./contents/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
    "./*.{ts,tsx}",      // popup.tsx, options.tsx etc
  ],
  plugins: [require("@tailwindcss/typography")],
}