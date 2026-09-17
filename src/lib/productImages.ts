import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = "svkeshop/items";
const CONTENT_FOLDER = "svkeshop/content";

function uploadBuffer(buffer: Buffer, publicId: string, folder = FOLDER): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, overwrite: false },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/** Uploads a single image meant to be embedded inline in a product's markdown
 *  description/specifications (not part of the product's own image gallery). */
export async function uploadContentImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicId = `content-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return uploadBuffer(buffer, publicId, CONTENT_FOLDER);
}

/** Uploads image files to Cloudinary and returns their public URLs. */
export async function saveUploadedImages(
  files: File[],
  slug: string
): Promise<string[]> {
  if (!files.length) return [];

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = `${slug}-${Date.now()}-${i}`;
    urls.push(await uploadBuffer(buffer, publicId));
  }
  return urls;
}

/** Best-effort delete of a Cloudinary-hosted image (no-op for URLs outside our folder, e.g. legacy/seed data). */
export async function deleteLocalImageFile(url: string): Promise<void> {
  const marker = `/${FOLDER}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;

  const afterFolder = url.slice(idx + 1); // "svkeshop/items/<public_id>.<ext>"
  const publicId = afterFolder.replace(/\.[a-zA-Z0-9]+$/, "");

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ignore — image may already be gone
  }
}
