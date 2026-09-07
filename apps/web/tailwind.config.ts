import type { Config } from "tailwindcss";

/**
 * Autoklick24 Markenpalette – eigenständig, nicht an bestehende
 * Fahrzeugbörsen angelehnt (siehe docs/ARCHITECTURE.md "Design").
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050D1A",
          900: "#0A1626",
          800: "#0F2038",
          700: "#152C4A",
          600: "#1C3B60",
        },
        brand: {
          50: "#EAF2FE",
          100: "#D3E4FD",
          200: "#A7C9FB",
          300: "#7BADF8",
          400: "#4F91F5",
          500: "#2B6FE0",
          600: "#1E56B8",
          700: "#17418C",
          800: "#122F63",
          900: "#0C1F42",
        },
        cyan: {
          300: "#8FE3F2",
          400: "#5CD3E8",
          500: "#2FBFDB",
        },
        accent: {
          green: "#2FAE7A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(10, 22, 38, 0.10)",
        "card-hover": "0 12px 32px -8px rgba(10, 22, 38, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
