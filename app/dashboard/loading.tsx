export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="space-y-4">
          <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
