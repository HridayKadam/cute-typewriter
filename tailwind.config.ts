import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff7f8",
          100: "#ffeef1",
          200: "#ffdce3",
          300: "#ffc4d0",
          400: "#ffa3b8",
          500: "#f48baa",
          DEFAULT: "#f4c4c8",
        },
        cream: {
          DEFAULT: "#faf6f0",
          dark: "#f0e8dc",
        },
        ivory: "#fffef9",
        vintage: {
          brown: "#6b5344",
          muted: "#8b7355",
          ink: "#3d3229",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        script: ["var(--font-caveat)", "cursive"],
        typewriter: ["var(--font-special-elite)", "Courier New", "monospace"],
      },
      boxShadow: {
        paper: "0 4px 24px -4px rgba(107, 83, 68, 0.12), 0 2px 8px rgba(107, 83, 68, 0.08)",
        typewriter: "0 12px 40px -8px rgba(61, 50, 41, 0.25)",
      },
      animation: {
        blink: "blink 1s step-end infinite",
        float: "float 4s ease-in-out infinite",
        heartbeat: "heartbeat 0.6s ease-in-out",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        heartbeat: {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.3)" },
          "50%": { transform: "scale(1)" },
          "75%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;