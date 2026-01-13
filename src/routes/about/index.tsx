import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section class="section">
      <div class="container">
        <div class="rounded-lg border border-base-content/20 bg-base-100 p-10">
          <h1>About</h1>
          <p class="mt-3 text-base-content/80">
            윤석호의 블로그는 Qwik과 SQLite로 구성하는 개인형 기록 공간입니다.
            디자인과 글쓰기 실험을 함께 다룹니다.
          </p>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: "About - 윤석호의 블로그",
  meta: [
    {
      name: "description",
      content: "윤석호의 블로그 소개",
    },
  ],
};
