/**
 * Unisat UTXO Provider Unit Tests
 * 
 * Tests for Unisat API integration with real mainnet addresses
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals"
import { UnisatUTXOProvider } from "@/lib/utxo-providers/unisat-provider"

describe("UnisatUTXOProvider", () => {
  const mockApiToken = "test-token-12345"
  const mockApiUrl = "https://open-api.unisat.io"
  const realAddress = "bc1p2p6d0pzwhz5g0u002em0uj303hmhkh3gqs2nh6hxuw90rwkzg5nsatsphn"
  const realTxid = "3c26a48530f99a8a3517ed8459b1fb1ffd413e691cfa0a9164d3193387b7de1b"

  describe("constructor", () => {
    const originalEnv = process.env.UNISAT_API_TOKEN

    beforeEach(() => {
      // Clear environment variable for constructor tests
      delete process.env.UNISAT_API_TOKEN
    })

    afterEach(() => {
      // Restore original environment variable
      if (originalEnv !== undefined) {
        process.env.UNISAT_API_TOKEN = originalEnv
      }
    })

    it("should initialize with provided token", () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)
      expect(provider).toBeInstanceOf(UnisatUTXOProvider)
    })

    it("should throw error when token is missing", () => {
      expect(() => {
        new UnisatUTXOProvider(mockApiUrl, "")
      }).toThrow("UNISAT_API_TOKEN is required")
    })

    it("should use default API URL when not provided", () => {
      const provider = new UnisatUTXOProvider(undefined, mockApiToken)
      expect(provider).toBeInstanceOf(UnisatUTXOProvider)
    })
  })

  describe("getUTXOs()", () => {
    it("should fetch UTXOs successfully with real P2TR address", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      // Mock fetch with real UTXO data
      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 0,
          msg: "OK",
          data: {
            cursor: 0,
            total: 1,
            totalConfirmed: 1,
            totalUnconfirmed: 0,
            totalUnconfirmedSpend: 0,
            utxo: [
              {
                txid: realTxid,
                vout: 2,
                satoshi: 100000,
                scriptPk: "51" + "0".repeat(64), // P2TR scriptPubKey (33 bytes: OP_1 + 32 bytes)
                address: realAddress,
                height: 850000,
                scriptType: "P2TR",
              },
            ],
          },
        }),
      })

      const utxos = await provider.getUTXOs(realAddress)

      expect(utxos).toHaveLength(1)
      expect(utxos[0]).toMatchObject({
        txid: realTxid,
        vout: 2,
        value: 100000,
        scriptPubKey: "51" + "0".repeat(64), // P2TR: 33 bytes
        address: realAddress,
      })
    })

    it("should handle pagination correctly", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)
      let callCount = 0

      ;(global.fetch as jest.Mock) = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First page: 100 UTXOs, more available
          return Promise.resolve({
            ok: true,
            json: async () => ({
              code: 0,
              msg: "OK",
              data: {
                cursor: 100,
                total: 150,
                utxo: Array(100)
                  .fill(null)
                  .map((_, i) => ({
                    txid: `tx${i}`,
                    vout: 0,
                    satoshi: 10000,
                    scriptPk: "0014" + "0".repeat(40),
                    address: realAddress,
                  })),
              },
            }),
          })
        } else {
          // Second page: 50 UTXOs, done
          return Promise.resolve({
            ok: true,
            json: async () => ({
              code: 0,
              msg: "OK",
              data: {
                cursor: 150,
                total: 150,
                utxo: Array(50)
                  .fill(null)
                  .map((_, i) => ({
                    txid: `tx${i + 100}`,
                    vout: 0,
                    satoshi: 10000,
                    scriptPk: "0014" + "0".repeat(40),
                    address: realAddress,
                  })),
              },
            }),
          })
        }
      })

      const utxos = await provider.getUTXOs(realAddress)

      expect(utxos).toHaveLength(150)
      expect(callCount).toBe(2) // Two API calls for pagination
    })

    it("should map field names correctly", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 0,
          msg: "OK",
          data: {
            cursor: 0,
            total: 1,
            utxo: [
              {
                txid: realTxid,
                vout: 2,
                satoshi: 50000, // Unisat field
                scriptPk: "0014a6f185507b00dd3030b2095dc6e15bbeae6f714a", // Unisat field
                address: realAddress,
              },
            ],
          },
        }),
      })

      const utxos = await provider.getUTXOs(realAddress)

      expect(utxos[0].value).toBe(50000) // Mapped from satoshi
      expect(utxos[0].scriptPubKey).toBe("0014a6f185507b00dd3030b2095dc6e15bbeae6f714a") // Mapped from scriptPk
    })

    it("should use fallback address when UTXO address missing", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 0,
          msg: "OK",
          data: {
            cursor: 0,
            total: 1,
            utxo: [
              {
                txid: realTxid,
                vout: 0,
                satoshi: 10000,
                scriptPk: "0014a6f185507b00dd3030b2095dc6e15bbeae6f714a",
                // address missing
              },
            ],
          },
        }),
      })

      const utxos = await provider.getUTXOs(realAddress)

      expect(utxos[0].address).toBe(realAddress) // Uses fallback
    })

    it("should throw error for API error response", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 400,
          msg: "Invalid address",
          data: null,
        }),
      })

      await expect(provider.getUTXOs("invalid")).rejects.toThrow("Unisat API error")
    })

    it("should throw error for HTTP error", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"msg": "Unauthorized"}',
      })

      await expect(provider.getUTXOs(realAddress)).rejects.toThrow("Unisat API HTTP error")
    })

    it("should throw error for invalid token", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, "invalid-token")

      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"msg": "Invalid token"}',
      })

      await expect(provider.getUTXOs(realAddress)).rejects.toThrow()
    })

    it("should throw error when address is empty", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      await expect(provider.getUTXOs("")).rejects.toThrow("Address is required")
    })
  })

  describe("field mapping", () => {
    it("should correctly map all required fields for real P2TR UTXO", async () => {
      const provider = new UnisatUTXOProvider(mockApiUrl, mockApiToken)

      ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 0,
          msg: "OK",
          data: {
            cursor: 0,
            total: 1,
            utxo: [
              {
                txid: realTxid,
                vout: 2,
                satoshi: 75000,
                scriptPk: "51" + "0".repeat(64), // P2TR scriptPubKey (33 bytes: OP_1 + 32 bytes)
                address: realAddress,
              },
            ],
          },
        }),
      })

      const utxos = await provider.getUTXOs(realAddress)

      expect(utxos[0]).toMatchObject({
        txid: realTxid,
        vout: 2,
        value: 75000,
        scriptPubKey: "51" + "0".repeat(64), // P2TR: 33 bytes
        address: realAddress,
      })
    })
  })
})
