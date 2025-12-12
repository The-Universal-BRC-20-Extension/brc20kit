/**
 * UTXO Provider Integration Tests
 * 
 * Tests for UTXO fetching via API route
 */

import { describe, it, expect, beforeEach } from "@jest/globals"
import { UTXOProvider } from "@/lib/utxo-provider"

describe("UTXO Provider Integration", () => {
  const realAddress = "bc1p2p6d0pzwhz5g0u002em0uj303hmhkh3gqs2nh6hxuw90rwkzg5nsatsphn"
  const realTxid = "3c26a48530f99a8a3517ed8459b1fb1ffd413e691cfa0a9164d3193387b7de1b"

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  it("should fetch UTXOs via API route", async () => {
    ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            txid: realTxid,
            vout: 2,
            value: 100000,
            scriptPubKey: "51" + "0".repeat(64), // P2TR: 33 bytes
            address: realAddress,
          },
        ],
      }),
    })

    const utxos = await UTXOProvider.getUTXOs(realAddress)

    expect(utxos).toHaveLength(1)
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/utxos",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: realAddress }),
      }),
    )
  })

  it("should handle API errors gracefully", async () => {
    ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: "Server error" }),
    })

    await expect(UTXOProvider.getUTXOs(realAddress)).rejects.toThrow()
  })

  it("should return empty array for invalid response", async () => {
    ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, data: null }),
    })

    const utxos = await UTXOProvider.getUTXOs(realAddress)

    expect(utxos).toEqual([])
  })
})
