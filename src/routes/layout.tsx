import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { getSupabaseClient } from "../lib/supabase";
import { PaletteIcon } from "lucide-qwik";

const themes = ["light", "night"];
const darkThemes = ["night"];

export default component$(() => {
  const theme = useSignal<string>("night");
  const userEmail = useSignal<string | null>(null);
  const baseUrl = import.meta.env.BASE_URL;

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
    document.documentElement.classList.toggle(
      "dark",
      darkThemes.includes(value),
    );
  });

  const setTheme = $((value: string) => {
    theme.value = value;
    applyTheme(value);
  });
  const toggleTheme = $(() => {
    setTheme(theme.value === "night" ? "light" : "night");
  });
  const signIn = $(() => {
    const supabase = getSupabaseClient();
    const redirectTo = `${window.location.origin}${baseUrl}`;
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  });
  const signOut = $(() => {
    const supabase = getSupabaseClient();
    supabase.auth.signOut();
  });

  useVisibleTask$(() => {
    const current = document.documentElement.dataset.theme;
    if (current && themes.includes(current)) {
      theme.value = current;
    }
    applyTheme(theme.value);
  });

  useVisibleTask$(() => {
    const supabase = getSupabaseClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (!error) {
            userEmail.value = data.session?.user.email ?? null;
          } else {
            userEmail.value = null;
          }
        })
        .finally(() => {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          window.history.replaceState(
            {},
            document.title,
            `${window.location.origin}${baseUrl}`,
          );
        });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        userEmail.value = data.session?.user.email ?? null;
      });
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        userEmail.value = session?.user.email ?? null;
      },
    );
    return () => {
      subscription.subscription.unsubscribe();
    };
  });

  return (
    <div class="min-h-screen">
      <header class="header">
        <nav class="navbar container">
          <div class="flex items-center gap-4">
            <Link class="navbar-brand" href={baseUrl}>
              stone2on
            </Link>
            <span class="eyebrow">IT Developer / Automation / AI </span>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <ul class="navbar-nav">
              <li>
                <Link class="nav-link" href={baseUrl}>
                  Home
                </Link>
              </li>
              <li>
                <Link class="nav-link" href={`${baseUrl}essays`}>
                  Essays
                </Link>
              </li>
              <li>
                <Link class="nav-link" href={`${baseUrl}notes`}>
                  Notes
                </Link>
              </li>
              <li>
                <Link class="nav-link" href={`${baseUrl}about`}>
                  About
                </Link>
              </li>
            </ul>
            <div class="auth">
              {userEmail.value ? (
                <button type="button" class="auth-button" onClick$={signOut}>
                  <span class="auth-label">
                    {(userEmail.value ?? "").split("@")[0]}
                  </span>
                  Logout
                </button>
              ) : (
                <button type="button" class="auth-button" onClick$={signIn}>
                  Sign In
                </button>
              )}
            </div>
            <button
              type="button"
              class="theme-select"
              aria-pressed={theme.value === "night"}
              onClick$={toggleTheme}
            >
              <PaletteIcon class="h-4 w-4" />
              <span class="text-xs font-secondary text-base-content/50">
                Theme
              </span>
              <span class="text-xs font-semibold uppercase tracking-[0.2em]">
                {themes.find((item) => item === theme.value) ?? "night"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Slot />
      </main>

      <footer class="section">
        <div class="container flex flex-wrap items-center justify-between gap-6 border-t border-base-content/20 pt-10">
          <div>
            <p class="text-lg font-semibold text-base-content">
              stone2on
            </p>
            <p class="text-sm text-base-content/50">
              윤석호의 개발 블로그입니다.
            </p>
          </div>
          <div class="flex gap-4 text-sm font-secondary">
            <a class="hover:text-primary" href="#">
              문의
            </a>
            <a class="hover:text-primary" href="#">
              뉴스레터
            </a>
            <a class="hover:text-primary" href="https://github.com/seokhoyoun">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
});
