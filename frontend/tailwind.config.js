/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Scan all .js and .jsx files in the src/ folder
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}