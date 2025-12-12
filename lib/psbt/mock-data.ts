// Mock UTXO data for testing and development

import type { UTXO } from "./types"

/**
 * Generate mock UTXOs for testing
 */
export function generateMockUTXOs(count = 10): UTXO[] {
  const mockUTXOs: UTXO[] = []

  const addresses = [
    "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    "tb1q5n2k3frgpxces3dsw4qfpvqp8q6g3m9v0tgadz",
    "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
  ]

  for (let i = 0; i < count; i++) {
    const value = Math.floor(Math.random() * 1000000) + 10000
    const confirmations = Math.floor(Math.random() * 100) + 1

    mockUTXOs.push({
      txid: generateMockTxid(),
      vout: Math.floor(Math.random() * 4),
      value,
      scriptPubKey: "0014" + generateRandomHex(40),
      address: addresses[i % addresses.length],
      confirmations,
    })
  }

  return mockUTXOs.sort((a, b) => b.value - a.value)
}

/**
 * Generate a mock transaction ID
 */
function generateMockTxid(): string {
  return generateRandomHex(64)
}

/**
 * Generate random hex string
 */
function generateRandomHex(length: number): string {
  let result = ""
  const characters = "0123456789abcdef"
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * Get sample PSBT for testing
 */
export function getSamplePSBT(): string {
  return "cHNidP8BAHECAAAAAeWWjQH5kKLlLqKLqLqLqLqLqLqLqLqLqLqLqLqLqLqLAAAAAAD/////AkBCDwAAAAAAFgAU"
}

/**
 * Mock fee rates in sats per vByte
 */
export const mockFeeRates = {
  slow: 1,
  medium: 5,
  fast: 10,
  custom: 0,
}

/**
 * Calculate mock transaction size in vBytes
 */
export function estimateTransactionSize(inputCount: number, outputCount: number, isSegwit = true): number {
  const baseSize = 10
  const inputSize = isSegwit ? 68 : 148
  const outputSize = 34
  const witnessSize = isSegwit ? inputCount * 107 : 0

  return baseSize + inputCount * inputSize + outputCount * outputSize + witnessSize
}
