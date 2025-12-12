import { CardSkeleton } from "@/components/loading/page-loader"

export default function Loading() {
  return (
    <div className="container py-8 md:py-12 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr_200px] gap-8 lg:gap-12">
        {/* Left Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <CardSkeleton />
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="h-12 w-96 bg-muted rounded animate-pulse" />
            <div className="h-6 w-full max-w-2xl bg-muted rounded animate-pulse" />
          </div>

          {/* Search Bar */}
          <div className="h-12 w-full bg-muted rounded animate-pulse" />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border bg-muted/30">
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg bg-card">
                <div className="h-6 w-full bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block">
          <div className="sticky top-8 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </aside>
      </div>
    </div>
  )
}
