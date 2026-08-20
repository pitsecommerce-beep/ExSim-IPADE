import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require("../../ipade-design-system/tokens/tailwind.preset.js")],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ipade: {
          primary: "var(--ipade-primary)",
          "primary-dark": "var(--ipade-primary-dark)",
          "primary-light": "var(--ipade-primary-light)",
          sidebar: "var(--ipade-sidebar)",
          "sidebar-hover": "var(--ipade-sidebar-hover)",
          accent: "var(--ipade-accent)",
          "accent-hover": "var(--ipade-accent-hover)",
          gold: "var(--ipade-gold)",
          bg: "var(--ipade-bg)",
          surface: "var(--ipade-surface)",
          border: "var(--ipade-border)",
          text: "var(--ipade-text)",
          "text-secondary": "var(--ipade-text-secondary)",
          "text-muted": "var(--ipade-text-muted)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
