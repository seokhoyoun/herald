import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";
import { PaletteIcon } from "lucide-qwik";

const themes = [
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

export default component$(() => {
  const theme = useSignal<string>("night");

  const setTheme = $((value: string) => {
    theme.value = value;
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = value;
    }
  });

  useVisibleTask$(() => {
    document.documentElement.dataset.theme = theme.value;
  });

  return (
    <div class="min-h-screen bg-base-100 text-base-content">
      <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 md:px-8">
        <header class="navbar rounded-2xl border border-base-300 bg-base-200/70 shadow-xl">
          <div class="navbar-start">
            <div class="flex flex-col">
              <span class="text-lg font-semibold tracking-[0.2em]">HERALD</span>
              <span class="text-xs uppercase tracking-[0.4em] text-base-content/60">
                Qwik Journal
              </span>
            </div>
          </div>
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal gap-2 rounded-full bg-base-100/60 px-4">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/essays">Essays</a>
              </li>
              <li>
                <a href="/notes">Notes</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
            </ul>
          </div>
          <div class="navbar-end">
            <label class="input input-bordered flex items-center gap-2">
              <PaletteIcon class="h-4 w-4" />
              <select
                class="select select-sm border-none bg-transparent text-sm"
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
        </header>

        <main class="flex flex-col gap-10">
          <Slot />
        </main>

        <footer class="footer items-center justify-between rounded-2xl border border-base-300 bg-base-200/60 px-6 py-6">
          <div>
            <p class="text-lg font-semibold">Herald</p>
            <p class="text-sm text-base-content/60">
              Qwik + SQLite로 구성하는 미니멀 블로그 실험실
            </p>
          </div>
          <div class="flex gap-4 text-sm">
            <a class="link link-hover" href="#">
              문의
            </a>
            <a class="link link-hover" href="#">
              뉴스레터
            </a>
            <a class="link link-hover" href="#">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
});
