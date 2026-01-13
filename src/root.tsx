import { component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
        <script
          dangerouslySetInnerHTML={`
            (function() {
              const themes = [
                "light", "dark", "night", "dracula", "synthwave", "business",
                "forest", "luxury", "cupcake", "emerald", "corporate", "sunset"
              ];
              const darkThemes = [
                "dark", "night", "dracula", "synthwave", "business",
                "forest", "luxury", "sunset"
              ];
              try {
                const storedTheme = localStorage.getItem('theme');
                const theme = storedTheme && themes.includes(storedTheme) ? storedTheme : 'night';
                
                document.documentElement.dataset.theme = theme;
                
                if (darkThemes.includes(theme)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                // Fallback if localStorage access fails
                document.documentElement.dataset.theme = 'night';
                document.documentElement.classList.add('dark');
              }
            })();
          `}
        />
      </head>
      <body lang="ko">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
