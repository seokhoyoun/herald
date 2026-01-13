import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  TagsIcon,
} from "lucide-qwik";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
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
    accent: "lime",
  },
];

export default component$(() => {
  const activeTag = useSignal<string>("All");
  const view = useSignal<"grid" | "list">("grid");
  const spotlight = useSignal<Post>(posts[0]);

  const allTags = Array.from(
    new Set(["All", ...posts.flatMap((post) => post.tags)]),
  );

  const filteredPosts = useComputed$(() => {
    if (activeTag.value === "All") {
      return posts;
    }
    return posts.filter((post) => post.tags.includes(activeTag.value));
  });

  const setTag = $((tag: string) => {
    activeTag.value = tag;
    const next =
      tag === "All"
        ? posts[0]
        : posts.find((post) => post.tags.includes(tag)) ?? posts[0];
    spotlight.value = next;
  });

  return (
    <>
      <section
        class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
        style={{ "--delay": "0.06s" }}
      >
        <div class="enter space-y-6">
          <div class="badge badge-outline uppercase tracking-[0.4em]">
            NOCTURNE / QWIK JOURNAL
          </div>
          <h1 class="text-4xl font-semibold md:text-5xl">
            다크 톤으로 읽히는 미니멀 저널
          </h1>
          <p class="max-w-xl text-base-content/70">
            Qwik과 SQLite로 가볍게 쌓아 올리는 개인 블로그. 빠른 렌더와
            선명한 구조로 긴 글을 편하게 읽을 수 있도록 설계합니다.
          </p>
          <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary">
              <BookOpenIcon class="h-4 w-4" />
              최신 글 읽기
            </button>
            <button class="btn btn-ghost">
              <StarIcon class="h-4 w-4" />
              뉴스레터 구독
            </button>
          </div>
          <div class="stats stats-vertical border border-base-300 bg-base-200/60 md:stats-horizontal">
            <div class="stat">
              <div class="stat-title">Last build</div>
              <div class="stat-value text-2xl">2026.01</div>
            </div>
            <div class="stat">
              <div class="stat-title">Drafts</div>
              <div class="stat-value text-2xl">12</div>
            </div>
            <div class="stat">
              <div class="stat-title">Reading time</div>
              <div class="stat-value text-2xl">4-8m</div>
            </div>
          </div>
        </div>
        <div class="enter" style={{ "--delay": "0.12s" }}>
          <div class="card border border-base-300 bg-base-200/60 shadow-xl">
            <div class="card-body space-y-3">
              <div class="flex items-center justify-between text-sm text-base-content/60">
                <span>Spotlight</span>
                <span class="badge badge-secondary">LIVE</span>
              </div>
              <h2 class="text-2xl font-semibold">{spotlight.value.title}</h2>
              <p class="text-base-content/70">{spotlight.value.excerpt}</p>
              <div class="flex flex-wrap gap-3 text-sm text-base-content/60">
                <span class="inline-flex items-center gap-2">
                  <ClockIcon class="h-4 w-4" />
                  {spotlight.value.readTime}
                </span>
                <span>{spotlight.value.date}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                {spotlight.value.tags.map((tag) => (
                  <span class="badge badge-outline" key={`${spotlight.value.id}-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div class="card-actions justify-end">
                <a class="btn btn-sm btn-outline" href={`/posts/${spotlight.value.slug}`}>
                  읽기 시작
                  <ArrowUpRightIcon class="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="enter space-y-4" style={{ "--delay": "0.18s" }}>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="tabs tabs-boxed">
            <button
              type="button"
              class={`tab ${view.value === "grid" ? "tab-active" : ""}`}
              onClick$={() => (view.value = "grid")}
            >
              그리드
            </button>
            <button
              type="button"
              class={`tab ${view.value === "list" ? "tab-active" : ""}`}
              onClick$={() => (view.value = "list")}
            >
              리스트
            </button>
          </div>
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <TagsIcon class="h-4 w-4" />
            태그 필터
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              class={`btn btn-sm ${activeTag.value === tag ? "btn-primary" : "btn-ghost"}`}
              onClick$={() => setTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section
        class={`enter grid gap-6 ${view.value === "grid" ? "md:grid-cols-2" : "grid-cols-1"}`}
        style={{ "--delay": "0.24s" }}
      >
        {filteredPosts.value.map((post) => (
          <article
            key={post.id}
            class="card border border-base-300 bg-base-200/60 shadow-xl"
            onClick$={() => (spotlight.value = post)}
          >
            <div class="card-body space-y-3">
              <div class="flex items-center justify-between text-sm text-base-content/60">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
              <h3 class="text-xl font-semibold">{post.title}</h3>
              <p class="text-base-content/70">{post.excerpt}</p>
              <div class="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span class="badge badge-outline" key={`${post.id}-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div class="card-actions justify-between">
                <span class="text-xs uppercase tracking-[0.2em] text-base-content/50">
                  {post.accent}
                </span>
                <a class="btn btn-sm btn-ghost" href={`/posts/${post.slug}`}>
                  자세히
                  <ArrowUpRightIcon class="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section
        class="enter grid gap-6 rounded-2xl border border-base-300 bg-base-200/60 p-8 lg:grid-cols-[1.2fr_0.8fr]"
        style={{ "--delay": "0.3s" }}
      >
        <div>
          <h2 class="text-2xl font-semibold">다음 글을 위한 질문 상자</h2>
          <p class="mt-2 text-base-content/70">
            깊이 다루고 싶은 주제를 남겨주세요. Qwik, SQLite, 글쓰기, 디자인
            모두 환영합니다.
          </p>
        </div>
        <form class="flex flex-col gap-3">
          <input
            type="text"
            placeholder="예: SQLite 마이그레이션 설계"
            class="input input-bordered"
          />
          <button type="button" class="btn btn-primary">
            보내기
          </button>
        </form>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Herald Blog",
  meta: [
    {
      name: "description",
      content: "daisyUI 테마 선택이 가능한 인터랙티브 블로그",
    },
  ],
};
