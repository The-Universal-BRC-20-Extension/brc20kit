"use client"

import { useState } from "react"
import Image from "next/image"

interface WalletLogoProps {
  icon: string
  name: string
  size?: number
  className?: string
}

/**
 * Wallet Logo Component
 * 
 * Displays wallet logo with fallback to first letter if image fails to load.
 * Supports both URL-based icons (from LaserEyes) and emoji fallbacks.
 */
export function WalletLogo({ icon, name, size = 40, className = "" }: WalletLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // If icon is a URL, try to load it as an image
  if (icon.startsWith("http") && !imageError) {
    return (
      <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
        <Image
          src={icon}
          alt={`${name} logo`}
          width={size}
          height={size}
          className="rounded-lg object-contain"
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? "block" : "none" }}
        />
        {!imageLoaded && !imageError && (
          <div
            className="w-full h-full rounded-lg bg-muted animate-pulse flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <span className="text-xs text-muted-foreground">{name[0]}</span>
          </div>
        )}
        {imageError && (
          <div
            className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-lg font-semibold"
            style={{ width: size, height: size }}
          >
            {name[0].toUpperCase()}
          </div>
        )}
      </div>
    )
  }

  // Fallback: emoji or first letter
  if (icon.length <= 2) {
    // Emoji
    return (
      <span className={`text-3xl flex-shrink-0 ${className}`} style={{ fontSize: size * 0.75 }}>
        {icon}
      </span>
    )
  }

  // Fallback: first letter
  return (
    <div
      className={`rounded-lg bg-muted flex items-center justify-center text-lg font-semibold flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {name[0].toUpperCase()}
    </div>
  )
}
