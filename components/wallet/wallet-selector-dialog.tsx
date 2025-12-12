"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/wallet-provider"
import type { WalletType } from "@/lib/wallets"
import { AlertCircle, CheckCircle2, ExternalLink, Download } from "lucide-react"

interface WalletSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WALLET_INFO: Record<
  WalletType,
  {
    name: string
    description: string
    downloadUrl: string
    features: string[]
  }
> = {
  unisat: {
    name: "Unisat",
    description: "Popular Bitcoin wallet with full BRC-20 support",
    downloadUrl: "https://unisat.io",
    features: ["BRC-20", "Ordinals", "Taproot"],
  },
  xverse: {
    name: "Xverse",
    description: "Bitcoin wallet with Stacks integration",
    downloadUrl: "https://xverse.app",
    features: ["BRC-20", "Ordinals", "Stacks"],
  },
  okx: {
    name: "OKX Wallet",
    description: "Multi-chain wallet from OKX exchange",
    downloadUrl: "https://okx.com/web3",
    features: ["BRC-20", "Multi-chain", "Trading"],
  },
  phantom: {
    name: "Phantom",
    description: "Multi-chain wallet with Bitcoin support",
    downloadUrl: "https://phantom.app",
    features: ["Bitcoin", "Solana", "Ethereum"],
  },
  magiceden: {
    name: "Magic Eden",
    description: "NFT marketplace wallet",
    downloadUrl: "https://magiceden.io/wallet",
    features: ["Ordinals", "NFTs", "BRC-20"],
  },
  leather: {
    name: "Leather",
    description: "Bitcoin and Stacks wallet",
    downloadUrl: "https://leather.io",
    features: ["Bitcoin", "Stacks", "Open Source"],
  },
}

const ALL_WALLET_TYPES: WalletType[] = ["unisat", "xverse", "okx", "phantom", "magiceden", "leather"]

export function WalletSelectorDialog({ open, onOpenChange }: WalletSelectorDialogProps) {
  const { connect, isConnecting, error, availableWallets } = useWallet()
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)

  const handleConnect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    try {
      await connect(walletType)
      onOpenChange(false)
    } catch (err) {
      // Error is handled in wallet provider
      setSelectedWallet(null)
    }
  }

  const installedWallets = ALL_WALLET_TYPES.filter((type) => availableWallets.includes(type))
  const notInstalledWallets = ALL_WALLET_TYPES.filter((type) => !availableWallets.includes(type))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            {installedWallets.length > 0
              ? `Choose from ${installedWallets.length} installed wallet${installedWallets.length !== 1 ? "s" : ""} or browse ${notInstalledWallets.length} more options below`
              : `Browse ${notInstalledWallets.length} compatible Bitcoin wallets and install your preferred option`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {installedWallets.length === 0 && (
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">No Bitcoin Wallets Detected</div>
                <p className="text-sm mb-3">
                  To use BRC-20 Kit, you'll need a Bitcoin wallet. Choose from our supported wallets below and
                  install one to get started. We recommend <strong>Unisat</strong> or <strong>Xverse</strong> for the
                  best experience.
                </p>
                <p className="text-xs text-muted-foreground">
                  After installing, refresh this page to connect your wallet.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {installedWallets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Ready to Connect</h3>
                <Badge variant="secondary" className="text-xs">
                  {installedWallets.length} Installed
                </Badge>
              </div>
              <div className="grid gap-3">
                {installedWallets.map((walletType) => {
                  const info = WALLET_INFO[walletType]
                  const isConnected = selectedWallet === walletType && isConnecting

                  return (
                    <Button
                      key={walletType}
                      variant="outline"
                      className="h-auto p-4 justify-start hover:bg-accent transition-colors bg-transparent"
                      onClick={() => handleConnect(walletType)}
                      disabled={isConnected}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base">{info.name}</span>
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Installed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {info.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {isConnected && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Connecting...
                          </div>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {notInstalledWallets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {installedWallets.length > 0 ? "Install More Wallets" : "Available Bitcoin Wallets"}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {notInstalledWallets.length} Available
                </Badge>
              </div>
              <div className="grid gap-3">
                {notInstalledWallets.map((walletType) => {
                  const info = WALLET_INFO[walletType]

                  return (
                    <div
                      key={walletType}
                      className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base">{info.name}</span>
                            <Badge variant="outline" className="text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              Not Installed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {info.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="default" size="sm" asChild className="w-full sm:w-auto">
                            <a href={info.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Install {info.name}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {notInstalledWallets.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Need a Wallet?</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Quick access to download popular Bitcoin wallets compatible with BRC-20 Kit
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {notInstalledWallets.slice(0, 3).map((walletType) => {
                    const info = WALLET_INFO[walletType]
                    return (
                      <Button
                        key={walletType}
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <a href={info.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" />
                          {info.name}
                        </a>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Compatibility Note */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              All wallets support Bitcoin mainnet and BRC-20 tokens. For chained mints (1-25), we recommend Unisat or
              Xverse for the best experience.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Connection Failed</div>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
