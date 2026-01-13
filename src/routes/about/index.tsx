import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section class="rounded-2xl border border-base-300 bg-base-200/60 p-10 shadow-xl">
      <h1 class="text-3xl font-semibold">About</h1>
      <p class="mt-3 text-base-content/70">
        Herald는 Qwik과 SQLite로 구성하는 개인형 블로그 프로젝트입니다.
        디자인과 글쓰기 실험을 함께 다룹니다.
      </p>
    </section>
  );
});

export const head: DocumentHead = {
  title: "About - Herald",
  meta: [
    {
      name: "description",
      content: "Herald 블로그 소개",
    },
  ],
};
