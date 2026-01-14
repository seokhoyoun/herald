type PostAccent = "ember" | "aqua" | "lime" | "sand" | "rose";

export type PostFrontmatter = {
  title?: string;
  excerpt?: string;
  description?: string;
  date?: string;
  readTime?: string;
  tags?: string[];
  category?: string;
  accent?: PostAccent;
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  category: string;
  accent: PostAccent;
};

type MdxModule = {
  frontmatter?: PostFrontmatter;
};

const accents = new Set<PostAccent>(["ember", "aqua", "lime", "sand", "rose"]);
const defaultAccent: PostAccent = "sand";

const mdxModules = import.meta.glob("/src/routes/posts/*/index.mdx", {
  eager: true,
});

const parseDate = (value: string) => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? -Infinity : time;
};

const normalizeTags = (tags: PostFrontmatter["tags"]) => {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags.filter((tag): tag is string => typeof tag === "string");
};

const normalizeAccent = (accent: PostFrontmatter["accent"]) => {
  if (accent && accents.has(accent)) {
    return accent;
  }
  return defaultAccent;
};

const toPostListItem = (path: string, mod: MdxModule): PostListItem => {
  const slug = path.split("/").slice(-2, -1)[0] ?? "";
  const meta = mod.frontmatter ?? {};
  return {
    id: slug,
    slug,
    title: meta.title ?? slug,
    excerpt: meta.excerpt ?? meta.description ?? "",
    date: meta.date ?? "",
    readTime: meta.readTime ?? "",
    tags: normalizeTags(meta.tags),
    category: meta.category ?? "General",
    accent: normalizeAccent(meta.accent),
  };
};

export const getPostList = () => {
  return Object.entries(mdxModules)
    .map(([path, mod]) => toPostListItem(path, mod as MdxModule))
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
};

export const getPostBySlug = (slug: string) => {
  return getPostList().find((post) => post.slug === slug) ?? null;
};
