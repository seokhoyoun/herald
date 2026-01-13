import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  plugins: [daisyui],
  daisyui: {
    themes: [
      "night",
      "dracula",
      "synthwave",
      "business",
      "forest",
      "luxury",
      "cupcake",
      "emerald",
      "corporate",
      "sunset",
    ],
  },
};
