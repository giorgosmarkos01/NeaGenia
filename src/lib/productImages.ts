import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "items");

function extFromFile(file: File): string {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName) return fromName;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  return ".jpg";
}

/** Saves uploaded image files under public/uploads/items and returns their public URLs. */
export async function saveUploadedImages(
  files: File[],
  slug: string
): Promise<string[]> {
  if (!files.length) return [];
  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${slug}-${Date.now()}-${i}${extFromFile(file)}`;
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    urls.push(`/uploads/items/${filename}`);
  }
  return urls;
}

/** Best-effort delete of a locally-stored image file (no-op for external/CDN URLs). */
export async function deleteLocalImageFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/items/")) return;
  const filename = path.basename(url);
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // file may not exist locally (e.g. seeded/CDN data) — ignore
  }
}
