/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    screens: {
      sm: "540px",
      md: "768px",
      lg: "992px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        text: "oklch(var(--color-base-content) / 0.72)",
        dark: "oklch(var(--color-base-content) / 1)",
        primary: "oklch(var(--color-primary) / 1)",
        body: "oklch(var(--color-base-100) / 1)",
        border: "oklch(var(--color-base-content) / 0.2)",
        light: "oklch(var(--color-base-content) / 0.5)",
        "theme-light": "oklch(var(--color-base-200) / 1)",
        "theme-dark": "oklch(var(--color-base-300) / 1)",
        darkmode: {
          text: "oklch(var(--color-base-content) / 0.72)",
          dark: "oklch(var(--color-base-content) / 1)",
          light: "oklch(var(--color-base-content) / 0.9)",
          primary: "oklch(var(--color-primary) / 1)",
          body: "oklch(var(--color-base-100) / 1)",
          border: "oklch(var(--color-base-content) / 0.3)",
          "theme-light": "oklch(var(--color-base-200) / 1)",
          "theme-dark": "oklch(var(--color-base-300) / 1)",
        },
      },
      fontFamily: {
        primary: ["Raleway", "sans-serif"],
        secondary: ["Merriweather Sans", "sans-serif"],
      },
      fontSize: {
        base: "16px",
        h1: "2.488rem",
        "h1-sm": "1.991rem",
        h2: "2.074rem",
        "h2-sm": "1.659rem",
        h3: "1.728rem",
        "h3-sm": "1.382rem",
        h4: "1.44rem",
        h5: "1.2rem",
        h6: "1rem",
      },
    },
  },
};
