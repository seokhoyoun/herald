import type { RequestHandler } from "@builder.io/qwik-city";
import { getPostList } from "../../data/posts";

const normalizeBasePath = (value: string) => {
  if (!value || value === "/") {
    return "/";
  }
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

const escapeXml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
};

const toAbsoluteUrl = (origin: string, basePath: string, path: string) => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`${basePath}${normalizedPath}`, origin).toString();
};

const toLastMod = (value: string) => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString();
};

export const onGet: RequestHandler = ({ headers, send, url }) => {
  const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
  const staticPages = ["", "about", "essays", "notes", "workouts"];
  const postPages = getPostList().map((post) => ({
    path: `posts/${post.slug}`,
    lastmod: toLastMod(post.date),
  }));

  const entries = [
    ...staticPages.map((path) => ({ path, lastmod: null as string | null })),
    ...postPages,
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => {
      const loc = escapeXml(toAbsoluteUrl(url.origin, basePath, entry.path));
      if (!entry.lastmod) {
        return `<url><loc>${loc}</loc></url>`;
      }
      return `<url><loc>${loc}</loc><lastmod>${entry.lastmod}</lastmod></url>`;
    }),
    "</urlset>",
  ].join("\n");

  headers.set("Content-Type", "application/xml; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=3600");
  send(200, body);
};
