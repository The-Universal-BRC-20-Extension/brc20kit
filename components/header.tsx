"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Menu } from 'lucide-react'
import { useState } from "react"
import { LaserEyesWalletButton } from "@/components/wallet/lasereyes-wallet-button"
import { useLaserEyesWallet } from "@/lib/lasereyes-wallet-provider"
import { CommandPalette } from "@/components/search/command-palette"
import { Logo } from "@/components/branding/logo"

export function Header() {
  const { error } = useLaserEyesWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <Link href="/" className="flex items-center gap-2" aria-label="Home">
              <Logo width={28} height={28} className="flex-shrink-0 sm:w-8 sm:h-8" />
            </Link>

            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              <Link
                href="/mint"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
              >
                Mint
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
              >
                Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="hidden xs:block">
              <CommandPalette />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <LaserEyesWalletButton />
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden border-t border-border bg-background"
            aria-label="Mobile navigation"
          >
            <div className="container px-4 py-3 space-y-1">
              <Link
                href="/mint"
                className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mint
              </Link>
              <Link
                href="/docs"
                className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
            </div>
          </nav>
        )}
      </header>

      {error && (
        <div className="border-b border-border bg-destructive/10" role="alert" aria-live="polite">
          <div className="container py-2 sm:py-3 px-4 sm:px-6">
            <Alert variant="destructive" className="border-0 bg-transparent">
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </>
  )
}
