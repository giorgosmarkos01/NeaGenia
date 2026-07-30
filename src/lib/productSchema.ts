import { z } from "zod";

export const STOCK_STATUSES = [
  "available_immediately",
  "available_after_ordering",
  "available_3_to_5_days",
  "available_7_to_10_days",
  "currently_unavailable",
  "preorder",
  "ask_for_price",
] as const;

export const SELECTION_TYPES = ["optional", "exclusive"] as const;

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

// "YYYY-MM-DDTHH:mm" (datetime-local input value) -> "YYYY-MM-DD HH:mm:00" (MySQL DATETIME)
const emptyToNullDatetime = (v: unknown) => {
  const cleaned = emptyToNull(v);
  if (typeof cleaned !== "string") return cleaned;
  const [datePart, timePart = ""] = cleaned.split("T");
  const [hh = "00", mm = "00", ss = "00"] = timePart.split(":");
  return `${datePart} ${hh}:${mm}:${ss}`;
};

export const ProductFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  productCode: z.preprocess(emptyToNull, z.string().max(30).nullable()),
  hsCode: z.preprocess(emptyToNull, z.string().max(30).nullable()),
  categoryId: z.coerce.number().int().positive("Category is required"),
  groupId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable()),
  collaboratorId: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable()
  ),
  stock: z.coerce.number().int().min(0),
  stockStatus: z.enum(STOCK_STATUSES),
  descriptionShort: z.string().trim().min(1, "Short description is required").max(600),
  descriptionFull: z.preprocess(emptyToNull, z.string().nullable()),
  specifications: z.preprocess(emptyToNull, z.string().nullable()),
  price: z.coerce.number().positive("Price must be greater than 0"),
  weight: z.coerce.number().int().min(0),
  highlight: z.preprocess((v) => v === "true", z.boolean()),
});

export type ProductFields = z.infer<typeof ProductFieldsSchema>;

export const VariationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  variationPrice: z.coerce.number().min(0),
  selectionType: z.enum(SELECTION_TYPES),
});

export const VariationsArraySchema = z.array(VariationSchema);

export const DISCOUNT_TYPES = ["fixed", "percent"] as const;

export const DiscountFieldsSchema = z
  .object({
    onSale: z.preprocess((v) => v === "true", z.boolean()),
    discountType: z.enum(DISCOUNT_TYPES).default("percent"),
    discountValue: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
      z.coerce.number().min(0)
    ),
    discountStartsAt: z.preprocess(emptyToNullDatetime, z.string().nullable()),
    discountEndsAt: z.preprocess(emptyToNullDatetime, z.string().nullable()),
  })
  .refine((d) => !d.onSale || d.discountValue > 0, {
    message: "Discount value must be greater than 0",
    path: ["discountValue"],
  })
  .refine((d) => !d.onSale || d.discountType !== "percent" || d.discountValue <= 100, {
    message: "Percent discount cannot exceed 100",
    path: ["discountValue"],
  })
  .refine(
    (d) =>
      !d.discountStartsAt ||
      !d.discountEndsAt ||
      new Date(d.discountEndsAt) >= new Date(d.discountStartsAt),
    { message: "End date must be after start date", path: ["discountEndsAt"] }
  );

export type DiscountFields = z.infer<typeof DiscountFieldsSchema>;
