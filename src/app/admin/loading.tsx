export default function AdminProductsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-zinc-200" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b bg-zinc-50 px-4 py-3">
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t px-4 py-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="ml-auto h-3 w-16 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
