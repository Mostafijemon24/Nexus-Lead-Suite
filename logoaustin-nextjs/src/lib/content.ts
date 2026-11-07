import fs from "node:fs";
import path from "node:path";
import type { AnyDoc, PageDoc, PostDoc } from "@/types/content";

const ROOT = path.join(process.cwd(), "src", "content");

function readDir<T>(dir: string): T[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(full, f), "utf8")) as T);
}

let pagesCache: PageDoc[] | null = null;
let postsCache: AnyDoc[] | null = null;

export function getAllPages(): PageDoc[] {
  if (!pagesCache) pagesCache = readDir<PageDoc>("pages");
  return pagesCache;
}

/** Blog posts: classic posts (rendered HTML) and the two Elementor-built posts. */
export function getAllPosts(): AnyDoc[] {
  if (!postsCache) {
    postsCache = readDir<AnyDoc>("posts").sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  return postsCache;
}

export function getPage(slug: string): PageDoc | undefined {
  return getAllPages().find((p) => p.slug === slug);
}

export function getPost(slug: string): AnyDoc | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getDoc(slug: string): AnyDoc | undefined {
  return getPage(slug) ?? getPost(slug);
}

export function isPostDoc(doc: AnyDoc): doc is PostDoc {
  return doc.template === "post";
}

/** Every indexable route slug (excluding the home page). */
export function getAllSlugs(): string[] {
  return [...getAllPages().filter((p) => p.slug !== "home").map((p) => p.slug), ...getAllPosts().map((p) => p.slug)];
}

export function getPostsByCategoryHint(slugs: string[]): AnyDoc[] {
  const all = getAllPosts();
  return slugs.map((s) => all.find((p) => p.slug === s)).filter(Boolean) as AnyDoc[];
}

export function readingTime(words: number): string {
  return `${Math.max(1, Math.round(words / 220))} min read`;
}
