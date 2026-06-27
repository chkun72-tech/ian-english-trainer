/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1F2933",
        paper: "#FAFAF7",
        card: "#FFFFFF",
        line: "#E7E2D8",
        accent: {
          DEFAULT: "#E0631E",
          dark: "#B84F16",
          light: "#FBE3CF",
        },
        teal: {
          DEFAULT: "#0F766E",
          light: "#D4F0EC",
        },
        status: {
          new: "#9AA5B1",
          learning: "#3B82F6",
          familiar: "#E0A526",
          mastered: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
