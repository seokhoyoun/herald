/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
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
        text: "color-mix(in srgb, var(--color-base-content), transparent 28%)",
        dark: "var(--color-base-content)",
        primary: "var(--color-primary)",
        body: "var(--color-base-100)",
        border: "color-mix(in srgb, var(--color-base-content), transparent 80%)",
        light: "color-mix(in srgb, var(--color-base-content), transparent 50%)",
        "theme-light": "var(--color-base-200)",
        "theme-dark": "var(--color-base-300)",
        darkmode: {
          text: "color-mix(in srgb, var(--color-base-content), transparent 28%)",
          dark: "var(--color-base-content)",
          light: "color-mix(in srgb, var(--color-base-content), transparent 10%)",
          primary: "var(--color-primary)",
          body: "var(--color-base-100)",
          border: "color-mix(in srgb, var(--color-base-content), transparent 70%)",
          "theme-light": "var(--color-base-200)",
          "theme-dark": "var(--color-base-300)",
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
