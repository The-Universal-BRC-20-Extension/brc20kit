import { CardSkeleton } from "@/components/loading/page-loader"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <div className="h-10 w-64 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse mx-auto" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-6">
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
