"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { tokenConfig } from "@/lib/config"

export function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      className="relative flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-dot-grid opacity-[0.15]" aria-hidden="true" />

      <div
        className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background/80"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
        aria-hidden="true"
      />

      <div
        className="container relative z-10 px-4 sm:px-6 py-8 sm:py-10 md:py-12 lg:py-14"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      >
        <div className="mx-auto max-w-4xl text-center space-y-4 sm:space-y-5 md:space-y-6 fade-in">
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-[1.05]"
          >
            <span className="text-foreground">The Universal</span>
            <br />
            <span className="bg-gradient-to-r from-foreground/90 via-accent to-foreground/90 bg-clip-text text-transparent">
              BRC-20 Developer Kit
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            The forkable SDK for minting, swapping, and managing your BRC-20 projects.
            <br className="hidden sm:block" />
            Client-side minting with chained PSBTs, 6+ wallet support, zero backend.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4 sm:px-0">
            <Button size="lg" className="hover-lift group min-w-full sm:min-w-[160px]" asChild>
              <Link href="/mint" aria-label="Start minting BRC-20 tokens">
                Start Minting
                <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="hover-lift glass min-w-full sm:min-w-[160px] bg-transparent" asChild>
              <Link href="/docs" aria-label="View documentation">
                Documentation
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ opacity: Math.max(0, 1 - scrollY * 0.01) }}
        aria-hidden="true"
      >
        <div className="w-5 h-8 rounded-full border border-border/50 flex items-start justify-center p-1.5 backdrop-blur-sm bg-background/10">
          <div className="w-1 h-2 rounded-full bg-accent/60 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
