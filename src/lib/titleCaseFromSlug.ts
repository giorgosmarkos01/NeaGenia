// lib/titleCaseFromSlug.ts
const LABELS: Record<string, string> = {
  "robot-kits": "Robot Kits",
  "robot-parts": "Robot Parts",
  "educational-kits": "Educational Kits",
  accessories: "Accessories",
  tracks: "Tracks",
};

export function titleCaseFromSlug(slug?: string) {
  if (!slug) return "";
  if (LABELS[slug]) return LABELS[slug];
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
