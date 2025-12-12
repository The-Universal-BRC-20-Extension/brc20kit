"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { simplicityClient } from "@/lib/simplicity-client"
import { TrendingUp, Coins, Activity, Lock } from "lucide-react"

export function EcosystemStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["ecosystem-stats"],
    queryFn: () => simplicityClient.getEcosystemStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: "Total Tokens",
      value: stats.totalTokens.toLocaleString(),
      description: "BRC-20 tokens deployed",
      icon: Coins,
      trend: "+12% from last week",
    },
    {
      title: "Total Mints",
      value: stats.totalMints.toLocaleString(),
      description: "Mint operations completed",
      icon: Activity,
      trend: `${stats.totalTransfers.toLocaleString()} transfers`,
    },
    {
      title: "Active Vaults",
      value: stats.activeVaults.toLocaleString(),
      description: "Taproot vaults created",
      icon: Lock,
      trend: `${stats.totalTVL} BTC locked`,
    },
    {
      title: "24h Volume",
      value: stats.last24hVolume,
      description: "Trading volume",
      icon: TrendingUp,
      trend: "Across all markets",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
