import type { Article } from "@/content/home";

/** Pick articles related to `current`: score by shared category (+2) and overlapping
 *  tags (+1 each); fill from the most-recent remaining articles when there aren't
 *  enough matches. Excludes the current article. `all` is assumed newest-first. */
export function getRelatedArticles(current: Article, all: Article[], limit = 4): Article[] {
  const others = all.filter((a) => a.slug !== current.slug);
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));

  const scored = others
    .map((a) => {
      const tagOverlap = a.tags.filter((t) => currentTags.has(t.toLowerCase())).length;
      const score = (a.category === current.category ? 2 : 0) + tagOverlap;
      return { article: a, score };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((s) => s.article);

  const fill = others.filter((a) => !scored.includes(a));
  return [...scored, ...fill].slice(0, limit);
}
