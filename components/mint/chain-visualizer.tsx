"use client"

import { GlassCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Circle, AlertCircle, Loader2 } from "lucide-react"
import type { ChainedPSBT } from "@/lib/brc20-mint"
import { cn } from "@/lib/utils"

interface ChainVisualizerProps {
  psbts: ChainedPSBT[]
  currentIndex?: number
  signedIndices?: number[]
  failedIndices?: number[]
}

export function ChainVisualizer({
  psbts,
  currentIndex = -1,
  signedIndices = [],
  failedIndices = [],
}: ChainVisualizerProps) {
  const getNodeStatus = (index: number) => {
    if (failedIndices.includes(index)) return "failed"
    if (signedIndices.includes(index)) return "signed"
    if (index === currentIndex) return "current"
    return "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "current":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {psbts.map((psbt, index) => {
          const status = getNodeStatus(index)

          return (
            <div key={index} className="flex items-center gap-2 flex-shrink-0">
              <GlassCard
                className={cn(
                  "w-32 transition-all duration-300 hover-lift",
                  status === "signed" && "border-green-500 bg-green-50 dark:bg-green-950",
                  status === "current" && "border-primary bg-primary/10 ring-4 ring-primary/20 scale-105",
                  status === "failed" && "border-red-500 bg-red-50 dark:bg-red-950",
                )}
              >
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={status === "signed" ? "default" : "outline"} className="text-xs">
                      #{index + 1}
                    </Badge>
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-xs text-muted-foreground">Amount: {psbt.mintAmount}</div>
                  <div className="text-xs text-muted-foreground">Fee: {psbt.fee} sats</div>
                </div>
              </GlassCard>
              {index < psbts.length - 1 && (
                <ArrowRight
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    signedIndices.includes(index) ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
