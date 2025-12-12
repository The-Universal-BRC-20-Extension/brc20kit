"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, FileText } from "lucide-react"
import { MarkdownRenderer } from "@/components/docs/markdown-renderer"
import Link from "next/link"

interface DocContent {
  content: string
  fileName: string
}

const DOC_TITLES: Record<string, string> = {
  GETTING_STARTED_10_MINUTES: "Getting Started in 10 Minutes",
  QUICK_START: "Quick Start Guide",
  CONFIGURATION_GUIDE: "Configuration Guide",
  CONFIGURATION: "Configuration",
  FAQ: "Frequently Asked Questions",
  "wallet-integration-guide": "Wallet Integration Guide",
  "wallet-compatibility": "Wallet Compatibility",
  PSBT_BUILDER: "PSBT Builder Guide",
}

export default function DocPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [doc, setDoc] = useState<DocContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/docs/${slug}`)
        if (!response.ok) {
          throw new Error("Documentation not found")
        }
        const data = await response.json()
        setDoc(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documentation")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchDoc()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="container py-8 max-w-4xl">
        <GlassCard className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Documentation Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "The requested documentation could not be found."}</p>
          <Link href="/docs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documentation
            </Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  const title = DOC_TITLES[doc.fileName] || doc.fileName.replace(/_/g, " ").replace(/-/g, " ")

  return (
    <div className="container py-8 max-w-4xl px-4 sm:px-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="hover-lift">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground">
          <div className="absolute inset-0 bg-grid-white/10" aria-hidden="true" />
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{title}</h1>
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8">
          <MarkdownRenderer content={doc.content} />
        </GlassCard>
      </div>
    </div>
  )
}
