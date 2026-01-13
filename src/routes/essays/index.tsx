import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section class="rounded-2xl border border-base-300 bg-base-200/60 p-10 shadow-xl">
      <h1 class="text-3xl font-semibold">Essays</h1>
      <p class="mt-3 text-base-content/70">
        장문의 아카이브를 준비 중입니다. 지금은 홈에서 최신 글을 확인해
        주세요.
      </p>
    </section>
  );
});

export const head: DocumentHead = {
  title: "Essays - Herald",
  meta: [
    {
      name: "description",
      content: "Herald 블로그의 에세이 아카이브",
    },
  ],
};
