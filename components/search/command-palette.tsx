"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { FileText, Home, Coins, BookOpen, Search, Zap, Wallet } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const searchResults: SearchResult[] = [
    // Navigation
    {
      id: "nav-home",
      title: "Home",
      description: "Go to homepage",
      category: "Navigation",
      icon: <Home className="h-4 w-4" />,
      action: () => router.push("/"),
    },
    {
      id: "nav-mint",
      title: "Mint Tokens",
      description: "Create new tokens",
      category: "Navigation",
      icon: <Coins className="h-4 w-4" />,
      action: () => router.push("/mint"),
    },
    {
      id: "nav-docs",
      title: "Documentation",
      description: "Read the docs",
      category: "Navigation",
      icon: <BookOpen className="h-4 w-4" />,
      action: () => router.push("/docs"),
    },
    // Quick Actions
    {
      id: "action-connect",
      title: "Connect Wallet",
      description: "Connect your Bitcoin wallet",
      category: "Quick Actions",
      icon: <Wallet className="h-4 w-4" />,
      action: () => {
        // Trigger wallet connection
        const connectButton = document.querySelector('[aria-label="Connect wallet"]') as HTMLButtonElement
        connectButton?.click()
      },
    },
    {
      id: "action-mint",
      title: "Quick Mint",
      description: "Start minting process",
      category: "Quick Actions",
      icon: <Zap className="h-4 w-4" />,
      action: () => router.push("/mint"),
    },
    // Documentation
    {
      id: "doc-psbt",
      title: "PSBT Guide",
      description: "Learn about Partially Signed Bitcoin Transactions",
      category: "Documentation",
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push("/docs/psbt-guide"),
    },
  ]

  const filteredResults = search
    ? searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(search.toLowerCase()) ||
          result.description.toLowerCase().includes(search.toLowerCase()),
      )
    : searchResults

  const groupedResults = filteredResults.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false)
    setSearch("")
    result.action()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors group"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedResults).map(([category, results], index) => (
            <div key={category}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={category}>
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {result.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">{result.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
