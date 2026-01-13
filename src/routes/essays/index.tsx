import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section class="section">
      <div class="container">
        <div class="rounded-lg border border-base-content/20 bg-base-100 p-10">
          <h1>Essays</h1>
          <p class="mt-3 text-base-content/80">
            장문의 아카이브를 준비 중입니다. 지금은 홈에서 최신 글을 확인해
            주세요.
          </p>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: "Essays - 윤석호의 블로그",
  meta: [
    {
      name: "description",
      content: "윤석호의 블로그 에세이 아카이브",
    },
  ],
};
