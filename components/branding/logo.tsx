"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"
import { tokenConfig } from "@/lib/config"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

/**
 * Dynamic logo component that switches based on theme
 * Falls back to default logo if custom logo URLs are not configured
 */
export function Logo({ className, width = 40, height = 40 }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Show default during SSR
    return <div className={className} style={{ width, height }} aria-label="Logo" />
  }

  // Check if custom logos are configured via env variables
  const hasCustomLogo = !!(tokenConfig.logoUrl || tokenConfig.logoDarkUrl)
  const isDark = resolvedTheme === "dark" || theme === "dark"

  // If custom logos are configured via environment variables, use them
  if (hasCustomLogo) {
    const logoSrc = isDark ? tokenConfig.logoDarkUrl || tokenConfig.logoUrl : tokenConfig.logoUrl

    if (logoSrc) {
      return (
        <Image
          src={logoSrc || "/placeholder.svg"}
          alt={`${tokenConfig.projectName} Logo`}
          width={width}
          height={height}
          className={className}
          priority
        />
      )
    }
  }

  // Default to the new logo.png
  return (
    <Image
      src="/logo.png"
      alt={`${tokenConfig.projectName} Logo`}
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

/**
 * Text logo component (project name)
 */
export function TextLogo({ className }: { className?: string }) {
  return <span className={className}>{tokenConfig.projectName}</span>
}
