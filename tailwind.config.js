/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gui-black": "#111111",
        "gui-gray": "#424242",
        "grid-line": "#62aeba",
      },
    },
  },
  plugins: [],
};
