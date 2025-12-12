"use client"
import { TableOfContents } from "@/components/docs/table-of-contents"
import {
  Rocket,
  Settings,
  HelpCircle,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Shield,
  Clock,
  BookOpen,
  Terminal,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SETUP_STEPS = [
  {
    number: "01",
    title: "Get API Token",
    time: "2 min",
    icon: Terminal,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Required for fetching wallet balances and transaction data.
        </p>
        <ol className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-muted-foreground">1.</span>
            <span>
              Visit{" "}
              <a
                href="https://open-api.unisat.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                open-api.unisat.io
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-muted-foreground">2.</span>
            <span>Sign up with email or GitHub</span>
          </li>
          <li className="flex gap-2">
            <span className="text-muted-foreground">3.</span>
            <span>Generate and save your API key</span>
          </li>
        </ol>
      </div>
    ),
  },
  {
    number: "02",
    title: "Deploy Project",
    time: "3 min",
    icon: Zap,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">Choose your preferred deployment method.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-lg border bg-muted/30">
            <h4 className="text-sm font-medium mb-2">One-Click Deploy</h4>
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/The-Universal-BRC-20-Extension/brc20kit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                Deploy to Vercel
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </a>
          </div>
          <div className="p-3 rounded-lg border bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Manual Fork</h4>
            <ol className="text-xs text-muted-foreground space-y-0.5">
              <li>1. Fork on GitHub</li>
              <li>2. Import to Vercel</li>
              <li>3. Deploy</li>
            </ol>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Configure",
    time: "3 min",
    icon: Settings,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Add environment variables in Vercel Dashboard → Settings → Environment Variables
        </p>
        <div className="space-y-2">
          <EnvVariable name="UNISAT_API_TOKEN" value="your_token_here" required />
          <EnvVariable name="NEXT_PUBLIC_NETWORK" value="mainnet" required />
          <EnvVariable name="NEXT_PUBLIC_DEFAULT_TICKER" value="ANY" required />
          <EnvVariable name="NEXT_PUBLIC_DEFAULT_AMOUNT" value="1" required />
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
          <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground">Remember to redeploy after adding variables</span>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "Test & Launch",
    time: "2 min",
    icon: Shield,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">Verify everything works before going live.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>Connect wallet (Unisat, Xverse, or OKX)</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>Test mint transaction</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>Verify on mempool.space</span>
          </li>
        </ul>
      </div>
    ),
  },
]

function EnvVariable({ name, value, required }: { name: string; value: string; required?: boolean }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(name)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 border">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <code className="text-xs font-mono truncate">{name}</code>
        {required && <span className="text-[10px] font-medium text-muted-foreground">REQUIRED</span>}
      </div>
      <button
        onClick={copyToClipboard}
        className="p-1 hover:bg-accent rounded transition-colors"
        title="Copy variable name"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
      </button>
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: "Why do I need a Unisat API token?",
    a: "The app uses Unisat's API to fetch wallet UTXOs and balances. Without this token, minting won't work.",
  },
  {
    q: "Can users change the token ticker or amount?",
    a: "No. These values are set via environment variables and appear as read-only in the UI.",
  },
  {
    q: "Which wallet address does the app use?",
    a: "The app checks both payment (bc1q...) and ordinals (bc1p...) addresses and selects the one with the highest balance.",
  },
  {
    q: "How do platform fees work?",
    a: "Fees are optional and charged only on the first mint of each chain. Subsequent transactions are commission-free.",
  },
  {
    q: "What if I get 'No UTXOs available' error?",
    a: "Add BTC to your wallet and wait for confirmations (10-60 minutes).",
  },
  {
    q: "Can I use this on testnet?",
    a: "Yes. Set NEXT_PUBLIC_NETWORK=testnet and use a testnet wallet with testnet Bitcoin.",
  },
]

const WALLETS = [
  { name: "Unisat", status: "Supported", url: "https://unisat.io" },
  { name: "Xverse", status: "Supported", url: "https://xverse.app" },
  { name: "OKX Wallet", status: "Supported", url: "https://okx.com/web3" },
]

function ConfigItem({ name, description, example }: { name: string; description: string; example: string }) {
  return (
    <div className="flex flex-col gap-1 p-2 rounded border bg-muted/30">
      <code className="text-xs font-mono">{name}</code>
      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">
        Example: <code className="font-mono">{example}</code>
      </p>
    </div>
  )
}

