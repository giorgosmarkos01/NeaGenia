export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { uploadContentImage } from "@/lib/productImages";

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  try {
    const url = await uploadContentImage(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error("[admin/content-images] upload error:", e);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
