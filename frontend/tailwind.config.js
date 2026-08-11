/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#111827",
          800: "#1B2436",
          700: "#2A3550",
        },
        teal: {
          DEFAULT: "#0F8B8D",
          50: "#EAF6F6",
          100: "#D3ECEC",
          500: "#0F8B8D",
          600: "#0C7274",
          700: "#0A5D5F",
        },
        amber: {
          DEFAULT: "#E8A33D",
          50: "#FDF4E6",
          500: "#E8A33D",
          600: "#C6842A",
        },
        canvas: "#F7F8FA",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
