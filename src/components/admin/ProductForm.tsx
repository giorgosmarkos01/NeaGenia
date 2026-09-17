"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STOCK_STATUSES, SELECTION_TYPES, DISCOUNT_TYPES } from "@/lib/productSchema";
import { slugify } from "@/lib/slugify";
import { useToast } from "./ToastProvider";

/** Small helper button that uploads an image and inserts it as Markdown at the
 *  textarea's current cursor position — lets admins add images between
 *  paragraphs in the Full Description / Specifications fields. */
function InsertImageButton({
  textareaRef,
  onInsert,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (next: string) => void;
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("image", file);
      const res = await fetch("/api/admin/content-images", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        showToast(data.error || "Failed to upload image", "error");
        return;
      }

      const textarea = textareaRef.current;
      const markdown = `\n\n![](${data.url})\n\n`;
      if (textarea) {
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        const next = textarea.value.slice(0, start) + markdown + textarea.value.slice(end);
        onInsert(next);
        // restore focus/cursor after the inserted markdown, once React re-renders
        requestAnimationFrame(() => {
          textarea.focus();
          const pos = start + markdown.length;
          textarea.setSelectionRange(pos, pos);
        });
      } else {
        onInsert(markdown);
      }
      showToast("Image inserted", "success");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "+ Insert image"}
      </button>
    </>
  );
}

type Option = { id: number; name: string };

type ExistingImage = { id: string; url: string };

type Variation = {
  name: string;
  variationPrice: string;
  selectionType: (typeof SELECTION_TYPES)[number];
};

export type ProductFormInitialValues = {
  name: string;
  slug: string;
  productCode: string;
  hsCode: string;
  categoryId: string;
  groupId: string;
  collaboratorId: string;
  stock: string;
  stockStatus: string;
  descriptionShort: string;
  descriptionFull: string;
  specifications: string;
  price: string;
  weight: string;
  highlight: boolean;
  images: ExistingImage[];
  variations: Variation[];
  onSale: boolean;
  discountType: (typeof DISCOUNT_TYPES)[number];
  discountValue: string;
  discountStartsAt: string;
  discountEndsAt: string;
};

const EMPTY_VALUES: ProductFormInitialValues = {
  name: "",
  slug: "",
  productCode: "",
  hsCode: "",
  categoryId: "",
  groupId: "",
  collaboratorId: "",
  stock: "0",
  stockStatus: "available_after_ordering",
  descriptionShort: "",
  descriptionFull: "",
  specifications: "",
  price: "",
  weight: "0",
  highlight: false,
  images: [],
  variations: [],
  onSale: false,
  discountType: "percent",
  discountValue: "0",
  discountStartsAt: "",
  discountEndsAt: "",
};

const inputClass =
  "w-full bg-white text-black py-2.5 px-3 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-black transition-all";
const labelClass = "block mb-1.5 text-sm font-medium";

