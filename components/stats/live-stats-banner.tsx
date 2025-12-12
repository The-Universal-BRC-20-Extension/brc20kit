"use client"

import { useQuery } from "@tanstack/react-query"
import { simplicityClient } from "@/lib/simplicity-client"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function LiveStatsBanner() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["ecosystem-stats"],
    queryFn: () => simplicityClient.getEcosystemStats(),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-6 py-3 bg-muted/30">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex items-center justify-center gap-6 py-3 bg-muted/30 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Tokens:</span>
        <Badge variant="secondary">{stats.totalTokens.toLocaleString()}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Mints:</span>
        <Badge variant="secondary">{stats.totalMints.toLocaleString()}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">TVL:</span>
        <Badge variant="secondary">{stats.totalTVL} BTC</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">24h Volume:</span>
        <Badge variant="secondary">{stats.last24hVolume}</Badge>
      </div>
    </div>
  )
}
