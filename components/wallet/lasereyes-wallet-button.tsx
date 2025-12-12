"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLaserEyesWallet } from "@/lib/lasereyes-wallet-provider"
import { LaserEyesConnectModal } from "./lasereyes-connect-modal"
import { Wallet } from "lucide-react"

export function LaserEyesWalletButton() {
  const { connected, address, disconnect, isConnecting } = useLaserEyesWallet()
  const [modalOpen, setModalOpen] = useState(false)

  const truncateAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20" />
          <span className="font-mono text-sm">{truncateAddress(address)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button size="sm" onClick={() => setModalOpen(true)} disabled={isConnecting}>
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      <LaserEyesConnectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
