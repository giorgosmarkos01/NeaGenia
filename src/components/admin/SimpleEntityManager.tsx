"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "./ToastProvider";

export type SimpleEntity = { id: number; name: string; productCount: number };

export default function SimpleEntityManager({
  label,
  apiBasePath,
  entities,
}: {
  label: string;
  apiBasePath: string; // e.g. "/api/admin/categories"
  entities: SimpleEntity[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SimpleEntity | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(apiBasePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || `Failed to create ${label.toLowerCase()}`, "error");
        return;
      }
      setName("");
      showToast(`${label} created`, "success");
      router.refresh();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiBasePath}/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || `Failed to delete ${label.toLowerCase()}`, "error");
        return;
      }
      setPendingDelete(null);
      showToast(`${label} deleted`, "success");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`New ${label.toLowerCase()} name`}
          className="w-full max-w-sm rounded-lg border border-black bg-white px-3 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-t transition hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-zinc-600">{e.productCount}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setPendingDelete(e)}
                    disabled={deletingId === e.id}
                    aria-label={`Delete ${e.name}`}
                    title="Delete"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {entities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  No {label.toLowerCase()}s yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deletingId && setPendingDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Delete {label.toLowerCase()}</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Delete <span className="font-medium text-black">{pendingDelete.name}</span>?
              This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={!!deletingId}
                className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
