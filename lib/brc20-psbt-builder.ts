import * as bitcoin from "bitcoinjs-lib"

/**
 * UTXO from API - includes scriptPubKey (scriptPk)
 */
interface UTXO {
  txid: string
  vout: number
  value: number
  scriptPk?: string
  address?: string
}

/**
 * Decode Bitcoin address to scriptPubKey without ECC
 * Supports P2WPKH (SegWit bc1q...), P2PKH (Legacy 1...), and P2SH (Legacy 3...)
 * For Taproot (bc1p...), returns null (requires ECC)
 * 
 * Uses bitcoinjs-lib's address.toOutputScript() which works for non-Taproot addresses
 */
function addressToScriptPubKey(address: string, network: bitcoin.Network): Buffer | null {
  try {
    // Check if it's a Taproot address (bc1p... or tb1p...)
    // Taproot addresses require ECC to decode
    if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
      console.warn("[brc20kit] ⚠️ Taproot address detected - cannot decode without ECC")
      return null
    }
    
    // For SegWit (bc1q...) and Legacy (1..., 3...), bitcoinjs-lib can decode without ECC
    // bitcoin.address.toOutputScript() only requires ECC for Taproot (P2TR)
    try {
      const scriptPubKey = bitcoin.address.toOutputScript(address, network)
      // Convert Uint8Array to Buffer
      return Buffer.from(scriptPubKey)
    } catch (error: any) {
      // If it fails, it might be Taproot or invalid address
      if (error.message && error.message.includes("ECC")) {
        console.warn("[brc20kit] ⚠️ Address requires ECC (likely Taproot):", address)
        return null
      }
      console.warn("[brc20kit] ⚠️ Failed to decode address:", error.message)
      return null
    }
  } catch (error) {
    console.warn("[brc20kit] ⚠️ Failed to decode address:", error)
    return null
  }
}

/**
 * BRC-20 operation format
 */
interface BRC20Operation {
  p: "brc-20"
  op: "mint" | "transfer" | "deploy"
  tick: string
  amt: string
}

/**
 * Result from PSBT building methods
 */
export interface PSBTBuildResult {
  psbtHex: string // PSBT in hex format (required by Unisat, OKX)
  psbtBase64: string // PSBT in base64 format (required by Xverse, LaserEyes)
  changeScriptPubKey: string // ScriptPubKey hex of the change output (for chaining)
}

/**
 * Build a real Bitcoin PSBT for BRC-20 minting using bitcoinjs-lib
 */
export class BRC20PSBTBuilder {
  private network: bitcoin.Network

  constructor(network: "mainnet" | "testnet" = "mainnet") {
    this.network = network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
  }

