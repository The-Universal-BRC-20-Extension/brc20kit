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
  const [imageError, setImageError] = useState<string | null>(null)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset error when theme changes (to retry loading the appropriate logo)
  useEffect(() => {
    setImageError(null)
  }, [resolvedTheme, theme])

  if (!mounted) {
    // Show default during SSR
    return <div className={className} style={{ width, height }} aria-label="Logo" />
  }

  // Check if custom logos are configured via env variables
  const hasCustomLogo = !!(tokenConfig.logoUrl || tokenConfig.logoDarkUrl)
  const isDark = resolvedTheme === "dark" || theme === "dark"

  // If custom logos are configured via environment variables, use them (unless error occurred)
  if (hasCustomLogo) {
    const logoSrc = isDark ? tokenConfig.logoDarkUrl || tokenConfig.logoUrl : tokenConfig.logoUrl

    if (logoSrc && imageError !== logoSrc) {
      return (
        <Image
          src={logoSrc}
          alt={`${tokenConfig.projectName} Logo`}
          width={width}
          height={height}
          className={className}
          priority
          onError={() => {
            console.warn(`[Logo] Failed to load logo from ${logoSrc}, falling back to default`)
            setImageError(logoSrc)
          }}
        />
      )
    }
  }

  // Default to the new logo.png (fallback if custom logo fails or not configured)
  return (
    <Image
      src="/logo.png"
      alt={`${tokenConfig.projectName} Logo`}
      width={width}
      height={height}
      className={className}
      priority
      onError={() => {
        console.error("[Logo] Failed to load default logo.png")
      }}
    />
  )
}

/**
 * Text logo component (project name)
 */
export function TextLogo({ className }: { className?: string }) {
  return <span className={className}>{tokenConfig.projectName}</span>
}
