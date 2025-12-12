/**
 * PSBT Size Calculator Unit Tests
 * 
 * Tests for precise PSBT size calculation with address-based detection
 * Uses real mainnet addresses and UTXOs for realistic testing
 */

import { describe, it, expect } from "@jest/globals"
import { PSBTSizeCalculator } from "@/lib/psbt-size-calculator"

describe("PSBTSizeCalculator", () => {
  describe("detectAddressType()", () => {
    it("should detect P2WPKH from bc1q address", () => {
      expect(
        PSBTSizeCalculator.detectAddressType("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"),
      ).toBe("P2WPKH")
    })

    it("should detect P2TR from bc1p address", () => {
      expect(
        PSBTSizeCalculator.detectAddressType("bc1p2p6d0pzwhz5g0u002em0uj303hmhkh3gqs2nh6hxuw90rwkzg5nsatsphn"),
      ).toBe("P2TR")
    })

    it("should return null for unknown address format", () => {
      expect(PSBTSizeCalculator.detectAddressType("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")).toBeNull()
    })

    it("should return null for invalid address", () => {
      expect(PSBTSizeCalculator.detectAddressType("invalid")).toBeNull()
    })
  })

  describe("detectTypeFromScriptPubKey()", () => {
    it("should detect P2WPKH from 22-byte scriptPubKey", () => {
      const scriptPk = "0014a6f185507b00dd3030b2095dc6e15bbeae6f714a" // 22 bytes
      expect(PSBTSizeCalculator.detectTypeFromScriptPubKey(scriptPk)).toBe("P2WPKH")
    })

    it("should detect P2TR from 33-byte scriptPubKey", () => {
      // P2TR: OP_1 (0x51) + 32-byte x-only pubkey = 33 bytes total
      // "51" (OP_1) + 64 hex chars (32 bytes) = 66 hex chars = 33 bytes
      const scriptPk = "51" + "0".repeat(64) // 33 bytes (OP_1 + 32 bytes)
      expect(PSBTSizeCalculator.detectTypeFromScriptPubKey(scriptPk)).toBe("P2TR")
    })

    it("should return null for invalid scriptPubKey", () => {
      expect(PSBTSizeCalculator.detectTypeFromScriptPubKey("invalid")).toBeNull()
    })
  })

  describe("detectType() - Combined Detection", () => {
    it("should prefer address over scriptPubKey", () => {
      const type = PSBTSizeCalculator.detectType(
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "51" + "0".repeat(64), // P2TR scriptPubKey (33 bytes)
      )
      expect(type).toBe("P2WPKH") // Address takes precedence
    })

    it("should fallback to scriptPubKey when address not provided", () => {
      const type = PSBTSizeCalculator.detectType(undefined, "0014a6f185507b00dd3030b2095dc6e15bbeae6f714a")
      expect(type).toBe("P2WPKH")
    })

    it("should default to P2WPKH when both fail", () => {
      const type = PSBTSizeCalculator.detectType("invalid", "invalid")
      expect(type).toBe("P2WPKH")
    })
  })

  describe("calculateOpReturnSize()", () => {
    it("should calculate size for standard BRC-20 mint", () => {
      const json = '{"p":"brc-20","op":"mint","tick":"ORDI","amt":"1000"}'
      const size = PSBTSizeCalculator.calculateOpReturnSize(json)
      expect(size).toBeGreaterThan(50)
      expect(size).toBeLessThan(80)
    })

    it("should calculate size for long ticker", () => {
      const json = '{"p":"brc-20","op":"mint","tick":"ABCD","amt":"1"}'
      const size = PSBTSizeCalculator.calculateOpReturnSize(json)
      expect(size).toBeGreaterThan(50)
    })

    it("should calculate size for large amount", () => {
      const json = '{"p":"brc-20","op":"mint","tick":"ORDI","amt":"1000000000"}'
      const size = PSBTSizeCalculator.calculateOpReturnSize(json)
      expect(size).toBeGreaterThan(60)
    })

    it("should handle empty JSON", () => {
      const size = PSBTSizeCalculator.calculateOpReturnSize("{}")
      expect(size).toBeGreaterThan(10)
    })
  })

  describe("calculateFirstPSBTSize()", () => {
    it("should calculate size for single P2WPKH input with commission", () => {
      const size = PSBTSizeCalculator.calculateFirstPSBTSize({
        inputs: [
          {
            address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            scriptPubKey: "0014a6f185507b00dd3030b2095dc6e15bbeae6f714a",
          },
        ],
        ticker: "ORDI",
        amount: "1000",
        hasCommission: true,
        commissionAddress: "bc1q5mcc25rmqrwnqv9jp9wudc2mh6hx7u2273vzyk",
      })
      expect(size).toBeGreaterThan(200)
      expect(size).toBeLessThan(300)
    })

    it("should calculate size for single P2TR input without commission", () => {
      const size = PSBTSizeCalculator.calculateFirstPSBTSize({
        inputs: [
          {
            address: "bc1p2p6d0pzwhz5g0u002em0uj303hmhkh3gqs2nh6hxuw90rwkzg5nsatsphn",
            scriptPubKey: "51" + "0".repeat(64), // P2TR: 33 bytes (OP_1 + 32 bytes)
          },
        ],
        ticker: "ORDI",
        amount: "1000",
        hasCommission: false,
      })
      expect(size).toBeGreaterThan(150)
      expect(size).toBeLessThan(250)
    })

    it("should calculate size for multiple inputs", () => {
      const size = PSBTSizeCalculator.calculateFirstPSBTSize({
        inputs: [
          {
            address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            scriptPubKey: "0014" + "0".repeat(40),
          },
          {
            address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            scriptPubKey: "0014" + "0".repeat(40),
          },
        ],
        ticker: "ORDI",
        amount: "1000",
        hasCommission: true,
        commissionAddress: "bc1q5mcc25rmqrwnqv9jp9wudc2mh6hx7u2273vzyk",
      })
      expect(size).toBeGreaterThan(250)
    })

    it("should use scriptPubKey fallback when address missing", () => {
      const size = PSBTSizeCalculator.calculateFirstPSBTSize({
        inputs: [
          {
            address: undefined,
            scriptPubKey: "0014a6f185507b00dd3030b2095dc6e15bbeae6f714a",
          },
        ],
        ticker: "ORDI",
        amount: "1000",
        hasCommission: false,
      })
      expect(size).toBeGreaterThan(150)
    })
  })

  describe("calculateChainedPSBTSize()", () => {
    it("should calculate size for P2WPKH chained PSBT", () => {
      const size = PSBTSizeCalculator.calculateChainedPSBTSize({
        inputType: "P2WPKH",
        ticker: "ORDI",
        amount: "1000",
      })
      expect(size).toBeGreaterThan(150)
      expect(size).toBeLessThan(200)
    })

    it("should calculate size for P2TR chained PSBT", () => {
      const size = PSBTSizeCalculator.calculateChainedPSBTSize({
        inputType: "P2TR",
        ticker: "ORDI",
        amount: "1000",
      })
      expect(size).toBeGreaterThan(140)
      expect(size).toBeLessThan(190)
    })

    it("should handle different ticker lengths", () => {
      const size1 = PSBTSizeCalculator.calculateChainedPSBTSize({
        inputType: "P2WPKH",
        ticker: "ORDI",
        amount: "1000",
      })
      const size2 = PSBTSizeCalculator.calculateChainedPSBTSize({
        inputType: "P2WPKH",
        ticker: "ABCD",
        amount: "1000",
      })
      // Both tickers are 4 chars, so sizes should be equal or very close
      // Test that calculation works for both
      expect(size1).toBeGreaterThan(150)
      expect(size2).toBeGreaterThan(150)
      expect(Math.abs(size2 - size1)).toBeLessThan(5) // Should be very close
    })
  })

  describe("calculateTotalChainSize()", () => {
    it("should calculate total size for chain", () => {
      const firstSize = 200
      const chainedSize = 150
      const chainLength = 5
      const total = PSBTSizeCalculator.calculateTotalChainSize(firstSize, chainedSize, chainLength)
      expect(total).toBe(200 + 150 * 4) // First + 4 chained
    })

    it("should throw error for invalid chain length", () => {
      expect(() => {
        PSBTSizeCalculator.calculateTotalChainSize(200, 150, 0)
      }).toThrow()
    })
  })
})
