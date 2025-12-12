"use client"

import { GlassCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

interface TokenPreviewProps {
  ticker: string
  amount: string
  numMints: number
  feeRate: number
}

export function TokenPreview({ ticker, amount, numMints, feeRate }: TokenPreviewProps) {
  const totalAmount = amount && numMints ? Number(amount) * numMints : 0

  return (
    <GlassCard className="p-6 hover-lift">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mint Preview</h3>
          <div className="p-2 rounded-lg bg-primary/10">
            <Coins className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <span className="text-sm text-muted-foreground">Token</span>
            <Badge variant="secondary" className="text-lg font-bold">
              {ticker || "----"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <span className="text-sm text-muted-foreground">Per Mint</span>
            <span className="font-semibold">{amount || "0"}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <span className="text-sm text-muted-foreground">Number of Mints</span>
            <span className="font-semibold">{numMints}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium">Total Amount</span>
            <span className="text-xl font-bold text-primary">{totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <span className="text-sm text-muted-foreground">Fee Rate</span>
            <span className="font-semibold">{feeRate} sat/vB</span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
