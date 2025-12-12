"use client"

import { useState } from "react"
import Image from "next/image"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function LazyImage({ src, alt, width, height, className, priority = false }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  })

  const shouldLoad = priority || isIntersecting

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-muted", className)}>
      {shouldLoad && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={cn("transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
        />
      )}
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
    </div>
  )
}
