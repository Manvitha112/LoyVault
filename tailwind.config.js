/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        loyvault: {
          purpleFrom: "#a855f7",
          purpleTo: "#ec4899",
          blueFrom: "#3b82f6",
          blueTo: "#06b6d4",
        },
      },
    },
  },
  plugins: [],
};
