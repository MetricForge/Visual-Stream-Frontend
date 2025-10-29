/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('scrollbar', ['&::-webkit-scrollbar', '&::-webkit-scrollbar-thumb', '&::-webkit-scrollbar-track']);
    },
  ],
  variants: {
    extend: {
      scrollbar: ['rounded'], // Optional: enables rounded scrollbar thumbs
    },
  },
}