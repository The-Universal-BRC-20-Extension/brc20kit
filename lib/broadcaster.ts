// Transaction broadcaster for submitting signed transactions to Bitcoin network

import { config } from "./config"

export interface BroadcastResult {
  txid: string
  status: "pending" | "confirmed" | "failed"
  confirmations: number
  error?: string
}

export interface TransactionStatus {
  txid: string
  status: "pending" | "confirmed" | "failed"
  confirmations: number
  blockHeight?: number
  timestamp?: number
}

export class Broadcaster {
  /**
   * Broadcast a signed transaction to the Bitcoin network
   */
  static async broadcast(signedTxHex: string): Promise<BroadcastResult> {
    try {
      console.log("[brc20kit] Broadcasting transaction to Bitcoin network...")

      // Try multiple broadcast methods in order of preference
      const result = await this.broadcastWithFallback(signedTxHex)

      console.log("[brc20kit] Transaction broadcast successful:", result)

      return result
    } catch (error: any) {
      console.error("[brc20kit] Broadcast failed:", error)
      throw new Error(error?.message || "Failed to broadcast transaction")
    }
  }

  /**
   * Broadcast with fallback to multiple endpoints
   */
  private static async broadcastWithFallback(signedTxHex: string): Promise<BroadcastResult> {
    const errors: string[] = []

    // Method 1: Try Bitcoin RPC if configured
    if (config.bitcoinRpcUrl) {
      try {
        return await this.broadcastViaRPC(signedTxHex)
      } catch (error: any) {
        errors.push(`RPC: ${error.message}`)
      }
    }

    // Method 2: Try Mempool.space API
    try {
      return await this.broadcastViaMempoolSpace(signedTxHex)
    } catch (error: any) {
      errors.push(`Mempool: ${error.message}`)
    }

    // Method 3: Try Blockstream API
    try {
      return await this.broadcastViaBlockstream(signedTxHex)
    } catch (error: any) {
      errors.push(`Blockstream: ${error.message}`)
    }

    // All methods failed
    throw new Error(`Broadcast failed: ${errors.join(", ")}`)
  }

  /**
   * Broadcast via Bitcoin Core RPC
   */
  private static async broadcastViaRPC(signedTxHex: string): Promise<BroadcastResult> {
    const response = await fetch(config.bitcoinRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "broadcast",
        method: "sendrawtransaction",
        params: [signedTxHex],
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return {
      txid: data.result,
      status: "pending",
      confirmations: 0,
    }
  }

  /**
   * Broadcast via Mempool.space API
   */
  private static async broadcastViaMempoolSpace(signedTxHex: string): Promise<BroadcastResult> {
    const baseUrl = config.network === "mainnet" ? "https://mempool.space/api" : "https://mempool.space/testnet/api"

    const response = await fetch(`${baseUrl}/tx`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: signedTxHex,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || "Mempool.space broadcast failed")
    }

    const txid = await response.text()

    return {
      txid,
      status: "pending",
      confirmations: 0,
    }
  }

  /**
   * Broadcast via Blockstream API
   */
  private static async broadcastViaBlockstream(signedTxHex: string): Promise<BroadcastResult> {
    const baseUrl =
      config.network === "mainnet" ? "https://blockstream.info/api" : "https://blockstream.info/testnet/api"

    const response = await fetch(`${baseUrl}/tx`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: signedTxHex,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || "Blockstream broadcast failed")
    }

    const txid = await response.text()

    return {
      txid,
      status: "pending",
      confirmations: 0,
    }
  }

  /**
   * Check transaction status and confirmations
   */
  static async getTransactionStatus(txid: string): Promise<TransactionStatus> {
    try {
      // Try Mempool.space first
      const baseUrl = config.network === "mainnet" ? "https://mempool.space/api" : "https://mempool.space/testnet/api"

      const response = await fetch(`${baseUrl}/tx/${txid}`)

      if (!response.ok) {
        throw new Error("Transaction not found")
      }

      const data = await response.json()

      return {
        txid,
        status: data.status.confirmed ? "confirmed" : "pending",
        confirmations: data.status.block_height ? 1 : 0, // Simplified
        blockHeight: data.status.block_height,
        timestamp: data.status.block_time,
      }
    } catch (error) {
      console.error("[brc20kit] Failed to get transaction status:", error)
      return {
        txid,
        status: "pending",
        confirmations: 0,
      }
    }
  }

  /**
   * Wait for transaction confirmation with polling
   */
  static async waitForConfirmation(
    txid: string,
    options: {
      minConfirmations?: number
      timeout?: number
      pollInterval?: number
    } = {},
  ): Promise<TransactionStatus> {
    const minConfirmations = options.minConfirmations || 1
    const timeout = options.timeout || 300000 // 5 minutes
    const pollInterval = options.pollInterval || 10000 // 10 seconds

    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const status = await this.getTransactionStatus(txid)

      if (status.confirmations >= minConfirmations) {
        return status
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    throw new Error("Transaction confirmation timeout")
  }

  /**
   * Broadcast with retry logic
   */
  static async broadcastWithRetry(signedTxHex: string, maxRetries = 3): Promise<BroadcastResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[brc20kit] Broadcast attempt ${attempt}/${maxRetries}`)
        return await this.broadcast(signedTxHex)
      } catch (error: any) {
        lastError = error
        console.error(`[brc20kit] Broadcast attempt ${attempt} failed:`, error.message)

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
        }
      }
    }

    throw lastError || new Error("Broadcast failed after retries")
  }
}
