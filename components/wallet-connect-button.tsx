"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/lib/wallet-provider"
import { Wallet } from "lucide-react"
import type { WalletType } from "@/lib/wallets"

const walletInfo: Record<
  WalletType,
  {
    name: string
    icon: string
    description: string
  }
> = {
  unisat: {
    name: "Unisat",
    icon: "🦄",
    description: "Unisat Wallet Extension",
  },
  xverse: {
    name: "Xverse",
    icon: "✨",
    description: "Xverse Bitcoin Wallet",
  },
  okx: {
    name: "OKX",
    icon: "⭕",
    description: "OKX Web3 Wallet",
  },
  phantom: {
    name: "Phantom",
    icon: "👻",
    description: "Phantom Wallet",
  },
  magiceden: {
    name: "Magic Eden",
    icon: "🪄",
    description: "Magic Eden Wallet",
  },
  leather: {
    name: "Leather",
    icon: "🔷",
    description: "Leather Wallet (Hiro)",
  },
}

export function WalletConnectButton() {
  const { connect, isConnecting, availableWallets } = useWallet()
  const [open, setOpen] = useState(false)

  const handleConnect = async (walletType: WalletType) => {
    try {
      await connect(walletType)
      setOpen(false)
    } catch (error) {
      console.error("[brc20kit] Connection error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={isConnecting}>
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Bitcoin Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to BRC-20 Kit</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {availableWallets.length > 0 ? (
            availableWallets.map((walletType) => {
              const info = walletInfo[walletType]
              return (
                <Button
                  key={walletType}
                  variant="outline"
                  className="h-auto justify-start gap-4 p-4 bg-transparent"
                  onClick={() => handleConnect(walletType)}
                  disabled={isConnecting}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {info.icon}
                  </span>
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">{info.name}</span>
                    <span className="text-xs text-muted-foreground">{info.description}</span>
                  </div>
                </Button>
              )
            })
          ) : (
            <div className="rounded-lg border border-border bg-muted p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">No Bitcoin wallets detected</p>
              <p className="text-xs text-muted-foreground">
                Please install a Bitcoin wallet extension like Unisat or Xverse, then refresh this page.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