function Section({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={first ? "" : "border-t pt-6"}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ProductForm({
  mode,
  productId,
  initialValues,
  categories,
  groups,
  collaborators,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormInitialValues>;
  categories: Option[];
  groups: Option[];
  collaborators: Option[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const values = { ...EMPTY_VALUES, ...initialValues };

  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [productCode, setProductCode] = useState(values.productCode);
  const [hsCode, setHsCode] = useState(values.hsCode);
  const [categoryId, setCategoryId] = useState(values.categoryId);
  const [groupId, setGroupId] = useState(values.groupId);
  const [collaboratorId, setCollaboratorId] = useState(values.collaboratorId);
  const [stock, setStock] = useState(values.stock);
  const [stockStatus, setStockStatus] = useState(values.stockStatus);
  const [descriptionShort, setDescriptionShort] = useState(values.descriptionShort);
  const [descriptionFull, setDescriptionFull] = useState(values.descriptionFull);
  const [specifications, setSpecifications] = useState(values.specifications);
  const [price, setPrice] = useState(values.price);
  const [weight, setWeight] = useState(values.weight);
  const [highlight, setHighlight] = useState(values.highlight);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(values.images);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [variations, setVariations] = useState<Variation[]>(values.variations);

  const [onSale, setOnSale] = useState(values.onSale);
  const [discountType, setDiscountType] = useState(values.discountType);
  const [discountValue, setDiscountValue] = useState(values.discountValue);
  const [discountStartsAt, setDiscountStartsAt] = useState(values.discountStartsAt);
  const [discountEndsAt, setDiscountEndsAt] = useState(values.discountEndsAt);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const descriptionFullRef = useRef<HTMLTextAreaElement>(null);
  const specificationsRef = useRef<HTMLTextAreaElement>(null);

  const newFilePreviews = useMemo(
    () => newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newFiles]
  );

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariation = () => {
    setVariations((prev) => [
      ...prev,
      { name: "", variationPrice: "0", selectionType: "optional" },
    ]);
  };

  const updateVariation = (index: number, patch: Partial<Variation>) => {
    setVariations((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  };

  const removeVariation = (index: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("slug", slug);
      fd.set("productCode", productCode);
      fd.set("hsCode", hsCode);
      fd.set("categoryId", categoryId);
      fd.set("groupId", groupId);
      fd.set("collaboratorId", collaboratorId);
      fd.set("stock", stock);
      fd.set("stockStatus", stockStatus);
      fd.set("descriptionShort", descriptionShort);
      fd.set("descriptionFull", descriptionFull);
      fd.set("specifications", specifications);
      fd.set("price", price);
      fd.set("weight", weight);
      fd.set("highlight", highlight ? "true" : "false");
      fd.set("variations", JSON.stringify(variations));
      fd.set("onSale", onSale ? "true" : "false");
      fd.set("discountType", discountType);
      fd.set("discountValue", discountValue);
      fd.set("discountStartsAt", discountStartsAt);
      fd.set("discountEndsAt", discountEndsAt);
      if (mode === "edit") {
        fd.set("keepImageIds", JSON.stringify(existingImages.map((i) => i.id)));
      }
      for (const file of newFiles) fd.append("images", file);

      const url =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.error || "Something went wrong";
        setError(message);
        showToast(message, "error");
        return;
      }

      showToast(mode === "create" ? "Product created" : "Product updated", "success");
      router.push("/admin");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Section title="Basic Info" first>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Product Code</label>
          <input
            className={inputClass}
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>HS Code</label>
          <input
            className={inputClass}
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Group (optional)</label>
          <select
            className={inputClass}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">None</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Collaborator (optional)</label>
          <select
            className={inputClass}
            value={collaboratorId}
            onChange={(e) => setCollaboratorId(e.target.value)}
          >
            <option value="">None</option>
            {collaborators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Stock Status</label>
          <select
            className={inputClass}
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            {STOCK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Stock</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Price (€)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Weight (g)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
              className="h-4 w-4"
            />
            Feature on homepage
          </label>
        </div>
      </div>
      </Section>

      <Section title="Description">
      <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea
          rows={2}
          maxLength={600}
          className={`${inputClass} resize-none`}
          value={descriptionShort}
          onChange={(e) => setDescriptionShort(e.target.value)}
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Full Description (Markdown supported)</label>
          <InsertImageButton textareaRef={descriptionFullRef} onInsert={setDescriptionFull} />
        </div>
        <textarea
          ref={descriptionFullRef}
          rows={6}
          className={`${inputClass} resize-none`}
          value={descriptionFull}
          onChange={(e) => setDescriptionFull(e.target.value)}
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Specifications (Markdown supported)</label>
          <InsertImageButton textareaRef={specificationsRef} onInsert={setSpecifications} />
        </div>
        <textarea
          ref={specificationsRef}
          rows={4}
          className={`${inputClass} resize-none`}
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
        />
      </div>
      </div>
      </Section>

      <Section title="Discount">
      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="h-4 w-4"
          />
          This product is on sale
        </label>

        {onSale && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Discount Type</label>
              <select
                className={inputClass}
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as (typeof DISCOUNT_TYPES)[number])
                }
              >
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "percent" ? "Percent off (%)" : "Fixed amount off (€)"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {discountType === "percent" ? "Percent off" : "Amount off (€)"}
              </label>
              <input
                type="number"
                min={0}
                max={discountType === "percent" ? 100 : undefined}
                step="0.01"
                className={inputClass}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Starts (optional)</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={discountStartsAt}
                onChange={(e) => setDiscountStartsAt(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Ends (optional)</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={discountEndsAt}
                onChange={(e) => setDiscountEndsAt(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      </Section>

      <Section title="Images">
      <div>
        {existingImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {existingImages.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={img.id} className="relative">
                <img
                  src={img.url}
                  alt=""
                  className="h-20 w-20 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {newFilePreviews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {newFilePreviews.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={p.url} className="relative">
                <img
                  src={p.url}
                  alt=""
                  className="h-20 w-20 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setNewFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
          }
          className="block text-sm"
        />
      </div>
      </Section>

      <Section title="Variations">
      <div>
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={addVariation}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Add variation
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {variations.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="Name"
                value={v.name}
                onChange={(e) => updateVariation(i, { name: e.target.value })}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${inputClass} w-32`}
                placeholder="Extra price"
                value={v.variationPrice}
                onChange={(e) =>
                  updateVariation(i, { variationPrice: e.target.value })
                }
              />
              <select
                className={`${inputClass} w-36`}
                value={v.selectionType}
                onChange={(e) =>
                  updateVariation(i, {
                    selectionType: e.target.value as Variation["selectionType"],
                  })
                }
              >
                {SELECTION_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeVariation(i)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-black hover:bg-gray-800 py-3 px-6 rounded-lg text-white font-bold transition-colors disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-zinc-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
