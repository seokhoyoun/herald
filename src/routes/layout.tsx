import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { getSupabaseClient } from "../lib/supabase";
import { EyeIcon, PaletteIcon, UsersIcon } from "lucide-qwik";

const themes = ["light", "night"];
const darkThemes = ["night"];
const dailyViewStorageKey = "blog_daily_view_counted_kst_date";

const toKstDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

export default component$(() => {
  if (typeof window !== "undefined") {
    console.info("[auth] layout loaded");
  }
  const theme = useSignal<string>("night");
  const userEmail = useSignal<string | null>(null);
  const authError = useSignal<string | null>(null);
  const authDebug = useSignal<string | null>(null);
  const authContinueUrl = useSignal<string | null>(null);
  const dailyViewCount = useSignal<number | null>(null);
  const totalViewCount = useSignal<number | null>(null);
  const location = useLocation();
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
  const signIn = $(async () => {
    const supabase = getSupabaseClient();
    const redirectTo = `${window.location.origin}/`;
    authError.value = null;
    authDebug.value = null;
    authContinueUrl.value = null;
    console.info("[auth] signIn start", { redirectTo });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    console.info("[auth] signInWithOAuth result", {
      hasUrl: Boolean(data?.url),
      url: data?.url ?? null,
    });
    if (error) {
      console.warn("[auth] signInWithOAuth error", error);
      authError.value = error.message ?? "OAuth sign-in failed.";
      return;
    }
    if (!data?.url) {
      authError.value = "OAuth URL is missing.";
      return;
    }
    const authUrl = new URL(data.url);
    const authorizeRedirectTo = authUrl.searchParams.get("redirect_to");
    authDebug.value = [
      `origin: ${window.location.origin}`,
      `requested redirectTo: ${redirectTo}`,
      `authorize redirect_to: ${authorizeRedirectTo ? decodeURIComponent(authorizeRedirectTo) : "(missing)"}`,
    ].join("\n");
    const debugMode = new URL(window.location.href).searchParams.get(
      "auth_debug",
    );
    if (debugMode === "1") {
      authContinueUrl.value = data.url;
      return;
    }
    window.location.assign(data.url);
  });
  const signOut = $(() => {
    const supabase = getSupabaseClient();
    supabase.auth.signOut();
  });
  const syncTotalViewCount = $(async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("blog_daily_views")
      .select("view_count");
    if (error) {
      console.warn("[analytics] blog_daily_views select error", error);
      return;
    }
    totalViewCount.value = (data ?? []).reduce((sum, row) => {
      const count =
        typeof row.view_count === "number"
          ? row.view_count
          : Number(row.view_count);
      return sum + (Number.isFinite(count) ? count : 0);
    }, 0);
  });

  const syncDailyViewCount = $(async (viewDate: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("blog_daily_views")
      .select("view_count")
      .eq("view_date", viewDate)
      .maybeSingle();
    if (error) {
      console.warn("[analytics] blog_daily_views daily select error", error);
      return;
    }
    if (!data) {
      dailyViewCount.value = 0;
      return;
    }
    const count =
      typeof data.view_count === "number"
        ? data.view_count
        : Number(data.view_count);
    dailyViewCount.value = Number.isFinite(count) ? count : null;
  });

  const trackDailyView = $(async () => {
    const viewDate = toKstDate();
    const supabase = getSupabaseClient();
    let countedDate: string | null = null;
    try {
      countedDate = localStorage.getItem(dailyViewStorageKey);
    } catch {
      // ignore
    }
    if (countedDate === viewDate) {
      await syncDailyViewCount(viewDate);
      await syncTotalViewCount();
      return;
    }
    const { data, error } = await supabase.rpc("increment_blog_daily_view", {
      p_view_date: viewDate,
    });
    if (error) {
      console.warn("[analytics] increment_blog_daily_view error", error);
      return;
    }
    if (typeof data === "number") {
      dailyViewCount.value = data;
    } else if (typeof data === "string") {
      const parsed = Number(data);
      dailyViewCount.value = Number.isFinite(parsed) ? parsed : null;
    }
    try {
      localStorage.setItem(dailyViewStorageKey, viewDate);
    } catch {
      // ignore
    }
    await syncTotalViewCount();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const current = document.documentElement.dataset.theme;
    if (current && themes.includes(current)) {
      theme.value = current;
    }
    applyTheme(theme.value);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const supabase = getSupabaseClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash,
    );
    const callbackErrorCode =
      hashParams.get("error_code") ?? url.searchParams.get("error_code");
    const callbackErrorDescription =
      hashParams.get("error_description") ??
      url.searchParams.get("error_description");

    if (callbackErrorCode || callbackErrorDescription) {
      authError.value = `[${callbackErrorCode ?? "auth_error"}] ${callbackErrorDescription ?? "OAuth callback failed."}`;
      console.warn("[auth] callback error", {
        errorCode: callbackErrorCode,
        errorDescription: callbackErrorDescription,
        href: window.location.href,
      });
    }

    const clearInvalidSession = async (error?: { message?: string }) => {
      if (error?.message?.includes("Invalid Refresh Token")) {
        console.warn("[auth] invalid refresh token; clearing local session");
        await supabase.auth.signOut({ scope: "local" });
      }
    };

    const syncSession = async () => {
      if (code) {
        console.info("[auth] exchangeCodeForSession start");
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          code,
        );
        if (error) {
          console.warn("[auth] exchangeCodeForSession error", error);
          authError.value = error.message ?? "Failed to exchange OAuth code.";
          await clearInvalidSession(error);
        } else {
          authError.value = null;
        }
        console.info("[auth] exchangeCodeForSession result", {
          user: data.session?.user?.email ?? null,
          hasSession: Boolean(data.session),
        });
        userEmail.value = data.session?.user.email ?? null;
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        const sanitizedUrl = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState(
          {},
          document.title,
          sanitizedUrl || `${window.location.origin}${baseUrl}`,
        );
        return;
      }

      console.info("[auth] getSession start");
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("[auth] getSession error", error);
        authError.value = error.message ?? "Failed to read auth session.";
        await clearInvalidSession(error);
      }
      console.info("[auth] getSession result", {
        user: data.session?.user?.email ?? null,
        hasSession: Boolean(data.session),
      });
      userEmail.value = data.session?.user.email ?? null;
      if (!error && data.session) {
        authError.value = null;
      }
    };

    void syncSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.info("[auth] state change", {
          event: _event,
          user: session?.user?.email ?? null,
          hasSession: Boolean(session),
        });
        userEmail.value = session?.user.email ?? null;
      },
    );
    return () => {
      subscription.subscription.unsubscribe();
    };
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    void trackDailyView();
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
                <Link class="nav-link" href={`${baseUrl}workouts`}>
                  Workouts
                </Link>
              </li>
              <li>
                <Link class="nav-link" href={`${baseUrl}about`}>
                  About
                </Link>
              </li>
            </ul>
            <div class="order-last flex w-full items-center justify-center gap-2 rounded-full border border-base-content/20 px-3 py-1 text-xs text-base-content/70 sm:order-none sm:w-auto">
              <span class="inline-flex items-center gap-1 whitespace-nowrap">
                <EyeIcon class="h-3.5 w-3.5" />
                <span class="hidden md:inline">오늘 방문자 수</span>
                <span class="md:hidden">오늘</span>
                <span class="tabular-nums">
                  {dailyViewCount.value === null
                    ? "-"
                    : `${dailyViewCount.value.toLocaleString("ko-KR")}명`}
                </span>
              </span>
              <span class="text-base-content/40">/</span>
              <span class="inline-flex items-center gap-1 whitespace-nowrap">
                <UsersIcon class="h-3.5 w-3.5" />
                <span class="hidden md:inline">전체 방문자 수</span>
                <span class="md:hidden">전체</span>
                <span class="tabular-nums">
                  {totalViewCount.value === null
                    ? "-"
                    : `${totalViewCount.value.toLocaleString("ko-KR")}명`}
                </span>
              </span>
            </div>
            <div class="auth">
              {userEmail.value ? (
                <button type="button" class="auth-button" onClick$={signOut}>
                  <span class="auth-label">
                    {(userEmail.value ?? "").split("@")[0]}
                  </span>
                  Logout
                </button>
              ) : (
                <>
                  <button type="button" class="auth-button" onClick$={signIn}>
                    Sign In
                  </button>
                  {authDebug.value ? (
                    <pre class="max-w-[28rem] whitespace-pre-wrap break-all text-[10px] leading-4 text-emerald-500">
                      {authDebug.value}
                    </pre>
                  ) : null}
                  {authContinueUrl.value ? (
                    <a
                      href={authContinueUrl.value}
                      class="text-xs text-blue-500 underline"
                    >
                      Continue OAuth
                    </a>
                  ) : null}
                  {authError.value ? (
                    <span class="text-xs text-red-500">{authError.value}</span>
                  ) : null}
                </>
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
