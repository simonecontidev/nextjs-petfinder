/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm brand scale (Terracotta → Amber)
        brand: {
          50:  "#FFF4E8",
          100: "#FFE8D1",
          200: "#FFD4A8",
          300: "#FFBF80",
          400: "#FFA75A",
          500: "#F58A3C",
          600: "#DC6F2A", // primary (light)
          700: "#B0531E",
          800: "#7A3A16",
          900: "#4B250F",
        },
      },
      ringColor: {
        DEFAULT: "rgb(245 138 60 / 0.35)", // brand-500 with opacity
      },
    },
  },
  plugins: [],
};

export default config;