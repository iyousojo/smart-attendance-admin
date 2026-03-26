/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // This defines the "bone" class you are trying to use
        bone: "#F5F2F0", 
        stone: {
          900: "#1A1A1A",
          800: "#262626",
          400: "#78716C",
          200: "#E7E5E4",
          100: "#F5F5F4",
        },
        accentAmber: "#D97706",
      },
    },
  },
  plugins: [],
}