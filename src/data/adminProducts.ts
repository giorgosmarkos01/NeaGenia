import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE || "";
const FALLBACK_IMAGE = "/logo.png";

const toAbs = (u?: string | null): string => {
  if (!u || !u.trim()) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${CDN_BASE}${u}`;
  return `${CDN_BASE}/${u}`;
};

/** DB DATETIME (Date or string, local wall-clock) -> "YYYY-MM-DDTHH:mm" for a <input type="datetime-local">. */
function toDatetimeLocalValue(v: unknown): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v as string);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: string;
  stock: number;
  stockStatus: string;
  categoryName: string | null;
  highlight: 0 | 1;
  coverImage: string;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  hsCode: string | null;
  categoryId: number;
  groupId: number | null;
  stock: number;
  stockStatus: string;
  collaboratorId: number | null;
  descriptionShort: string;
  descriptionFull: string | null;
  specifications: string | null;
  price: string;
  weight: number;
  highlight: 0 | 1;
  images: { id: string; url: string }[];
  variations: {
    id: number;
    name: string;
    variationPrice: string;
    selectionType: "optional" | "exclusive";
  }[];
  discount: {
    type: "fixed" | "percent";
    value: string;
    startsAt: string | null;
    endsAt: string | null;
  } | null;
};

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const rows = await queryRows<AdminProductListItem & RowDataPacket>(
    `
    SELECT
      i.id, i.name, i.slug, i.price, i.stock,
      i.stock_status AS stockStatus,
      i.highlight,
      c.name AS categoryName,
      (
        SELECT imageUrl FROM item_images img
        WHERE img.item_id = i.id
        ORDER BY img.created_at ASC
        LIMIT 1
      ) AS coverImage
    FROM item i
    LEFT JOIN category c ON c.id = i.category_id
    ORDER BY i.created_at DESC
    `
  );

  return rows.map((r) => ({
    ...r,
    coverImage: toAbs(r.coverImage),
  }));
}

export async function getAdminProductById(
  id: string
): Promise<AdminProductDetail | null> {
  const itemRows = await queryRows<AdminProductDetail & RowDataPacket>(
    `
    SELECT
      i.id, i.name, i.slug,
      i.product_code AS productCode,
      i.hs_code AS hsCode,
      i.category_id AS categoryId,
      i.group_id AS groupId,
      i.stock, i.stock_status AS stockStatus,
      i.collaborator_id AS collaboratorId,
      i.description_short AS descriptionShort,
      i.description_full AS descriptionFull,
      i.specifications,
      i.price, i.weight, i.highlight
    FROM item i
    WHERE i.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!itemRows.length) return null;
  const item = itemRows[0];

  const imageRows = await queryRows<
    { id: string; imageUrl: string } & RowDataPacket
  >(
    `SELECT id, imageUrl FROM item_images WHERE item_id = ? ORDER BY created_at ASC`,
    [id]
  );

  const variationRows = await queryRows<
    {
      id: number;
      name: string;
      variationPrice: string;
      selectionType: "optional" | "exclusive";
    } & RowDataPacket
  >(
    `
    SELECT id, name, variation_price AS variationPrice, selection_type AS selectionType
    FROM item_variation
    WHERE item_id = ?
    ORDER BY id ASC
    `,
    [id]
  );

  const [discountRow] = await queryRows<
    {
      type: "fixed" | "percent";
      value: string;
      startsAt: string | null;
      endsAt: string | null;
    } & RowDataPacket
  >(
    `
    SELECT d.discount_type AS type, d.value, d.starts_at AS startsAt, d.ends_at AS endsAt
    FROM discount d
    JOIN discount_item di ON di.discount_id = d.id
    WHERE di.item_id = ? AND d.coupon_code IS NULL AND d.active = 1
    LIMIT 1
    `,
    [id]
  );

  return {
    ...item,
    images: imageRows.map((r) => ({ id: r.id, url: toAbs(r.imageUrl) })),
    variations: variationRows,
    discount: discountRow
      ? {
          type: discountRow.type,
          value: discountRow.value,
          startsAt: toDatetimeLocalValue(discountRow.startsAt),
          endsAt: toDatetimeLocalValue(discountRow.endsAt),
        }
      : null,
  };
}

export async function getCategories() {
  return queryRows<{ id: number; name: string } & RowDataPacket>(
    `SELECT id, name FROM category ORDER BY name ASC`
  );
}

export async function getItemGroups() {
  return queryRows<{ id: number; name: string } & RowDataPacket>(
    `SELECT id, name FROM item_group ORDER BY name ASC`
  );
}

export async function getCollaborators() {
  return queryRows<{ id: number; name: string } & RowDataPacket>(
    `SELECT id, name FROM collaborator ORDER BY name ASC`
  );
}
