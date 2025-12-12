"use client"

import { useState, useMemo } from "react"
import { TableOfContents } from "@/components/docs/table-of-contents"
import { CollapsibleSection } from "@/components/docs/collapsible-section"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  Search,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Settings,
  Wallet,
  Zap,
  DollarSign,
  AlertTriangle,
  Code,
  Rocket,
  Shield,
  MessageCircle,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { faqCategories, faqItems, type FAQItem, getFAQsByCategory, searchFAQs } from "./faq-data"

interface FAQAccordionItemProps {
  item: FAQItem
  index: number
}

function FAQAccordionItem({ item, index }: FAQAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden bg-card hover:bg-accent/5 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-accent/5 transition-colors"
      >
        <span className="font-medium text-sm md:text-base flex-1">{item.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3 animate-in slide-in-from-top-2 duration-200">
          {typeof item.answer === "string" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line leading-relaxed">{item.answer}</p>
            </div>
          ) : (
            item.answer
          )}
        </div>
      )}
    </div>
  )
}

function CategoryIcon({ categoryId }: { categoryId: string }) {
  const iconMap: Record<string, any> = {
    "getting-started": Rocket,
    configuration: Settings,
    "wallet-support": Wallet,
    minting: Zap,
    fees: DollarSign,
    troubleshooting: AlertTriangle,
    technical: Code,
    deployment: Rocket,
    security: Shield,
    support: MessageCircle,
  }

  const Icon = iconMap[categoryId] || HelpCircle
  return <Icon className="h-5 w-5" />
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["getting-started", "configuration"]))

  const filteredItems = useMemo(() => {
    if (searchQuery.trim()) {
      return searchFAQs(searchQuery)
    }
    if (selectedCategory) {
      return getFAQsByCategory(selectedCategory)
    }
    return faqItems
  }, [searchQuery, selectedCategory])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const tocItems = faqCategories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    level: 2 as const,
  }))

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
    setSearchQuery("") // Clear search when selecting category
    // Expand the category
    if (!expandedCategories.has(categoryId)) {
      setExpandedCategories(new Set([...expandedCategories, categoryId]))
    }
    // Scroll to category
    setTimeout(() => {
      const element = document.getElementById(categoryId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

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
            <section className="mb-8 md:mb-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border bg-muted/50 text-xs font-medium">
                  <HelpCircle className="h-3 w-3" />
                  <span>FAQ</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Find answers to common questions about BRC-20 Kit, configuration, wallet support, minting, and more.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mt-6 md:mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedCategory(null) // Clear category filter when searching
                    }}
                    className="pl-9 h-12 text-base"
                  />
                </div>
                {searchQuery && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Found {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-12">
              <div className="p-3 md:p-4 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold">{faqItems.length}</div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
              </div>
              <div className="p-3 md:p-4 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold">{faqCategories.length}</div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
              <div className="p-3 md:p-4 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold">6+</div>
                <div className="text-xs text-muted-foreground">Supported Wallets</div>
              </div>
              <div className="p-3 md:p-4 rounded-lg border bg-muted/30">
                <div className="text-2xl font-bold">10min</div>
                <div className="text-xs text-muted-foreground">Setup Time</div>
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <section className="mb-8 md:mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">Search Results</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory(null)
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => <FAQAccordionItem key={index} item={item} index={index} />)
                  ) : (
                    <div className="p-8 text-center border rounded-lg bg-muted/30">
                      <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Categories */}
            {!searchQuery && (
              <div className="space-y-6 md:space-y-8">
                {faqCategories.map((category) => {
                  const categoryItems = getFAQsByCategory(category.id)
                  const isExpanded = expandedCategories.has(category.id)
                  const isSelected = selectedCategory === category.id

                  return (
                    <section key={category.id} id={category.id} className="scroll-mt-8">
                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <CategoryIcon categoryId={category.id} />
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold">{category.title}</h2>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{categoryItems.length}</Badge>
                      </div>

                      <div className="space-y-2">
                        {categoryItems.map((item, index) => (
                          <FAQAccordionItem key={index} item={item} index={index} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

            {/* Help Section */}
            {!searchQuery && (
              <section className="mt-12 md:mt-16 border rounded-lg p-6 md:p-8 bg-muted/30">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-sm text-muted-foreground">
                      Check out our documentation or reach out for support.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" asChild>
                      <a href="/docs" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Documentation
                      </a>
                    </Button>
                    <Button asChild>
                      <a
                        href="https://github.com/The-Universal-BRC-20-Extension/brc20kit/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Get Help
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* Right Sidebar - Quick Links */}
          <aside className="hidden xl:block">
            <div className="sticky top-8 space-y-4">
              <div className="border rounded-lg p-3 bg-card">
                <h3 className="text-xs font-semibold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a
                    href="/docs"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Documentation</span>
                  </a>
                  <a
                    href="/mint"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Mint Tokens</span>
                  </a>
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

              <div className="border rounded-lg p-3 bg-card">
                <h3 className="text-xs font-semibold mb-3">Top Categories</h3>
                <div className="space-y-2">
                  {faqCategories.slice(0, 5).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      <span>{cat.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {getFAQsByCategory(cat.id).length}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
