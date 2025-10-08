export function formatCategoryName(name: string): string {
  return name
    .replace(/-/g, " ")                 // replace dashes with spaces
    .replace(/\b\w/g, (m) => m.toUpperCase()); // capitalize each word
}
