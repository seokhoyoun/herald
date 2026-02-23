import { component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";

export const onGet: RequestHandler = ({ status }) => {
  status(404);
};

export default component$(() => {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <section class="section">
      <div class="container">
        <div class="rounded-lg border border-base-content/20 bg-base-100 p-8 md:p-10">
          <p class="eyebrow">404</p>
          <h1 class="mt-3">Page Not Found</h1>
          <p class="mt-4 max-w-2xl text-base-content/70">
            요청하신 페이지를 찾을 수 없습니다. 주소를 확인하거나 홈으로
            이동해 주세요.
          </p>
          <div class="mt-8">
            <Link class="btn-primary" href={baseUrl}>
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: "404 - 윤석호의 블로그",
  meta: [
    {
      name: "description",
      content: "요청한 페이지를 찾을 수 없습니다.",
    },
  ],
};
