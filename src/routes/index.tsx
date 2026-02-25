import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { getPostList } from "../data/posts";

const posts = getPostList();

export default component$(() => {
  const searchQuery = useSignal("");
  const selectedCategory = useSignal("all");
  const selectedTag = useSignal("all");
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL;
  const pageSize = 4;

  const categories = useComputed$(() => {
    return [
      "all",
      ...Array.from(new Set(posts.map((post) => post.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    ];
  });

  const tags = useComputed$(() => {
    const scopedPosts =
      selectedCategory.value === "all"
        ? posts
        : posts.filter((post) => post.category === selectedCategory.value);
    return [
      "all",
      ...Array.from(
        new Set(scopedPosts.flatMap((post) => post.tags)),
      ).sort((a, b) => a.localeCompare(b)),
    ];
  });

  const filteredPosts = useComputed$(() => {
    const query = searchQuery.value.trim().toLowerCase();
    return posts.filter((post) => {
      if (
        selectedCategory.value !== "all" &&
        post.category !== selectedCategory.value
      ) {
        return false;
      }
      if (selectedTag.value !== "all" && !post.tags.includes(selectedTag.value)) {
        return false;
      }
      if (!query) {
        return true;
      }
      const searchableText = [
        post.title,
        post.excerpt,
        post.category,
        post.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(query);
    });
  });

  const totalPages = useComputed$(() => {
    return Math.max(1, Math.ceil(filteredPosts.value.length / pageSize));
  });

  const requestedPage = useComputed$(() => {
    const raw = location.url.searchParams.get("page");
    const parsed = Number.parseInt(raw ?? "1", 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return 1;
    }
    return parsed;
  });

  const currentPage = useComputed$(() => {
    return Math.min(requestedPage.value, totalPages.value);
  });

  const pagedPosts = useComputed$(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredPosts.value.slice(start, start + pageSize);
  });

  const setPage = $(async (nextPage: number) => {
    const clampedPage = Math.min(Math.max(1, nextPage), totalPages.value);
    const href = clampedPage <= 1 ? baseUrl : `${baseUrl}?page=${clampedPage}`;
    await navigate(href, {
      scroll: false,
    });
  });

  const onSearchInput = $((event: Event) => {
    searchQuery.value = (event.target as HTMLInputElement).value;
    void setPage(1);
  });

  const onCategoryChange = $((event: Event) => {
    selectedCategory.value = (event.target as HTMLSelectElement).value;
    selectedTag.value = "all";
    void setPage(1);
  });

  const onTagChange = $((event: Event) => {
    selectedTag.value = (event.target as HTMLSelectElement).value;
    void setPage(1);
  });

  const clearFilters = $(() => {
    searchQuery.value = "";
    selectedCategory.value = "all";
    selectedTag.value = "all";
    void setPage(1);
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
            <span class="post-meta">
              {filteredPosts.value.length} / {posts.length} shown
            </span>
          </div>

          <div class="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
            <label class="sr-only" for="post-search">
              Search posts
            </label>
            <input
              id="post-search"
              class="w-full rounded-[30px] border border-base-content/20 bg-base-100 px-4 py-2 text-sm text-base-content outline-none ring-primary/20 transition focus:ring-2"
              type="search"
              placeholder="Search title, excerpt, tags..."
              value={searchQuery.value}
              onInput$={onSearchInput}
            />
            <label class="sr-only" for="post-category">
              Filter by category
            </label>
            <select
              id="post-category"
              class="w-full rounded-[30px] border border-base-content/20 bg-base-100 px-4 py-2 text-sm text-base-content outline-none ring-primary/20 transition focus:ring-2"
              value={selectedCategory.value}
              onChange$={onCategoryChange}
            >
              {categories.value.map((category) => (
                <option value={category} key={`category-${category}`}>
                  {category === "all" ? "All categories" : category}
                </option>
              ))}
            </select>
            <label class="sr-only" for="post-tag">
              Filter by tag
            </label>
            <select
              id="post-tag"
              class="w-full rounded-[30px] border border-base-content/20 bg-base-100 px-4 py-2 text-sm text-base-content outline-none ring-primary/20 transition focus:ring-2"
              value={selectedTag.value}
              onChange$={onTagChange}
            >
              {tags.value.map((tag) => (
                <option value={tag} key={`tag-${tag}`}>
                  {tag === "all" ? "All tags" : tag}
                </option>
              ))}
            </select>
            <button
              type="button"
              class="pagination-btn"
              disabled={
                !searchQuery.value &&
                selectedCategory.value === "all" &&
                selectedTag.value === "all"
              }
              onClick$={clearFilters}
            >
              Clear
            </button>
          </div>

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
