import type { RequestHandler } from "@builder.io/qwik-city";

const normalizeBasePath = (value: string) => {
  if (!value || value === "/") {
    return "/";
  }
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

export const onGet: RequestHandler = ({ headers, send, url }) => {
  const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
  const sitemapUrl = new URL(`${basePath}sitemap.xml`, url.origin).toString();
  const body = [`User-agent: *`, `Allow: /`, `Sitemap: ${sitemapUrl}`].join(
    "\n",
  );

  headers.set("Content-Type", "text/plain; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=3600");
  send(200, body);
};
