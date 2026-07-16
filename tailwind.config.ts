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
        bg: "var(--bg)",
        card: "var(--card)",
        line: "var(--border)",
        ink: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          hover: "var(--gold-hover)",
          ink: "var(--gold-ink)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          ink: "var(--danger-ink)",
        },
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "ui-sans-serif",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
