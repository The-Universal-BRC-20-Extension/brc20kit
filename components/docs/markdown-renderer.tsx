"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [html, setHtml] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Enhanced markdown to HTML converter
    const convertMarkdown = (md: string): string => {
      let html = md

      const escapeHtml = (text: string): string => {
        const map: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }
        return text.replace(/[&<>"']/g, (m) => map[m])
      }

      // Code blocks (process first to avoid conflicts)
      html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const langClass = lang ? `language-${lang}` : ""
        return `<pre class='bg-muted p-4 rounded-lg overflow-x-auto my-4 border border-border'><code class='text-sm font-mono ${langClass}'>${escapeHtml(code.trim())}</code></pre>`
      })

      // Headers (with IDs for anchor links)
      html = html.replace(/^#### (.*$)/gim, "<h4 class='text-lg font-bold mt-6 mb-3'>$1</h4>")
      html = html.replace(/^### (.*$)/gim, "<h3 class='text-xl font-bold mt-8 mb-4'>$1</h3>")
      html = html.replace(/^## (.*$)/gim, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        return `<h2 class='text-2xl font-bold mt-10 mb-6' id='${id}'>${title}</h2>`
      })
      html = html.replace(/^# (.*$)/gim, "<h1 class='text-3xl font-bold mt-12 mb-8'>$1</h1>")

      // Horizontal rules
      html = html.replace(/^---$/gim, "<hr class='my-8 border-border' />")
      html = html.replace(/^\*\*\*$/gim, "<hr class='my-8 border-border' />")

      // Blockquotes
      html = html.replace(/^> (.*$)/gim, "<blockquote class='border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2'>$1</blockquote>")

      // Lists - process unordered lists
      const lines = html.split("\n")
      let inList = false
      let listType = ""
      let processedLines: string[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const ulMatch = line.match(/^[\-\*] (.*)$/)
        const olMatch = line.match(/^\d+\. (.*)$/)

        if (ulMatch) {
          if (!inList || listType !== "ul") {
            if (inList) processedLines.push(`</${listType}>`)
            processedLines.push("<ul class='space-y-2 my-4 list-disc list-inside'>")
            inList = true
            listType = "ul"
          }
          processedLines.push(`<li class='ml-4'>${ulMatch[1]}</li>`)
        } else if (olMatch) {
          if (!inList || listType !== "ol") {
            if (inList) processedLines.push(`</${listType}>`)
            processedLines.push("<ol class='space-y-2 my-4 list-decimal list-inside'>")
            inList = true
            listType = "ol"
          }
          processedLines.push(`<li class='ml-4'>${olMatch[1]}</li>`)
        } else {
          if (inList) {
            processedLines.push(`</${listType}>`)
            inList = false
            listType = ""
          }
          processedLines.push(line)
        }
      }
      if (inList) processedLines.push(`</${listType}>`)
      html = processedLines.join("\n")

      // Inline code (after code blocks to avoid conflicts)
      html = html.replace(/`([^`\n]+)`/gim, "<code class='bg-muted px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>")

      // Bold and italic
      html = html.replace(/\*\*\*(.*?)\*\*\*/gim, "<strong><em>$1</em></strong>")
      html = html.replace(/\*\*(.*?)\*\*/gim, "<strong class='font-semibold'>$1</strong>")
      html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>")
      html = html.replace(/__(.*?)__/gim, "<strong class='font-semibold'>$1</strong>")
      html = html.replace(/_(.*?)_/gim, "<em>$1</em>")

      // Links (with relative path handling)
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, text, url) => {
        const isExternal = url.startsWith("http") || url.startsWith("//")
        const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""
        return `<a href="${url}" class="text-primary hover:underline"${target}>${text}</a>`
      })

      // Paragraphs (process last, but preserve existing HTML)
      const paragraphs = html.split(/\n\n+/)
      html = paragraphs.map((para) => {
        const trimmed = para.trim()
        if (!trimmed) return ""
        if (trimmed.startsWith("<") || trimmed.startsWith("```")) {
          return trimmed
        }
        return `<p class='mb-4 leading-relaxed text-foreground'>${trimmed}</p>`
      }).filter(Boolean).join("\n\n")

      return html
    }

    setHtml(convertMarkdown(content))
    setLoading(false)
  }, [content])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div
      className={cn("prose prose-slate dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
