import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParallaxHero } from "@/components/hero/parallax-hero"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ParallaxHero />

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30" aria-labelledby="features-heading">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10 md:mb-12 fade-in">
            <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Powerful Minting, Universal Compatibility
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              The most advanced BRC-20 minting portal with support for all major Bitcoin wallets
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Platform features">
            <Card
              role="listitem"
              className="hover-lift fade-in backdrop-blur-sm bg-background/80"
              style={{ animationDelay: "0ms" }}
            >
              <CardHeader>
                <CardTitle>Chained PSBTs</CardTitle>
                <CardDescription>Mint 1-25 tokens in a single flow with linked transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Chained PSBT features">
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Sequential signing with progress tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Automatic fee calculation for entire chain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Error recovery and state management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              role="listitem"
              className="hover-lift fade-in backdrop-blur-sm bg-background/80"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader>
                <CardTitle>Universal Wallet Support</CardTitle>
                <CardDescription>Works with Unisat, Xverse, OKX, Phantom, Magic Eden, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Wallet support features">
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Automatic wallet detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Unified signing interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Wallet-specific optimizations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              role="listitem"
              className="hover-lift fade-in backdrop-blur-sm bg-background/80"
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader>
                <CardTitle>100% Client-Side</CardTitle>
                <CardDescription>All PSBT construction happens in your browser</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Client-side features">
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>No backend required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Maximum privacy and security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                    <span>Real-time PSBT preview</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-slate-50 relative overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <div className="absolute inset-0 bg-dot-grid opacity-10" aria-hidden="true" />
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center space-y-4 sm:space-y-6 fade-in">
            <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Ready to Start Minting?
            </h2>
            <p className="text-base sm:text-lg text-slate-200">Connect your Bitcoin wallet and mint BRC-20 tokens in seconds</p>
            <Button
              size="lg"
              variant="secondary"
              className="hover-lift bg-white text-slate-900 hover:bg-slate-100 w-full sm:w-auto"
              asChild
            >
              <Link href="/mint" aria-label="Get started with minting">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