  /**
   * Create a PSBT for BRC-20 minting
   * @param utxos - Available UTXOs with scriptPubKey
   * @param recipientAddress - User's Taproot address for change
   * @param brc20Data - BRC-20 operation data
   * @param changeAmount - Change amount in satoshis (calculated externally)
   * @param feeRate - Fee rate in sats/vbyte (default: 10)
   * @returns PSBTBuildResult with base64 PSBT and change scriptPubKey
   */
  async buildMintPSBT(
    utxos: UTXO[],
    recipientAddress: string,
    brc20Data: BRC20Operation,
    changeAmount: number,
    feeRate = 1,
  ): Promise<PSBTBuildResult> {
    // Validate inputs
    if (!utxos || utxos.length === 0) {
      throw new Error("No UTXOs provided")
    }

    if (!recipientAddress) {
      throw new Error("Recipient address is required")
    }

    // Get scriptPubKey from first UTXO (sender's address for change)
    const firstUtxo = utxos[0]
    if (!firstUtxo.scriptPk) {
      throw new Error(`UTXO ${firstUtxo.txid}:${firstUtxo.vout} missing scriptPubKey`)
    }
    const changeScriptPubKeyHex = firstUtxo.scriptPk
    const changeScript = Buffer.from(changeScriptPubKeyHex, "hex")

    // Create PSBT
    const psbt = new bitcoin.Psbt({ network: this.network })

    // Track total input value
    let totalInput = 0

    // Add inputs from UTXOs
    for (const utxo of utxos) {
      if (!utxo.scriptPk) {
        throw new Error(`UTXO ${utxo.txid}:${utxo.vout} missing scriptPubKey`)
      }

      // Convert scriptPubKey hex to Buffer, then to Uint8Array
      const scriptPubKey = Buffer.from(utxo.scriptPk, "hex")

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Uint8Array.from(scriptPubKey),
          value: BigInt(utxo.value),
        },
      })

      totalInput += utxo.value
    }

    // Create OP_RETURN output with BRC-20 data
    const brc20Json = JSON.stringify(brc20Data)
    const brc20Buffer = Buffer.from(brc20Json, "utf8")
    const opReturnScript = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, brc20Buffer])

    // Output 0: OP_RETURN
    psbt.addOutput({
      script: opReturnScript,
      value: BigInt(0),
    })

    if (changeAmount < 330) {
      throw new Error(
        `Change amount (${changeAmount} sats) is below dust threshold (330 sats)`,
      )
    }

    // Output 1: Change (RECEIVER ADDRESS = sender's address)
    // Use script directly to avoid ECC requirement - wallet will handle signing
    psbt.addOutput({
      script: changeScript,
      value: BigInt(changeAmount),
    })

    // Convert PSBT to both hex and base64 formats
    const psbtBase64 = psbt.toBase64()
    const psbtHex = Buffer.from(psbtBase64, "base64").toString("hex")
    
    return {
      psbtHex,
      psbtBase64,
      changeScriptPubKey: changeScriptPubKeyHex,
    }
  }

  /**
   * Create a PSBT for BRC-20 minting with commission
   * @param utxos - Available UTXOs with scriptPubKey
   * @param recipientAddress - User's address for change
   * @param brc20Data - BRC-20 operation data
   * @param commissionAddress - Platform commission wallet address
   * @param commissionAmount - Commission amount in satoshis
   * @param changeAmount - Change amount in satoshis
   * @param feeRate - Fee rate in sats/vbyte
   * @returns Base64 encoded PSBT
   */
  async buildMintWithCommissionPSBT(
    utxos: UTXO[],
    recipientAddress: string,
    brc20Data: BRC20Operation,
    commissionAddress: string,
    commissionAmount: number,
    changeAmount: number,
    feeRate = 1,
  ): Promise<PSBTBuildResult> {
    // Validate inputs
    if (!utxos || utxos.length === 0) {
      throw new Error("No UTXOs provided")
    }

    if (!recipientAddress) {
      throw new Error("Recipient address is required")
    }

    if (!commissionAddress) {
      throw new Error("Commission address is required")
    }

    if (commissionAmount < 0) {
      throw new Error("Commission amount must be non-negative")
    }

    if (changeAmount < 330) {
      throw new Error(`Change amount (${changeAmount} sats) is below dust threshold (330 sats)`)
    }

    // Get scriptPubKey from first UTXO (sender's address for change)
    const firstUtxo = utxos[0]
    if (!firstUtxo.scriptPk) {
      throw new Error(`UTXO ${firstUtxo.txid}:${firstUtxo.vout} missing scriptPubKey`)
    }
    const changeScriptPubKeyHex = firstUtxo.scriptPk
    const changeScript = Buffer.from(changeScriptPubKeyHex, "hex")

    // Create PSBT
    const psbt = new bitcoin.Psbt({ network: this.network })

    // Track total input value
    let totalInput = 0

    // Add inputs from UTXOs
    for (const utxo of utxos) {
      if (!utxo.scriptPk) {
        throw new Error(`UTXO ${utxo.txid}:${utxo.vout} missing scriptPubKey`)
      }

      // Convert scriptPubKey hex to Buffer, then to Uint8Array
      const scriptPubKey = Buffer.from(utxo.scriptPk, "hex")

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Uint8Array.from(scriptPubKey),
          value: BigInt(utxo.value),
        },
      })

      totalInput += utxo.value
    }

    // Create OP_RETURN output with BRC-20 data
    const brc20Json = JSON.stringify(brc20Data)
    const brc20Buffer = Buffer.from(brc20Json, "utf8")
    const opReturnScript = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, brc20Buffer])

    // Output 0: OP_RETURN
    psbt.addOutput({
      script: opReturnScript,
      value: BigInt(0),
    })

    // Output 1: RECEIVER ADDRESS (change = inputs_value - platform_fees - bitcoin_fees)
    // Use script directly from UTXO to avoid ECC requirement
    psbt.addOutput({
      script: changeScript,
      value: BigInt(changeAmount),
    })

    // Output 2: PLATFORM ADDRESS (platform_fees)
    // Try to decode address to scriptPubKey without ECC (works for SegWit, not Taproot)
    console.log(`[brc20kit] 💰 Adding commission output:`)
    console.log(`[brc20kit]   - Commission amount: ${commissionAmount} sats`)
    console.log(`[brc20kit]   - Commission address: ${commissionAddress}`)
    
    if (commissionAmount > 0) {
      const commissionScriptPubKey = process.env.COMMISSION_SCRIPT_PUBKEY || process.env.NEXT_PUBLIC_COMMISSION_SCRIPT_PUBKEY
      
      if (commissionScriptPubKey) {
        // Use scriptPubKey directly from env var (preferred method)
        const commissionScript = Buffer.from(commissionScriptPubKey, "hex")
        psbt.addOutput({
          script: commissionScript,
          value: BigInt(commissionAmount),
        })
      } else {
        // Try to decode address to scriptPubKey without ECC
        const decodedScript = addressToScriptPubKey(commissionAddress, this.network)
        
        if (decodedScript) {
          // Successfully decoded address (SegWit or Legacy)
          psbt.addOutput({
            script: decodedScript,
            value: BigInt(commissionAmount),
          })
        } else {
          // Failed to decode (likely Taproot) - try direct address (will fail but give clear error)
          try {
            psbt.addOutput({
              address: commissionAddress,
              value: BigInt(commissionAmount),
            })
          } catch (error: any) {
            console.warn("[brc20kit] ⚠️ Commission address conversion failed:", error.message)
            throw new Error(
              `Cannot add commission output for address ${commissionAddress}. ` +
              `This address type requires ECC library. ` +
              `Please provide COMMISSION_SCRIPT_PUBKEY in env vars (hex format). ` +
              `You can get it from a block explorer or by decoding the address.`
            )
          }
        }
      }
    }

    // Convert PSBT to both hex and base64 formats
    const psbtBase64 = psbt.toBase64()
    const psbtHex = Buffer.from(psbtBase64, "base64").toString("hex")
    
    return {
      psbtHex,
      psbtBase64,
      changeScriptPubKey: changeScriptPubKeyHex,
    }
  }

  /**
   * Create a PSBT for chained BRC-20 minting (no commission on chained mints)
   * @param utxos - Available UTXOs with scriptPubKey (from previous mint)
   * @param recipientAddress - User's address for change
   * @param brc20Data - BRC-20 operation data
   * @param changeValue - Value for change output (calculated from input - fee)
   * @param feeRate - Fee rate in sats/vbyte
   * @returns Base64 encoded PSBT
   */
  async buildChainedMintPSBT(
    utxos: UTXO[],
    recipientAddress: string,
    brc20Data: BRC20Operation,
    inscriptionValue: number, // Kept for backward compatibility but not used in new structure
    changeValue: number,
    feeRate = 1,
  ): Promise<PSBTBuildResult> {
    // Validate inputs
    if (!utxos || utxos.length === 0) {
      throw new Error("No UTXOs provided")
    }

    if (!recipientAddress) {
      throw new Error("Recipient address is required")
    }

    if (changeValue < 330) {
      throw new Error(`Change value (${changeValue} sats) is below dust threshold (330 sats)`)
    }

    // Get scriptPubKey from first UTXO (sender's address for change)
    // For chained mints, the change goes back to the sender
    const firstUtxo = utxos[0]
    if (!firstUtxo.scriptPk) {
      throw new Error(`UTXO ${firstUtxo.txid}:${firstUtxo.vout} missing scriptPubKey`)
    }
    const changeScriptPubKeyHex = firstUtxo.scriptPk
    const changeScript = Buffer.from(changeScriptPubKeyHex, "hex")

    // Create PSBT
    const psbt = new bitcoin.Psbt({ network: this.network })

    // Track total input value
    let totalInput = 0

    // Add inputs from UTXOs with witness UTXO data
    for (const utxo of utxos) {
      if (!utxo.scriptPk) {
        throw new Error(`UTXO ${utxo.txid}:${utxo.vout} missing scriptPubKey`)
      }

      // Convert scriptPubKey hex to Buffer, then to Uint8Array
      const scriptPubKey = Buffer.from(utxo.scriptPk, "hex")

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Uint8Array.from(scriptPubKey),
          value: BigInt(utxo.value),
        },
      })

      totalInput += utxo.value
    }

    // Create OP_RETURN output with BRC-20 data
    const brc20Json = JSON.stringify(brc20Data)
    const brc20Buffer = Buffer.from(brc20Json, "utf8")
    const opReturnScript = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, brc20Buffer])

    // Output 0: OP_RETURN
    psbt.addOutput({
      script: opReturnScript,
      value: BigInt(0),
    })

    // Output 1: Change (RECEIVER ADDRESS = sender's address)
    // Use script directly from UTXO to avoid ECC requirement
    psbt.addOutput({
      script: changeScript,
      value: BigInt(changeValue),
    })

    // Convert PSBT to both hex and base64 formats
    const psbtBase64 = psbt.toBase64()
    const psbtHex = Buffer.from(psbtBase64, "base64").toString("hex")
    
    return {
      psbtHex,
      psbtBase64,
      changeScriptPubKey: changeScriptPubKeyHex,
    }
  }

  /**
   * Decode and validate a PSBT for debugging
   */
  static decodePSBT(psbtBase64: string): any {
    try {
      const psbt = bitcoin.Psbt.fromBase64(psbtBase64)

      return {
        valid: true,
        inputCount: psbt.inputCount,
        inputs: psbt.data.inputs.map((input, i) => ({
          index: i,
          hasWitnessUtxo: !!input.witnessUtxo,
          value: input.witnessUtxo?.value,
        })),
        outputCount: psbt.txOutputs.length,
        outputs: psbt.txOutputs.map((output, i) => ({
          index: i,
          address: output.address || "OP_RETURN",
          value: output.value,
        })),
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
