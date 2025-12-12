"use client"

import { useEffect } from "react"
import { ErrorFallback } from "@/components/ui/error-fallback"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[brc20kit] Route error:", error)
  }, [error])

  return (
    <ErrorFallback
      error={error}
      resetError={reset}
      title="Page Error"
      description="This page encountered an error while loading"
    />
  )
}
