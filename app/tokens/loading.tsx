import { TableSkeleton } from "@/components/loading/page-loader"

export default function Loading() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      <TableSkeleton rows={8} cols={5} />
    </div>
  )
}
