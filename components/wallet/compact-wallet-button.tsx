"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLaserEyes } from "@/lib/lasereyes-wallet-provider"
import { Wallet, ChevronDown } from "lucide-react"
import { LaserEyesConnectModal } from "./lasereyes-connect-modal"

export function CompactWalletButton() {
  const { connected, address, disconnect } = useLaserEyes()
  const [open, setOpen] = useState(false)

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="px-3 py-1.5 text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Badge>
        <Button variant="outline" size="sm" onClick={disconnect} className="flex items-center gap-1 bg-transparent">
          <Wallet className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default" size="sm">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
      <LaserEyesConnectModal open={open} onOpenChange={setOpen} />
    </>
  )
}
