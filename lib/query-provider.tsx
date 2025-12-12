"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

export function QueryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            refetchInterval: 30 * 1000, // Refetch every 30 seconds
            retry: 2,
            onError: (error) => {
              console.error("[brc20kit] Query error:", error)
              toast({
                title: "Data Fetch Error",
                description: error instanceof Error ? error.message : "Failed to fetch data",
                variant: "destructive",
              })
            },
          },
          mutations: {
            onError: (error) => {
              console.error("[brc20kit] Mutation error:", error)
              toast({
                title: "Operation Failed",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
              })
            },
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
