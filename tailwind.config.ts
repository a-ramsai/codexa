import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // REQUIRED for shadcn dark mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
