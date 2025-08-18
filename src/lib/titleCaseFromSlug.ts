// Optional manual mapping για ωραίες ετικέτες
const LABELS: Record<string, string> = {
  "robot-kits": "Robot Kits",
  "robot-parts": "Robot Parts",
  "educational-kits": "Educational Kits",
  accessories: "Accessories",
  tracks: "Tracks",
};

export function titleCaseFromSlug(slug?: string) {
  if (!slug) return "";
  const s = slug.toLowerCase();
  if (LABELS[s]) return LABELS[s];
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
