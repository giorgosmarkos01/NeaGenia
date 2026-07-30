export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/adminAuth";
import { listAdminProducts } from "@/data/adminProducts";
import { ProductFieldsSchema, VariationsArraySchema, DiscountFieldsSchema } from "@/lib/productSchema";
import { saveUploadedImages } from "@/lib/productImages";
import { upsertProductDiscount } from "@/lib/productDiscount";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await listAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const raw = Object.fromEntries(form.entries());

  const parsed = ProductFieldsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid product data" },
      { status: 400 }
    );
  }
  const fields = parsed.data;

  const discountParsed = DiscountFieldsSchema.safeParse(raw);
  if (!discountParsed.success) {
    return NextResponse.json(
      { error: discountParsed.error.issues[0]?.message || "Invalid discount data" },
      { status: 400 }
    );
  }
  const discount = discountParsed.data;

  let variations: { name: string; variationPrice: number; selectionType: string }[] = [];
  const variationsRaw = form.get("variations");
  if (typeof variationsRaw === "string" && variationsRaw.trim()) {
    try {
      const variationsParsed = VariationsArraySchema.safeParse(
        JSON.parse(variationsRaw)
      );
      if (!variationsParsed.success) {
        return NextResponse.json({ error: "Invalid variations" }, { status: 400 });
      }
      variations = variationsParsed.data;
    } catch {
      return NextResponse.json({ error: "Invalid variations" }, { status: 400 });
    }
  }

  const imageFiles = form.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);
  const imageUrls = await saveUploadedImages(imageFiles, fields.slug);

  const id = uuidv4();

  try {
    await db.query("START TRANSACTION");

    await db.query(
      `INSERT INTO item
         (id, name, slug, product_code, hs_code, category_id, group_id, stock,
          stock_status, collaborator_id, description_short, description_full,
          specifications, price, weight, highlight)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        fields.name,
        fields.slug,
        fields.productCode,
        fields.hsCode,
        fields.categoryId,
        fields.groupId,
        fields.stock,
        fields.stockStatus,
        fields.collaboratorId,
        fields.descriptionShort,
        fields.descriptionFull,
        fields.specifications,
        fields.price,
        fields.weight,
        fields.highlight ? 1 : 0,
      ]
    );

    for (const url of imageUrls) {
      await db.query(
        `INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES (?, ?, ?)`,
        [id, fields.slug, url]
      );
    }

    for (const v of variations) {
      await db.query(
        `INSERT INTO item_variation (item_id, name, variation_price, selection_type) VALUES (?, ?, ?, ?)`,
        [id, v.name, v.variationPrice, v.selectionType]
      );
    }

    await upsertProductDiscount(id, fields.name, discount);

    await db.query("COMMIT");
  } catch (e: any) {
    try {
      await db.query("ROLLBACK");
    } catch {}

    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A product with that name, slug, or product code already exists." },
        { status: 409 }
      );
    }

    console.error("[admin/products] create error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }

  revalidateTag("products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${fields.slug}`);

  return NextResponse.json({ id, slug: fields.slug }, { status: 201 });
}
