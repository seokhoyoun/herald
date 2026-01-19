import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { getPostList } from "../data/posts";

const posts = getPostList();

export default component$(() => {
  const page = useSignal<number>(1);
  const baseUrl = import.meta.env.BASE_URL;
  const pageSize = 4;

  const filteredPosts = useComputed$(() => {
    return posts;
  });

  const totalPages = useComputed$(() => {
    return Math.max(1, Math.ceil(filteredPosts.value.length / pageSize));
  });

  const currentPage = useComputed$(() => {
    return Math.min(page.value, totalPages.value);
  });

  const pagedPosts = useComputed$(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredPosts.value.slice(start, start + pageSize);
  });

  const setPage = $((nextPage: number) => {
    page.value = Math.min(Math.max(1, nextPage), totalPages.value);
  });


  return (
    <>
      <section class="section pt-10">
        <div class="container">
          <div class="grid gap-12">
            <div class="space-y-4">
              <p class="eyebrow">SION</p>
              <h1>윤석호의 블로그</h1>
              <p class="max-w-xl text-base-content/80">
                개인적인 관심사나 생각나는 것을 정리하고 아카이빙하는 용도의 블로그입니다.
              </p>
              <div class="post-meta">
                <span>Posts</span>
                <span>{posts.length} articles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section pt-0">
        <div class="container">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <h3>Posts</h3>
          </div>

          <div class="mt-6" />

          <div class="post-table-wrap enter" style={{ "--delay": "0.2s" }}>
            <table class="post-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col" class="post-table-col">Category</th>
                  <th scope="col" class="post-table-col">Tags</th>
                  <th scope="col" class="post-table-col">Date</th>
                  <th scope="col" class="post-table-col">Read</th>
                </tr>
              </thead>
              <tbody>
                {pagedPosts.value.length === 0 ? (
                  <tr>
                    <td class="post-empty" colSpan={5}>
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  pagedPosts.value.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link
                          class="post-table-title"
                          href={`${baseUrl}posts/${post.slug}`}
                        >
                          {post.title}
                        </Link>
                        <span class="post-table-date post-table-date-mobile">
                          {post.date}
                        </span>
                      </td>
                      <td class="post-table-col">
                        <span class="post-category">{post.category}</span>
                      </td>
                      <td class="post-table-col">
                        <div class="post-tags">
                          {post.tags.map((tag) => (
                            <span class="tag-pill" key={`${post.id}-${tag}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td class="post-table-col">{post.date}</td>
                      <td class="post-table-col">{post.readTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div class="pagination">
              <button
                type="button"
                class="pagination-btn"
                disabled={currentPage.value === 1}
                onClick$={() => setPage(currentPage.value - 1)}
              >
                Prev
              </button>
              <span class="pagination-info">
                Page {currentPage.value} of {totalPages.value}
              </span>
              <button
                type="button"
                class="pagination-btn"
                disabled={currentPage.value === totalPages.value}
                onClick$={() => setPage(currentPage.value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "윤석호의 블로그",
  meta: [
    {
      name: "description",
      content: "stone2on 개인 블로그",
    },
  ],
};

