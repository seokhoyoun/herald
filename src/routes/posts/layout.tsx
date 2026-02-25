import { $, component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { getSupabaseClient } from "../../lib/supabase";

type PostComment = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

const resolvePostSlug = (pathname: string, baseUrl: string) => {
  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const trimmedPath =
    normalizedBase && pathname.startsWith(normalizedBase)
      ? pathname.slice(normalizedBase.length)
      : pathname;
  const segments = trimmedPath.split("/").filter(Boolean);
  const postIndex = segments.indexOf("posts");
  if (postIndex < 0) {
    return null;
  }
  return segments[postIndex + 1] ?? null;
};

const toDisplayDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default component$(() => {
  const location = useLocation();
  const baseUrl = import.meta.env.BASE_URL;
  const comments = useSignal<PostComment[]>([]);
  const isLoading = useSignal(true);
  const isSaving = useSignal(false);
  const error = useSignal<string | null>(null);
  const notice = useSignal<string | null>(null);
  const userId = useSignal<string | null>(null);
  const authorName = useSignal<string | null>(null);
  const body = useSignal("");

  const loadSession = async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    userId.value = data.user?.id ?? null;
    authorName.value =
      (data.user?.user_metadata?.name as string | undefined) ??
      data.user?.email?.split("@")[0] ??
      null;
  };

  const loadComments = async () => {
    const postSlug = resolvePostSlug(location.url.pathname, baseUrl);
    if (!postSlug) {
      comments.value = [];
      isLoading.value = false;
      return;
    }
    isLoading.value = true;
    error.value = null;
    const supabase = getSupabaseClient();
    const { data, error: fetchError } = await supabase
      .from("post_comments")
      .select("id, author_name, body, created_at")
      .eq("post_slug", postSlug)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (fetchError) {
      comments.value = [];
      error.value = `댓글을 불러오지 못했습니다: ${fetchError.message}`;
    } else {
      comments.value = data ?? [];
    }
    isLoading.value = false;
  };

  const submitComment = $(async (event: SubmitEvent) => {
    event.preventDefault();
    notice.value = null;
    error.value = null;

    if (!userId.value) {
      error.value = "댓글 작성은 로그인 후 이용할 수 있습니다.";
      return;
    }
    const postSlug = resolvePostSlug(location.url.pathname, baseUrl);
    if (!postSlug) {
      error.value = "포스트 정보를 확인할 수 없습니다.";
      return;
    }
    const trimmedBody = body.value.trim();
    if (!trimmedBody) {
      error.value = "댓글 내용을 입력해 주세요.";
      return;
    }

    isSaving.value = true;
    const supabase = getSupabaseClient();
    const { error: insertError } = await supabase.from("post_comments").insert({
      post_slug: postSlug,
      author_id: userId.value,
      author_name: authorName.value,
      body: trimmedBody,
    });

    if (insertError) {
      error.value = `댓글 등록 실패: ${insertError.message}`;
    } else {
      body.value = "";
      notice.value = "댓글이 등록되었습니다. 승인 후 노출됩니다.";
      await loadComments();
    }
    isSaving.value = false;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
    track(() => location.url.pathname);
    const supabase = getSupabaseClient();

    void loadSession();
    void loadComments();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        userId.value = session?.user?.id ?? null;
        authorName.value =
          (session?.user?.user_metadata?.name as string | undefined) ??
          session?.user?.email?.split("@")[0] ??
          null;
      },
    );
    cleanup(() => {
      subscription.subscription.unsubscribe();
    });
  });

  return (
    <article class="post-shell section">
      <div class="container">
        <div class="content">
          <Slot />
        </div>

        <section class="mt-12 rounded-lg border border-base-content/20 bg-base-100 p-6 md:p-8">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="m-0 text-2xl">댓글</h2>
            <span class="text-xs font-secondary uppercase tracking-[0.25em] text-base-content/50">
              {comments.value.length} comments
            </span>
          </div>

          {error.value ? <p class="mt-4 text-sm text-error">{error.value}</p> : null}
          {notice.value ? (
            <p class="mt-4 text-sm text-success">{notice.value}</p>
          ) : null}

          {isLoading.value ? (
            <p class="mt-6 text-sm text-base-content/60">댓글을 불러오는 중입니다.</p>
          ) : comments.value.length === 0 ? (
            <p class="mt-6 text-sm text-base-content/60">
              아직 승인된 댓글이 없습니다. 첫 댓글을 남겨보세요.
            </p>
          ) : (
            <div class="mt-6 grid gap-4">
              {comments.value.map((comment) => (
                <article
                  key={comment.id}
                  class="rounded-md border border-base-content/10 bg-base-100 p-4"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-sm font-semibold text-base-content">
                      {comment.author_name ?? "익명"}
                    </span>
                    <span class="text-xs font-secondary uppercase tracking-[0.12em] text-base-content/50">
                      {toDisplayDate(comment.created_at)}
                    </span>
                  </div>
                  <p class="mt-2 whitespace-pre-line text-sm text-base-content/80">
                    {comment.body}
                  </p>
                </article>
              ))}
            </div>
          )}

          <form class="mt-8 border-t border-base-content/10 pt-6" onSubmit$={submitComment}>
            {userId.value ? (
              <p class="text-sm text-base-content/60">
                로그인 사용자로 댓글을 남깁니다.
              </p>
            ) : (
              <p class="text-sm text-base-content/60">
                댓글 작성은 상단의 Sign In 후 이용할 수 있습니다.
              </p>
            )}
            <label class="mt-4 block text-sm font-semibold text-base-content">
              댓글 작성
              <textarea
                class="mt-2 min-h-[140px] w-full rounded-md border border-base-content/20 bg-base-100 px-3 py-2 text-sm text-base-content"
                value={body.value}
                onInput$={$((event) => {
                  body.value = (event.target as HTMLTextAreaElement).value;
                })}
                placeholder="포스트에 대한 의견을 남겨주세요."
                disabled={!userId.value || isSaving.value}
              />
            </label>
            <button
              type="submit"
              class="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!userId.value || isSaving.value}
            >
              {isSaving.value ? "등록 중..." : "댓글 등록"}
            </button>
          </form>
        </section>
      </div>
    </article>
  );
});
