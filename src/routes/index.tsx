import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ArrowUpRightIcon, TagsIcon } from "lucide-qwik";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  category: string;
  accent: "ember" | "aqua" | "lime" | "sand" | "rose";
};

const posts: Post[] = [
  {
    id: "quiet-sqlite",
    slug: "quiet-sqlite",
    title: "SQLite로 만드는 가벼운 블로그",
    excerpt: "로컬 우선 구조, 단순한 스키마, 그리고 검색을 빠르게 만드는 인덱스 설계.",
    date: "2026-01-13",
    readTime: "6 min",
    tags: ["DB", "SQLite"],
    category: "Database",
    accent: "sand",
  },
  {
    id: "qwik-motion",
    slug: "qwik-motion",
    title: "Qwik에서 인터랙션을 가볍게",
    excerpt: "신호 기반 UI로 필요한 순간에만 하이드레이션을 일으키는 방법.",
    date: "2026-01-09",
    readTime: "5 min",
    tags: ["Qwik", "UI"],
    category: "Framework",
    accent: "aqua",
  },
  {
    id: "editorial-layout",
    slug: "editorial-layout",
    title: "에디토리얼 레이아웃 설계 노트",
    excerpt: "타이포그래피 비율, 여백, 컬러 대비로 읽기 경험을 다듬는 과정.",
    date: "2026-01-05",
    readTime: "7 min",
    tags: ["Design"],
    category: "Design",
    accent: "ember",
  },
  {
    id: "content-pipeline",
    slug: "content-pipeline",
    title: "콘텐츠 파이프라인: 초안에서 배포까지",
    excerpt: "메타데이터, 이미지 처리, 미리보기 링크를 자동화하는 흐름.",
    date: "2026-01-02",
    readTime: "8 min",
    tags: ["Workflow"],
    category: "Workflow",
    accent: "rose",
  },
  {
    id: "reading-rhythm",
    slug: "reading-rhythm",
    title: "긴 글을 위한 리듬 만들기",
    excerpt: "문단 길이, 소제목 간격, 요약 카드로 독서 흐름을 유지하기.",
    date: "2025-12-28",
    readTime: "4 min",
    tags: ["Writing", "UX"],
    category: "Writing",
    accent: "lime",
  },
];

export default component$(() => {
  const view = useSignal<"grid" | "list">("grid");
  const activeCategory = useSignal<string>("All");

  const categories = Array.from(
    new Set(["All", ...posts.map((post) => post.category)]),
  );

  const filteredPosts = useComputed$(() => {
    if (activeCategory.value === "All") {
      return posts;
    }
    return posts.filter((post) => post.category === activeCategory.value);
  });

  const setCategory = $((category: string) => {
    activeCategory.value = category;
  });

  return (
    <>
      <section class="section pt-10">
        <div class="container">
          <div class="grid gap-12">
            <div class="space-y-4">
              <p class="eyebrow">NOCTURNE / QWIK JOURNAL</p>
              <h1>윤석호의 블로그</h1>
              <p class="max-w-xl text-base-content/80">
                Qwik과 SQLite로 기록하는 개인 작업실. 작은 실험, 글쓰기 노트,
                기술 메모를 차분하게 아카이빙합니다.
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
            <h2 class="section-title">Posts</h2>
            <div class="flex items-center gap-2 text-sm font-secondary text-base-content/50">
              <TagsIcon class="h-4 w-4" />
              Categories
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <button
                type="button"
                class={`view-tab ${view.value === "grid" ? "active" : ""}`}
                onClick$={() => (view.value = "grid")}
              >
                Grid
              </button>
              <button
                type="button"
                class={`view-tab ${view.value === "list" ? "active" : ""}`}
                onClick$={() => (view.value = "list")}
              >
                List
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  class={`tag-pill ${
                    activeCategory.value === category ? "active" : ""
                  }`}
                  onClick$={() => setCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div
            class={`post-grid ${view.value === "grid" ? "two" : ""}`}
            style={{ "--delay": "0.2s" }}
          >
            {filteredPosts.value.map((post) => (
              <article key={post.id} class="post-card">
                <span class="post-category">{post.category}</span>
                <h3 class="h5 mt-4">
                  <a class="hover:text-primary" href={`/posts/${post.slug}`}>
                    {post.title}
                  </a>
                </h3>
                <div class="post-meta">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <p class="mt-4 text-base-content/80">
                  {post.excerpt}
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span class="tag-pill" key={`${post.id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div class="mt-6">
                  <a class="btn btn-outline-primary" href={`/posts/${post.slug}`}>
                    Read More
                    <ArrowUpRightIcon class="ml-2 inline-block h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
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
      content: "Qwik과 SQLite로 기록하는 윤석호의 개인 작업실",
    },
  ],
};

