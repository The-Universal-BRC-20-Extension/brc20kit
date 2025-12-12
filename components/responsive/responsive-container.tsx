"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  mobile?: string
  tablet?: string
  desktop?: string
}

export function ResponsiveContainer({ children, className, mobile, tablet, desktop }: ResponsiveContainerProps) {
  return (
    <div
      className={cn("w-full", mobile && `${mobile}`, tablet && `md:${tablet}`, desktop && `lg:${desktop}`, className)}
    >
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 6,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid",
        `grid-cols-${cols.mobile}`,
        cols.tablet && `md:grid-cols-${cols.tablet}`,
        cols.desktop && `lg:grid-cols-${cols.desktop}`,
        `gap-${gap}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
