// PSBT Builder Core Logic

import type { UTXO, PSBTInput, PSBTOutput, ValidationResult } from "./types"

export class PSBTBuilderCore {
  private inputs: PSBTInput[] = []
  private outputs: PSBTOutput[] = []

  /**
   * Select UTXOs for a transaction using a simple greedy algorithm
   */
  selectUTXOs(utxos: UTXO[], targetAmount: number, feeRate: number): UTXO[] {
    // Sort UTXOs by value (largest first) for efficient selection
    const sortedUTXOs = [...utxos].sort((a, b) => b.value - a.value)

    const selected: UTXO[] = []
    let totalValue = 0

    for (const utxo of sortedUTXOs) {
      selected.push(utxo)
      totalValue += utxo.value

      // Estimate fee for current selection
      const estimatedFee = this.calculateFee(selected, this.outputs, feeRate)

      // Check if we have enough to cover amount + fee
      if (totalValue >= targetAmount + estimatedFee) {
        break
      }
    }

    return selected
  }

  /**
   * Calculate transaction fee based on inputs, outputs, and fee rate
   * Uses simplified size estimation
   */
  calculateFee(inputs: UTXO[], outputs: PSBTOutput[], feeRate: number): number {
    // Simplified size calculation (in vBytes)
    // Base size: 10 bytes (version, locktime, etc.)
    // Input: ~68 bytes for P2WPKH, ~57.5 for P2TR
    // Output: ~31 bytes for P2WPKH, ~43 for P2TR

    const baseSize = 10
    const inputSize = inputs.length * 68 // Assuming P2WPKH/P2TR
    const outputSize = outputs.length * 43

    const totalSize = baseSize + inputSize + outputSize

    return Math.ceil(totalSize * feeRate)
  }

  /**
   * Estimate transaction size in vBytes
   */
  estimateSize(inputs: PSBTInput[], outputs: PSBTOutput[]): number {
    const baseSize = 10
    const inputSize = inputs.length * 68
    const outputSize = outputs.length * 43

    return baseSize + inputSize + outputSize
  }

  /**
   * Validate PSBT structure and data
   */
  validatePSBT(inputs: PSBTInput[], outputs: PSBTOutput[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for inputs
    if (inputs.length === 0) {
      errors.push("Transaction must have at least one input")
    }

    // Check for outputs
    if (outputs.length === 0) {
      errors.push("Transaction must have at least one output")
    }

    // Validate input values
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value <= 0) {
        errors.push(`Input ${i} has invalid value: ${inputs[i].value}`)
      }
    }

    // Validate output values
    let totalOutput = 0
    for (let i = 0; i < outputs.length; i++) {
      if (outputs[i].value <= 0) {
        errors.push(`Output ${i} has invalid value: ${outputs[i].value}`)
      }
      totalOutput += outputs[i].value
    }

    // Check total input vs output
    const totalInput = inputs.reduce((sum, input) => sum + input.value, 0)
    const fee = totalInput - totalOutput

    if (fee < 0) {
      errors.push("Outputs exceed inputs")
    }

    if (fee > totalInput * 0.5) {
      warnings.push("Fee is more than 50% of input value - this seems unusually high")
    }

    if (fee < 1000) {
      warnings.push("Fee may be too low for timely confirmation")
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate Bitcoin address format
   */
  validateAddress(address: string, network: "mainnet" | "testnet" = "testnet"): boolean {
    // Basic validation - in production, use a proper Bitcoin library
    const mainnetPrefixes = ["1", "3", "bc1"]
    const testnetPrefixes = ["m", "n", "2", "tb1"]

    const prefixes = network === "mainnet" ? mainnetPrefixes : testnetPrefixes

    return prefixes.some((prefix) => address.startsWith(prefix))
  }
}

export const psbtBuilder = new PSBTBuilderCore()
