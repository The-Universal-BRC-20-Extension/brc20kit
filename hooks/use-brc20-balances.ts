"use client"

import { useQuery } from "@tanstack/react-query"
import { simplicityClient } from "@/lib/simplicity-client"
import { useWallet } from "@/lib/wallet-provider"

export function useBRC20Balances() {
  const { address, connected } = useWallet()

  return useQuery({
    queryKey: ["brc20-balances", address],
    queryFn: async () => {
      if (!address) throw new Error("No wallet address")
      return simplicityClient.getAddressBalances(address)
    },
    enabled: connected && !!address,
  })
}
