/**
 * Unisat API UTXO Provider
 * Fetches UTXOs from Unisat Open API
 * Reference: https://open-api.unisat.io/#/Addresses/getAvailableUtxoDataByAddress
 * 
 * This replaces Simplicity SDK as the UTXO provider.
 * Developers must provide their own UNISAT_API_TOKEN.
 */

import type { UTXO } from "@/lib/psbt/types"

interface UnisatUTXO {
  address: string
  codeType: number
  height: number
  idx: number
  inscriptions: Array<{
    inscriptionId: string
    inscriptionNumber: number
    isBRC20: boolean
    moved: boolean
    offset: number
  }>
  isOpInRBF: boolean
  satoshi: number
  scriptPk: string
  scriptType: string
  txid: string
  vout: number
}

interface UnisatResponse {
  code: number
  msg: string
  data: {
    cursor: number
    total: number
    totalConfirmed: number
    totalUnconfirmed: number
    totalUnconfirmedSpend: number
    utxo: UnisatUTXO[]
  }
}

export class UnisatUTXOProvider {
  private apiUrl: string
  private apiToken: string

  constructor(apiUrl?: string, apiToken?: string) {
    this.apiUrl = apiUrl || process.env.UNISAT_API_URL || "https://open-api.unisat.io"
    this.apiToken = apiToken || process.env.UNISAT_API_TOKEN || ""
    
    if (!this.apiToken) {
      throw new Error(
        "[brc20kit] ❌ UNISAT_API_TOKEN is required. Get your token from https://open-api.unisat.io"
      )
    }
  }

  /**
   * Fetch all available UTXOs for an address
   * Handles pagination automatically
   * 
   * Note: Unisat API automatically filters:
   * - UTXOs with inscriptions/runes/alkanes (excluded)
   * - UTXOs < 600 sats (excluded)
   */
  async getUTXOs(address: string): Promise<UTXO[]> {
    if (!address) {
      throw new Error("[brc20kit] ❌ Address is required")
    }

    console.log("[brc20kit] 📦 Fetching UTXOs from Unisat API for:", address.substring(0, 8) + "...")

    const allUtxos: UTXO[] = []
    let cursor = 0
    const pageSize = 100 // Max allowed by Unisat API
    let hasMore = true

    while (hasMore) {
      try {
        const response = await this.fetchPage(address, cursor, pageSize)
        
        if (response.code !== 0) {
          throw new Error(`[brc20kit] ❌ Unisat API error: ${response.msg} (code: ${response.code})`)
        }

        // Map Unisat UTXOs to our format
        const utxos = this.mapUnisatUTXOs(response.data.utxo, address)
        allUtxos.push(...utxos)

        // Check if more pages available
        // Unisat returns cursor that indicates next page start
        const nextCursor = response.data.cursor
        const totalUtxos = response.data.total
        
        // Continue if we got a full page and there are more UTXOs
        hasMore = response.data.utxo.length === pageSize && nextCursor < totalUtxos
        cursor = nextCursor

        console.log(
          `[brc20kit] 📄 Fetched page: ${utxos.length} UTXOs (cursor: ${cursor}/${totalUtxos})`
        )
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error("[brc20kit] ❌ Unisat API fetch error:", errorMessage)
        throw error
      }
    }

    console.log("[brc20kit] ✅ Fetched", allUtxos.length, "UTXOs from Unisat API")
    if (allUtxos.length > 0) {
      const totalValue = allUtxos.reduce((sum, u) => sum + u.value, 0)
      console.log("[brc20kit] 💰 Total value:", totalValue, "sats")
    }

    return allUtxos
  }

  /**
   * Fetch a single page of UTXOs from Unisat API
   */
  private async fetchPage(address: string, cursor: number, size: number): Promise<UnisatResponse> {
    const url = `${this.apiUrl}/v1/indexer/address/${address}/available-utxo-data?cursor=${cursor}&size=${size}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `[brc20kit] ❌ Unisat API HTTP error: ${response.status}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage += ` - ${errorJson.msg || errorText}`
      } catch {
        errorMessage += ` - ${errorText}`
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  }

  /**
   * Map Unisat UTXO format to our internal UTXO format
   * 
   * Field Mapping:
   * - satoshi → value
   * - scriptPk → scriptPubKey (REQUIRED)
   * - address → address (REQUIRED, with fallback)
   * 
   * Note: scriptPubKey is REQUIRED for PSBT construction
   */
  private mapUnisatUTXOs(unisatUtxos: UnisatUTXO[], fallbackAddress: string): UTXO[] {
    return unisatUtxos.map((utxo) => {
      // Validate required fields
      if (!utxo.scriptPk) {
        console.warn(
          `[brc20kit] ⚠️ UTXO ${utxo.txid}:${utxo.vout} missing scriptPk, skipping`
        )
        return null
      }

      return {
        txid: utxo.txid,
        vout: utxo.vout,
        value: utxo.satoshi,
        scriptPubKey: utxo.scriptPk, // Map: scriptPk → scriptPubKey (REQUIRED)
        address: utxo.address || fallbackAddress, // REQUIRED with fallback
        // Note: height can be used to calculate confirmations if needed
        // For now, we don't include it as it's optional in our UTXO type
      }
    }).filter((utxo): utxo is UTXO => utxo !== null) // Filter out null entries
  }
}