export default function DocsPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const tocItems = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "setup", title: "Setup Guide", level: 2 },
    { id: "configuration", title: "Configuration", level: 2 },
    { id: "wallets", title: "Wallet Support", level: 2 },
    { id: "faq", title: "FAQ", level: 2 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr_200px] gap-8 lg:gap-12">
          {/* Left Sidebar - TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <TableOfContents items={tocItems} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            {/* Hero */}
            <section id="overview" className="scroll-mt-8 mb-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border bg-muted/50 text-xs font-medium">
                  <BookOpen className="h-3 w-3" />
                  <span>Documentation</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">BRC-20 Minting SDK</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Deploy your own Bitcoin BRC-20 token minting platform in 10 minutes. Just fork, configure, and deploy.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-2xl font-bold">10min</div>
                  <div className="text-xs text-muted-foreground">Setup time</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-2xl font-bold">Free</div>
                  <div className="text-xs text-muted-foreground">Hosting & API</div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-muted-foreground">Wallets</div>
                </div>
              </div>
            </section>

            {/* Setup Steps */}
            <section id="setup" className="scroll-mt-8 mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Rocket className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Setup Guide</h2>
              </div>

              <div className="space-y-4">
                {SETUP_STEPS.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
                          {step.number}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold">{step.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {step.time}
                            </div>
                          </div>
                          {step.content}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Configuration */}
            <section id="configuration" className="scroll-mt-8 mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-medium mb-3">Required Variables</h3>
                  <div className="space-y-2">
                    <ConfigItem
                      name="UNISAT_API_TOKEN"
                      description="API token from Unisat Open API"
                      example="abc123..."
                    />
                    <ConfigItem
                      name="NEXT_PUBLIC_NETWORK"
                      description="Bitcoin network to use"
                      example="mainnet or testnet"
                    />
                    <ConfigItem
                      name="NEXT_PUBLIC_DEFAULT_TICKER"
                      description="Token symbol users will mint"
                      example="ANY"
                    />
                    <ConfigItem
                      name="NEXT_PUBLIC_DEFAULT_AMOUNT"
                      description="Amount per mint transaction"
                      example="1"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-medium mb-3">Optional Variables</h3>
                  <div className="space-y-2">
                    <ConfigItem
                      name="COMMISSION_WALLET_ADDRESS"
                      description="Your wallet for platform fees"
                      example="bc1q..."
                    />
                    <ConfigItem
                      name="COMMISSION_AMOUNT_BTC"
                      description="Fee amount in BTC (first mint only)"
                      example="0.00001"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Wallet Support */}
            <section id="wallets" className="scroll-mt-8 mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Wallet className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Wallet Support</h2>
              </div>

              <div className="border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Wallet</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {WALLETS.map((wallet, i) => (
                      <tr key={i} className="hover:bg-accent/5">
                        <td className="p-3 font-medium">{wallet.name}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            {wallet.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={wallet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs hover:underline"
                          >
                            Visit
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-8 mb-12">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden bg-card">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-accent/5 transition-colors"
                    >
                      <span className="font-medium text-sm">{item.q}</span>
                      <CheckCircle2
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-transform",
                          expandedFaq === i ? "rotate-90" : "",
                        )}
                      />
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3">{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="border rounded-lg p-6 bg-muted/30 text-center">
              <h3 className="text-xl font-bold mb-2">Ready to Deploy?</h3>
              <p className="text-sm text-muted-foreground mb-4">Get your BRC-20 minting portal live in minutes</p>
              <Button asChild>
                <a
                  href="https://vercel.com/new/clone?repository-url=https://github.com/The-Universal-BRC-20-Extension/brc20kit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Deploy Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </main>

          {/* Right Sidebar - Quick Links */}
          <aside className="hidden xl:block">
            <div className="sticky top-8 space-y-4">
              <div className="border rounded-lg p-3 bg-card">
                <h3 className="text-xs font-semibold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a
                    href="https://open-api.unisat.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Unisat API</span>
                  </a>
                  <a
                    href="https://github.com/The-Universal-BRC-20-Extension/brc20kit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>GitHub Repo</span>
                  </a>
                  <a
                    href="https://mempool.space"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Mempool</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
