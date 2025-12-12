/**
 * PSBT Size Calculator
 * 
 * Precise virtual size (vsize) calculation for Bitcoin PSBTs.
 * Supports both first PSBT (with variable inputs) and chained PSBTs.
 * 
 * Address-based type detection (mainnet only):
 * - bc1q... = P2WPKH (SegWit)
 * - bc1p... = P2TR (Taproot)
 * 
 * Falls back to scriptPubKey detection if address not available.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_TX_SIZE = 10.5 // vB (version + locktime + varints + marker/flag)

// Input vsizes (virtual bytes)
const P2WPKH_INPUT_VSIZE = 68 // vB (SegWit)
const P2TR_INPUT_VSIZE = 57.5 // vB (Taproot)

// Output sizes (bytes = vbytes for outputs, no witness)
const P2WPKH_OUTPUT_SIZE = 31 // bytes (8 value + 1 length + 22 scriptPubKey)
const P2TR_OUTPUT_SIZE = 43 // bytes (8 value + 1 length + 34 scriptPubKey)
const OP_RETURN_BASE_SIZE = 10 // bytes (base overhead)

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AddressType = "P2WPKH" | "P2TR"

export interface PSBTInput {
  address?: string
  scriptPubKey: string
}

export interface FirstPSBTSizeParams {
  inputs: PSBTInput[]
  ticker: string
  amount: string
  hasCommission: boolean
  commissionAddress?: string
  commissionScriptPubKey?: string
}

export interface ChainedPSBTSizeParams {
  inputType: AddressType
  ticker: string
  amount: string
}

// ============================================================================
// PSBT SIZE CALCULATOR
// ============================================================================

export class PSBTSizeCalculator {
  /**
   * Detect address type from address string (mainnet only)
   * 
   * @param address - Bitcoin address (bc1q... or bc1p...)
   * @returns Address type or null if unknown
   * 
   * @example
   * detectAddressType("bc1q...") → "P2WPKH"
   * detectAddressType("bc1p...") → "P2TR"
   */
  static detectAddressType(address: string): AddressType | null {
    // P2WPKH: bc1q... (mainnet only)
    if (address.startsWith("bc1q")) {
      return "P2WPKH"
    }

    // P2TR: bc1p... (mainnet only)
    if (address.startsWith("bc1p")) {
      return "P2TR"
    }

    return null
  }

  /**
   * Detect input/output type from scriptPubKey (fallback method)
   * 
   * @param scriptPubKeyHex - ScriptPubKey in hex format
   * @returns Address type or null if unknown
   * 
   * @example
   * detectTypeFromScriptPubKey("0014...") → "P2WPKH" (22 bytes)
   * detectTypeFromScriptPubKey("5120...") → "P2TR" (33 bytes)
   */
  static detectTypeFromScriptPubKey(scriptPubKeyHex: string): AddressType | null {
    const script = Buffer.from(scriptPubKeyHex, "hex")

    // P2WPKH: OP_0 (0x00) + 20-byte hash = 22 bytes total
    if (script.length === 22 && script[0] === 0x00) {
      return "P2WPKH"
    }

    // P2TR: OP_1 (0x51) + 32-byte x-only pubkey = 33 bytes total
    if (script.length === 33 && script[0] === 0x51) {
      return "P2TR"
    }

    return null
  }

  /**
   * Detect type with fallback: address first, then scriptPubKey
   * 
   * @param address - Bitcoin address (optional, preferred)
   * @param scriptPubKeyHex - ScriptPubKey in hex (optional, fallback)
   * @returns Address type, defaults to P2WPKH if both methods fail
   * 
   * @example
   * detectType("bc1q...", "0014...") → "P2WPKH" (from address)
   * detectType(undefined, "5120...") → "P2TR" (from scriptPubKey)
   * detectType("invalid", undefined) → "P2WPKH" (default)
   */
  static detectType(address?: string, scriptPubKeyHex?: string): AddressType {
    // Try address-based detection first (most reliable)
    // Mainnet only: bc1q = P2WPKH, bc1p = P2TR
    if (address) {
      const addressType = this.detectAddressType(address)
      if (addressType) {
        return addressType
      }
    }

    // Fallback to scriptPubKey-based detection
    if (scriptPubKeyHex) {
      const scriptType = this.detectTypeFromScriptPubKey(scriptPubKeyHex)
      if (scriptType) {
        return scriptType
      }
    }

    // Default to P2WPKH (safer estimate, more common)
    console.warn(
      `[brc20kit] ⚠️ Could not detect address type from address "${address?.substring(0, 10)}..." ` +
        `or scriptPubKey "${scriptPubKeyHex?.substring(0, 20)}...", defaulting to P2WPKH`,
    )
    return "P2WPKH"
  }

  /**
   * Calculate OP_RETURN output size from JSON payload
   * 
   * Formula: base (10) + push_opcode (1-3) + data_length_varint (1-2) + data_length
   * 
   * @param jsonPayload - JSON string to embed in OP_RETURN
   * @returns Size in bytes (bytes = vbytes for outputs)
   * 
   * @example
   * calculateOpReturnSize('{"p":"brc-20","op":"mint","tick":"ORDI","amt":"1000"}')
   * → ~57 bytes
   */
  static calculateOpReturnSize(jsonPayload: string): number {
    const data = Buffer.from(jsonPayload, "utf8")
    const dataLength = data.length

    // Base: value (8) + script length (1) + OP_RETURN (1) = 10 bytes
    let size = OP_RETURN_BASE_SIZE

    // Push opcode size
    if (dataLength <= 75) {
      size += 1 // OP_PUSHDATA1 (or direct push for small data)
    } else if (dataLength <= 255) {
      size += 2 // OP_PUSHDATA1 + 1 byte length
    } else {
      size += 3 // OP_PUSHDATA2 + 2 bytes length (unlikely for BRC-20)
    }

    // Data length varint size (usually 1 byte for BRC-20)
    if (dataLength <= 127) {
      size += 1
    } else {
      size += 2
    }

    // Data itself
    size += dataLength

    return size
  }

  /**
   * Calculate output size based on type
   * 
   * @param outputType - Output type (P2WPKH, P2TR, or OP_RETURN)
   * @param data - JSON payload for OP_RETURN (required if type is OP_RETURN)
   * @returns Size in bytes (bytes = vbytes for outputs)
   */
  static calculateOutputSize(outputType: AddressType | "OP_RETURN", data?: string): number {
    switch (outputType) {
      case "P2WPKH":
        return P2WPKH_OUTPUT_SIZE
      case "P2TR":
        return P2TR_OUTPUT_SIZE
      case "OP_RETURN":
        if (!data) {
          throw new Error("OP_RETURN requires data parameter")
        }
        return this.calculateOpReturnSize(data)
      default:
        throw new Error(`Unknown output type: ${outputType}`)
    }
  }

  /**
   * Calculate first PSBT size (with variable inputs and commission)
   * 
   * Structure:
   * - Base: 10.5 vB
   * - Inputs: Sum of input vsizes (detect type per input)
   * - Outputs:
   *   - OP_RETURN: Calculated from JSON
   *   - Change: Based on input type (same as inputs)
   *   - Commission: Based on commission address type (if enabled)
   * 
   * @param params - First PSBT parameters
   * @returns Virtual size in vB (rounded up)
   */
  static calculateFirstPSBTSize(params: FirstPSBTSizeParams): number {
    const { inputs, ticker, amount, hasCommission, commissionAddress, commissionScriptPubKey } = params

    // Base transaction overhead
    let vsize = BASE_TX_SIZE

    // Calculate input sizes
    let inputVsize = 0
    let inputType: AddressType | null = null

    for (const input of inputs) {
      // Detect type: prefer address (bc1q/bc1p), fallback to scriptPubKey
      const type = this.detectType(input.address, input.scriptPubKey)
      inputType = type // Use first input type for change output

      if (type === "P2WPKH") {
        inputVsize += P2WPKH_INPUT_VSIZE
      } else {
        inputVsize += P2TR_INPUT_VSIZE
      }
    }

    vsize += inputVsize

    // OP_RETURN output
    const mintJSON = JSON.stringify({
      p: "brc-20",
      op: "mint",
      tick: ticker.toLowerCase(),
      amt: amount,
    })
    const opReturnSize = this.calculateOpReturnSize(mintJSON)
    vsize += opReturnSize // OP_RETURN size in bytes = vbytes

    // Change output (same type as inputs)
    if (!inputType) {
      throw new Error("[brc20kit] No inputs provided for size calculation")
    }
    const changeOutputSize = inputType === "P2WPKH" ? P2WPKH_OUTPUT_SIZE : P2TR_OUTPUT_SIZE
    vsize += changeOutputSize

    // Commission output (if enabled)
    if (hasCommission) {
      // Detect commission type: prefer address (bc1q/bc1p), fallback to scriptPubKey
      const commissionType = this.detectType(commissionAddress, commissionScriptPubKey)
      const commissionSize = commissionType === "P2WPKH" ? P2WPKH_OUTPUT_SIZE : P2TR_OUTPUT_SIZE
      vsize += commissionSize
    }

    return Math.ceil(vsize)
  }

  /**
   * Calculate chained PSBT size (subsequent mints in chain)
   * 
   * Structure:
   * - Base: 10.5 vB
   * - 1 Input: From change output (type detected from previous change)
   * - Outputs:
   *   - OP_RETURN: Calculated from JSON
   *   - Change: Same type as input
   * 
   * @param params - Chained PSBT parameters
   * @returns Virtual size in vB (rounded up)
   */
  static calculateChainedPSBTSize(params: ChainedPSBTSizeParams): number {
    const { inputType, ticker, amount } = params

    // Base transaction overhead
    let vsize = BASE_TX_SIZE

    // Single input (from change)
    if (inputType === "P2WPKH") {
      vsize += P2WPKH_INPUT_VSIZE
    } else {
      vsize += P2TR_INPUT_VSIZE
    }

    // OP_RETURN output
    const mintJSON = JSON.stringify({
      p: "brc-20",
      op: "mint",
      tick: ticker.toLowerCase(),
      amt: amount,
    })
    const opReturnSize = this.calculateOpReturnSize(mintJSON)
    vsize += opReturnSize // OP_RETURN size in bytes = vbytes

    // Change output (same type as input)
    const changeOutputSize = inputType === "P2WPKH" ? P2WPKH_OUTPUT_SIZE : P2TR_OUTPUT_SIZE
    vsize += changeOutputSize

    return Math.ceil(vsize)
  }

  /**
   * Calculate total chain size (first PSBT + subsequent PSBTs)
   * 
   * @param firstPSBTSize - Size of first PSBT in vB
   * @param chainedPSBTSize - Size of each chained PSBT in vB
   * @param chainLength - Total number of mints in chain
   * @returns Total virtual size in vB
   */
  static calculateTotalChainSize(
    firstPSBTSize: number,
    chainedPSBTSize: number,
    chainLength: number,
  ): number {
    if (chainLength < 1) {
      throw new Error("Chain length must be at least 1")
    }

    // First PSBT + (N-1) chained PSBTs
    return firstPSBTSize + chainedPSBTSize * (chainLength - 1)
  }
}
