import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section class="rounded-2xl border border-base-300 bg-base-200/60 p-10 shadow-xl">
      <h1 class="text-3xl font-semibold">Notes</h1>
      <p class="mt-3 text-base-content/70">
        짧은 메모와 아이디어를 정리할 공간입니다. 업데이트를 기대해 주세요.
      </p>
    </section>
  );
});

export const head: DocumentHead = {
  title: "Notes - Herald",
  meta: [
    {
      name: "description",
      content: "Herald 블로그의 짧은 노트 모음",
    },
  ],
};
