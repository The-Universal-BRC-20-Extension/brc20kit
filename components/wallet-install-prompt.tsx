"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WalletInstallPrompt() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Xverse Wallet Required</CardTitle>
        <CardDescription>
          To use BRC-20 Kit, you need to install the Xverse wallet browser extension
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Xverse is a Bitcoin wallet that supports Taproot addresses and BRC-20 tokens, essential for using this
            application.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild>
            <a href="https://www.xverse.app/download" target="_blank" rel="noopener noreferrer">
              Download Xverse Wallet
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://docs.xverse.app/" target="_blank" rel="noopener noreferrer">
              Learn More
            </a>
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            After installing, refresh this page and click "Connect Wallet" to get started.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
