"use client"

import { useEffect, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"

const LaserEyesProviderDynamic = dynamic(
  () =>
    import("@omnisat/lasereyes-react").then((mod) => {
      console.log("[brc20kit] LaserEyesProvider loaded successfully")
      return { default: mod.LaserEyesProvider }
    }),
  {
    ssr: false,
    loading: () => {
      console.log("[brc20kit] Loading LaserEyesProvider...")
      return null
    },
  },
)

export function LaserEyesProviderClient({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    console.log("[brc20kit] LaserEyesProviderClient mounting...")
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <LaserEyesProviderDynamic
      config={{
        network: "mainnet",
      }}
    >
      {children}
    </LaserEyesProviderDynamic>
  )
}
