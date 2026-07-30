export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { RowDataPacket } from "mysql2";
import { db, queryRows } from "@/lib/db";
import { requireAdminUser } from "@/lib/adminAuth";
import { ProductFieldsSchema, VariationsArraySchema, DiscountFieldsSchema } from "@/lib/productSchema";
import { saveUploadedImages, deleteLocalImageFile } from "@/lib/productImages";
import { upsertProductDiscount } from "@/lib/productDiscount";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

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

  let keepImageIds: string[] = [];
  const keepImageIdsRaw = form.get("keepImageIds");
  if (typeof keepImageIdsRaw === "string" && keepImageIdsRaw.trim()) {
    try {
      keepImageIds = JSON.parse(keepImageIdsRaw);
    } catch {
      return NextResponse.json({ error: "Invalid keepImageIds" }, { status: 400 });
    }
  }

  const imageFiles = form
    .getAll("images")
    .filter((v): v is File => v instanceof File && v.size > 0);
  const newImageUrls = await saveUploadedImages(imageFiles, fields.slug);

  const existingImages = await queryRows<
    { id: string; imageUrl: string } & RowDataPacket
  >(`SELECT id, imageUrl FROM item_images WHERE item_id = ?`, [id]);
  const toRemove = existingImages.filter((img) => !keepImageIds.includes(img.id));

  try {
    await db.query("START TRANSACTION");

    const [result]: any = await db.query(
      `UPDATE item SET
         name = ?, slug = ?, product_code = ?, hs_code = ?, category_id = ?,
         group_id = ?, stock = ?, stock_status = ?, collaborator_id = ?,
         description_short = ?, description_full = ?, specifications = ?,
         price = ?, weight = ?, highlight = ?
       WHERE id = ?`,
      [
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
        id,
      ]
    );

    if (result.affectedRows === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (toRemove.length) {
      const placeholders = toRemove.map(() => "?").join(",");
      await db.query(
        `DELETE FROM item_images WHERE id IN (${placeholders})`,
        toRemove.map((img) => img.id)
      );
    }

    for (const url of newImageUrls) {
      await db.query(
        `INSERT INTO item_images (item_id, item_slug_name, imageUrl) VALUES (?, ?, ?)`,
        [id, fields.slug, url]
      );
    }

    await db.query(`DELETE FROM item_variation WHERE item_id = ?`, [id]);
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

    console.error("[admin/products/:id] update error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }

  for (const img of toRemove) {
    await deleteLocalImageFile(img.imageUrl);
  }

  revalidateTag("products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${fields.slug}`);

  return NextResponse.json({ id, slug: fields.slug });
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const images = await queryRows<{ imageUrl: string } & RowDataPacket>(
    `SELECT imageUrl FROM item_images WHERE item_id = ?`,
    [id]
  );

  const [result]: any = await db.query(`DELETE FROM item WHERE id = ?`, [id]);
  if (result.affectedRows === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  for (const img of images) {
    await deleteLocalImageFile(img.imageUrl);
  }

  revalidateTag("products");
  revalidatePath("/");
  revalidatePath("/products");

  return NextResponse.json({ ok: true });
}
