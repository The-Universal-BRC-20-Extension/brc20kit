import Link from "next/link"
import { Logo } from "@/components/branding/logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16 mb-12">
      <div className="container py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Logo width={32} height={32} className="flex-shrink-0" />
              <span className="font-semibold">BRC-20 Kit</span>
            </div>
            <p className="text-sm text-muted-foreground">The Universal BRC-20 Developer Kit</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/mint" className="hover:text-foreground transition-colors">
                  Mint BRC-20
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Network</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20 animate-pulse" />
              <span className="text-muted-foreground">Bitcoin Mainnet</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>The forkable SDK for minting, swapping, and managing your BRC-20 projects.</p>
        </div>
      </div>
    </footer>
  )
}
