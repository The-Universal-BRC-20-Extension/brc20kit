/**
 * UTXOProvider - Fetches UTXOs via Unisat API
 * Replaces Simplicity SDK integration
 * 
 * Uses internal /api/utxos endpoint which calls Unisat API
 */

import type { UTXO } from "@/lib/psbt/types"

interface UTXOResponse {
  success: boolean
  data: UTXO[]
  error?: string
}

export class UTXOProvider {
  /**
   * Fetch UTXOs for a given Bitcoin address
   * Uses the internal /api/utxos endpoint which calls Unisat API
   */
  static async getUTXOs(address: string): Promise<UTXO[]> {
    if (!address) {
      console.warn("[brc20kit] ⚠️ UTXOProvider: No address provided")
      return []
    }

    try {
      console.log("[brc20kit] 📦 Fetching UTXOs for:", address.substring(0, 8) + "...")

      const response = await fetch("/api/utxos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[brc20kit] ❌ UTXO API error:", response.status, errorData)
        throw new Error(`UTXO fetch failed: ${response.status}`)
      }

      const data: UTXOResponse = await response.json()

      if (!data.success || !Array.isArray(data.data)) {
        console.warn("[brc20kit] ⚠️ Invalid UTXO response format")
        return []
      }

      // UTXOs are already in correct format from API route
      const utxos = data.data

      console.log("[brc20kit] ✅ Fetched", utxos.length, "UTXOs")
      if (utxos.length > 0) {
        console.log(
          "[brc20kit] 💰 Total value:",
          utxos.reduce((sum, u) => sum + u.value, 0),
          "sats",
        )
      }

      return utxos
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("[brc20kit] ❌ UTXOProvider.getUTXOs failed:", errorMessage)
      throw error
    }
  }
}
