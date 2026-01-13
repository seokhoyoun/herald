import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";
import { PaletteIcon } from "lucide-qwik";

const themes = [
  "light",
  "dark",
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
];

const darkThemes = [
  "dark",
  "night",
  "dracula",
  "synthwave",
  "business",
  "forest",
  "luxury",
  "sunset",
];

export default component$(() => {
  const theme = useSignal<string>("night");

  const applyTheme = $((value: string) => {
    if (typeof document === "undefined") {
      return;
    }
    try {
      localStorage.setItem("theme", value);
    } catch {
      // ignore
    }
    document.documentElement.dataset.theme = value;
    document.body.dataset.theme = value;
    document.documentElement.classList.toggle(
      "dark",
      darkThemes.includes(value),
    );
  });

  const setTheme = $((value: string) => {
    theme.value = value;
    applyTheme(value);
  });

  useVisibleTask$(() => {
    const current = document.documentElement.dataset.theme;
    if (current) {
      theme.value = current;
    }
    applyTheme(theme.value);
  });

  return (
    <div class="min-h-screen">
      <header class="header">
        <nav class="navbar container">
          <div class="flex items-center gap-4">
            <a class="navbar-brand" href="/">
              윤석호의 블로그
            </a>
            <span class="eyebrow">Qwik + SQLite</span>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <ul class="navbar-nav">
              <li>
                <a class="nav-link" href="/">
                  Home
                </a>
              </li>
              <li>
                <a class="nav-link" href="/essays">
                  Essays
                </a>
              </li>
              <li>
                <a class="nav-link" href="/notes">
                  Notes
                </a>
              </li>
              <li>
                <a class="nav-link" href="/about">
                  About
                </a>
              </li>
            </ul>
            <label class="theme-select">
              <PaletteIcon class="h-4 w-4" />
              <span class="text-xs font-secondary text-light dark:text-darkmode-text">
                Theme
              </span>
              <select
                value={theme.value}
                onChange$={(event) =>
                  setTheme((event.target as HTMLSelectElement).value)
                }
              >
                {themes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </nav>
      </header>

      <main>
        <Slot />
      </main>

      <footer class="section">
        <div class="container flex flex-wrap items-center justify-between gap-6 border-t border-border pt-10 dark:border-darkmode-border">
          <div>
            <p class="text-lg font-semibold text-dark dark:text-darkmode-light">
              윤석호의 블로그
            </p>
            <p class="text-sm text-light dark:text-darkmode-text">
              Qwik + SQLite로 기록하는 개인 작업실
            </p>
          </div>
          <div class="flex gap-4 text-sm font-secondary">
            <a class="hover:text-primary" href="#">
              문의
            </a>
            <a class="hover:text-primary" href="#">
              뉴스레터
            </a>
            <a class="hover:text-primary" href="#">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
});
