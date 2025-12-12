"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLaserEyesWallet, WALLET_INFO, type LaserEyesWalletType } from "@/lib/lasereyes-wallet-provider"
import { CheckCircle2, Download, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { WalletLogo } from "./wallet-logo"

interface LaserEyesConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LaserEyesConnectModal({ open, onOpenChange }: LaserEyesConnectModalProps) {
  const { connect, isConnecting, error, installedWallets, availableWallets } = useLaserEyesWallet()
  const [connectingWallet, setConnectingWallet] = useState<LaserEyesWalletType | null>(null)

  const handleConnect = async (walletType: LaserEyesWalletType) => {
    setConnectingWallet(walletType)
    try {
      await connect(walletType)
      onOpenChange(false)
    } catch (err) {
      console.error("[brc20kit] Connection failed:", err)
    } finally {
      setConnectingWallet(null)
    }
  }

  const notInstalledWallets = availableWallets.filter((wallet) => !installedWallets.includes(wallet))

  // Sort installed wallets: recommended first
  const sortedInstalledWallets = [...installedWallets].sort((a, b) => {
    if (WALLET_INFO[a].recommended && !WALLET_INFO[b].recommended) return -1
    if (!WALLET_INFO[a].recommended && WALLET_INFO[b].recommended) return 1
    return 0
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Connect Bitcoin Wallet</DialogTitle>
          <DialogDescription>
            {installedWallets.length > 0
              ? `Choose from ${installedWallets.length} installed wallet${installedWallets.length !== 1 ? "s" : ""} or browse ${notInstalledWallets.length} more options below`
              : "Browse compatible Bitcoin wallets and install your preferred option to get started"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* No wallets installed alert */}
          {installedWallets.length === 0 && (
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">No Bitcoin Wallets Detected</div>
                <p className="text-sm mb-3">
                  To use BRC-20 Kit, you need a Bitcoin wallet extension. We recommend <strong>Unisat</strong> for
                  the best experience.
                </p>
                <p className="text-xs text-muted-foreground">
                  After installing, refresh this page to connect your wallet.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Installed wallets section */}
          {installedWallets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Installed Wallets</h3>
                <Badge variant="secondary" className="text-xs">
                  {installedWallets.length} Ready
                </Badge>
              </div>

              <div className="grid gap-3">
                {sortedInstalledWallets.map((walletType) => {
                  const info = WALLET_INFO[walletType]
                  const isConnecting = connectingWallet === walletType

                  return (
                    <Button
                      key={walletType}
                      variant="outline"
                      className="h-auto p-4 justify-start hover:bg-accent transition-colors bg-transparent"
                      onClick={() => handleConnect(walletType)}
                      disabled={isConnecting}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <WalletLogo icon={info.icon} name={info.name} size={40} />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base">{info.name}</span>
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Installed
                            </Badge>
                            {info.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
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
                        {isConnecting && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <RefreshCw className="h-4 w-4 animate-spin" />
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

          {/* Not installed wallets section */}
          {notInstalledWallets.length > 0 && (
            <>
              {installedWallets.length > 0 && <Separator />}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {installedWallets.length > 0 ? "More Wallets" : "Available Bitcoin Wallets"}
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
                        <div className="flex items-start gap-3">
                          <WalletLogo icon={info.icon} name={info.name} size={40} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-base">{info.name}</span>
                              <Badge variant="outline" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                Not Installed
                              </Badge>
                              {info.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
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
            </>
          )}

          {/* Help section */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <p className="text-sm">
                All wallets support Bitcoin mainnet and testnet. For the best experience with chained PSBTs and BRC-20
                tokens, we recommend <strong>Unisat</strong>.
              </p>
            </AlertDescription>
          </Alert>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Connection Failed</div>
                <p className="text-sm">{error}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
