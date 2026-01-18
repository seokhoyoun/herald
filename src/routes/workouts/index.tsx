import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getSupabaseClient } from "../../lib/supabase";

type WorkoutLog = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  workout_date: string;
  created_at: string;
};

const toInputDate = (value: Date) => {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

export default component$(() => {
  const logs = useSignal<WorkoutLog[]>([]);
  const isLoading = useSignal(true);
  const isSaving = useSignal(false);
  const error = useSignal<string | null>(null);
  const userId = useSignal<string | null>(null);

  const title = useSignal("");
  const content = useSignal("");
  const workoutDate = useSignal(toInputDate(new Date()));

  const refreshLogs = async () => {
    isLoading.value = true;
    error.value = null;
    const supabase = getSupabaseClient();
    const { data, error: fetchError } = await supabase
      .from("workout_logs")
      .select("id, author_id, title, content, workout_date, created_at")
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (fetchError) {
      error.value = `불러오기 실패: ${fetchError.message}`;
      logs.value = [];
    } else {
      logs.value = data ?? [];
    }
    isLoading.value = false;
  };

  const handleSubmit = $(
    async (event: SubmitEvent) => {
      event.preventDefault();
      if (!userId.value) {
        error.value = "로그인이 필요합니다.";
        return;
      }
      const trimmedTitle = title.value.trim();
      const trimmedContent = content.value.trim();
      if (!trimmedTitle || !trimmedContent) {
        error.value = "제목과 내용을 입력해 주세요.";
        return;
      }

      isSaving.value = true;
      error.value = null;
      const supabase = getSupabaseClient();
      const { error: insertError } = await supabase
        .from("workout_logs")
        .insert({
          author_id: userId.value,
          title: trimmedTitle,
          content: trimmedContent,
          workout_date: workoutDate.value,
        });
      if (insertError) {
        error.value = `저장 실패: ${insertError.message}`;
      } else {
        title.value = "";
        content.value = "";
        await refreshLogs();
      }
      isSaving.value = false;
    },
  );

  useVisibleTask$(async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    userId.value = data.user?.id ?? null;
    await refreshLogs();
  });

  return (
    <section class="section">
      <div class="container">
        <div class="rounded-lg border border-base-content/20 bg-base-100 p-8 md:p-10">
          <h1>운동일지</h1>
          <p class="mt-3 text-base-content/70">
            운동 기록을 저장하고, 최근 활동을 한눈에 모아봅니다.
          </p>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="rounded-lg border border-base-content/20 bg-base-100 p-6 md:p-8">
            <div class="flex items-center justify-between">
              <h2 class="text-xl">최근 기록</h2>
              <span class="text-xs font-secondary uppercase tracking-[0.3em] text-base-content/40">
                {logs.value.length} 기록
              </span>
            </div>
            {error.value ? (
              <p class="mt-4 text-sm text-error">{error.value}</p>
            ) : null}
            {isLoading.value ? (
              <p class="mt-6 text-sm text-base-content/60">
                데이터를 불러오는 중입니다.
              </p>
            ) : logs.value.length === 0 ? (
              <p class="mt-6 text-sm text-base-content/60">
                아직 기록이 없습니다. 오른쪽에서 첫 기록을 남겨보세요.
              </p>
            ) : (
              <div class="mt-6 grid gap-6">
                {logs.value.map((log) => (
                  <article
                    key={log.id}
                    class="border-t border-base-content/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <h3 class="text-lg">{log.title}</h3>
                      <span class="text-xs font-secondary uppercase tracking-[0.2em] text-base-content/50">
                        {log.workout_date}
                      </span>
                    </div>
                    <p class="mt-2 whitespace-pre-line text-sm text-base-content/70">
                      {log.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form
            class="rounded-lg border border-base-content/20 bg-base-100 p-6 md:p-8"
            onSubmit$={handleSubmit}
          >
            <h2 class="text-xl">새 기록</h2>
            <p class="mt-2 text-sm text-base-content/60">
              로그인한 계정으로 저장됩니다.
            </p>
            {!userId.value ? (
              <p class="mt-3 text-sm text-warning">
                저장하려면 상단에서 로그인해 주세요.
              </p>
            ) : null}

            <div class="mt-6 grid gap-4">
              <label class="text-sm font-semibold text-base-content">
                날짜
                <input
                  class="mt-2 w-full rounded-md border border-base-content/20 bg-base-100 px-3 py-2 text-sm text-base-content"
                  type="date"
                  value={workoutDate.value}
                  onInput$={$((event) => {
                    workoutDate.value = (
                      event.target as HTMLInputElement
                    ).value;
                  })}
                  required
                />
              </label>
              <label class="text-sm font-semibold text-base-content">
                제목
                <input
                  class="mt-2 w-full rounded-md border border-base-content/20 bg-base-100 px-3 py-2 text-sm text-base-content"
                  type="text"
                  value={title.value}
                  onInput$={$((event) => {
                    title.value = (event.target as HTMLInputElement).value;
                  })}
                  placeholder="오늘 한 운동"
                  required
                />
              </label>
              <label class="text-sm font-semibold text-base-content">
                내용
                <textarea
                  class="mt-2 min-h-[160px] w-full rounded-md border border-base-content/20 bg-base-100 px-3 py-2 text-sm text-base-content"
                  value={content.value}
                  onInput$={$((event) => {
                    content.value = (
                      event.target as HTMLTextAreaElement
                    ).value;
                  })}
                  placeholder="운동 종류, 세트, 느낌 등을 적어주세요."
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              class="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!userId.value || isSaving.value}
            >
              {isSaving.value ? "저장 중..." : "운동일지 저장"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: "운동일지 - 윤석호의 블로그",
  meta: [
    {
      name: "description",
      content: "윤석호의 블로그 운동일지 모음",
    },
  ],
};
