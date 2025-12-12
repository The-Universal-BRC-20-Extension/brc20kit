// Bitcoin transaction builder for BRC-20 inscriptions
// Handles PSBT construction, OP_RETURN encoding, fee calculation, and UTXO selection

import { config } from "./config"

export interface TransactionInput {
  txid: string
  vout: number
  value: number // satoshis
  address: string
  scriptPubKey?: string // Hex-encoded scriptPubKey from UTXO API
}

export interface TransactionOutput {
  address: string
  value: number // satoshis
}

export interface InscriptionData {
  contentType: string
  content: string // JSON string for BRC-20 operations
}

export interface BuildTransactionParams {
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  changeAddress: string
  feeRate?: number // sat/vB
  inscription?: InscriptionData
}

export interface PSBTResult {
  psbtBase64: string
  psbtHex: string
  fee: number
  estimatedSize: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
}

export class TransactionBuilder {
  /**
   * Build a PSBT (Partially Signed Bitcoin Transaction) for BRC-20 operations
   * This creates the transaction structure that will be signed by the wallet
   */
  static async buildPSBT(params: BuildTransactionParams): Promise<PSBTResult> {
    const feeRate = params.feeRate || config.constants.defaultFeeRate

    // Calculate transaction size estimate
    const estimatedSize = this.estimateTransactionSize({
      inputCount: params.inputs.length,
      outputCount: params.outputs.length,
      hasInscription: !!params.inscription,
    })

    // Calculate fee
    const fee = Math.max(estimatedSize * feeRate, config.constants.minFee)

    // Calculate total input value
    const totalInput = params.inputs.reduce((sum, input) => sum + input.value, 0)

    // Calculate total output value
    const totalOutput = params.outputs.reduce((sum, output) => sum + output.value, 0)

    // Calculate change
    const change = totalInput - totalOutput - fee

    if (change < 0) {
      throw new Error(`Insufficient funds. Need ${Math.abs(change)} more satoshis for fee.`)
    }

    // Add change output if significant (dust threshold: 330 sats)
    const finalOutputs = [...params.outputs]
    if (change > 330) {
      finalOutputs.push({
        address: params.changeAddress,
        value: change,
      })
    }

    // Build PSBT structure
    const psbt = {
      version: 2,
      locktime: 0,
      inputs: params.inputs.map((input) => ({
        txid: input.txid,
        vout: input.vout,
        sequence: 0xfffffffd, // Enable RBF
        witnessUtxo: {
          value: input.value,
          scriptPubKey: input.scriptPubKey || "",
        },
      })),
      outputs: finalOutputs.map((output) => ({
        address: output.address,
        value: output.value,
      })),
    }

    // Add OP_RETURN output for inscription if provided
    if (params.inscription) {
      const opReturnOutput = this.createInscriptionOutput(params.inscription)
      psbt.outputs.unshift(opReturnOutput) // Inscription output first
    }

    // Convert to base64 and hex (in production, use bitcoinjs-lib)
    const psbtBase64 = Buffer.from(JSON.stringify(psbt)).toString("base64")
    const psbtHex = Buffer.from(JSON.stringify(psbt)).toString("hex")

    console.log("[brc20kit] Built PSBT:", {
      inputs: params.inputs.length,
      outputs: finalOutputs.length,
      fee,
      estimatedSize,
      hasInscription: !!params.inscription,
    })

    return {
      psbtBase64,
      psbtHex,
      fee,
      estimatedSize,
      inputs: params.inputs,
      outputs: finalOutputs,
    }
  }

  /**
   * Create OP_RETURN output for BRC-20 inscription
   * Format: OP_RETURN <content-type> <content>
   */
  private static createInscriptionOutput(inscription: InscriptionData): any {
    // Encode inscription data
    const contentTypeBuffer = Buffer.from(inscription.contentType, "utf8")
    const contentBuffer = Buffer.from(inscription.content, "utf8")

    // In production, this would create a proper OP_RETURN script:
    // OP_RETURN <push contentType> <push content>
    const opReturnScript = Buffer.concat([
      Buffer.from([0x6a]), // OP_RETURN
      Buffer.from([contentTypeBuffer.length]),
      contentTypeBuffer,
      Buffer.from([contentBuffer.length]),
      contentBuffer,
    ])

    console.log("[brc20kit] Created inscription output:", {
      contentType: inscription.contentType,
      contentLength: inscription.content.length,
      scriptLength: opReturnScript.length,
    })

    return {
      value: 0, // OP_RETURN outputs have 0 value
      scriptPubKey: opReturnScript.toString("hex"),
    }
  }

  /**
   * Estimate transaction size in virtual bytes
   * Formula: (base_size * 3 + witness_size) / 4
   */
  private static estimateTransactionSize(params: {
    inputCount: number
    outputCount: number
    hasInscription: boolean
  }): number {
    // Base transaction overhead
    let size = 10 // version (4) + locktime (4) + marker/flag (2)

    // Input size: ~148 bytes per P2WPKH input (Taproot is similar)
    size += params.inputCount * 148

    // Output size: ~34 bytes per P2WPKH output
    size += params.outputCount * 34

    // OP_RETURN inscription output (if present)
    if (params.hasInscription) {
      size += 100 // Approximate size for inscription data
    }

    return Math.ceil(size)
  }

  /**
   * Build a BRC-20 deploy transaction
   */
  static async buildDeployTransaction(params: {
    deployJSON: string
    inputs: TransactionInput[]
    recipientAddress: string
    changeAddress: string
    feeRate?: number
  }): Promise<PSBTResult> {
    return this.buildPSBT({
      inputs: params.inputs,
      outputs: [
        {
          address: params.recipientAddress,
          value: 330, // Dust limit for inscription output
        },
      ],
      changeAddress: params.changeAddress,
      feeRate: params.feeRate,
      inscription: {
        contentType: "text/plain;charset=utf-8",
        content: params.deployJSON,
      },
    })
  }

  /**
   * Build a BRC-20 transfer transaction (2-step: inscribe + send)
   */
  static async buildTransferTransaction(params: {
    transferJSON: string
    inputs: TransactionInput[]
    recipientAddress: string
    changeAddress: string
    feeRate?: number
  }): Promise<{ inscribePSBT: PSBTResult; sendPSBT?: PSBTResult }> {
    // Step 1: Inscribe transfer JSON
    const inscribePSBT = await this.buildPSBT({
      inputs: params.inputs,
      outputs: [
        {
          address: params.changeAddress, // Inscribe to self
          value: 330,
        },
      ],
      changeAddress: params.changeAddress,
      feeRate: params.feeRate,
      inscription: {
        contentType: "text/plain;charset=utf-8",
        content: params.transferJSON,
      },
    })

    // Step 2: Send inscribed UTXO to recipient (will be built after step 1 confirms)
    // For now, return only inscribe PSBT
    return { inscribePSBT }
  }

  /**
   * Validate PSBT before signing
   */
  static validatePSBT(psbt: PSBTResult): { valid: boolean; error?: string } {
    if (!psbt.psbtBase64 || !psbt.psbtHex) {
      return { valid: false, error: "Invalid PSBT format" }
    }

    if (psbt.fee < config.constants.minFee) {
      return { valid: false, error: `Fee too low. Minimum: ${config.constants.minFee} sats` }
    }

    if (psbt.inputs.length === 0) {
      return { valid: false, error: "No inputs provided" }
    }

    if (psbt.outputs.length === 0) {
      return { valid: false, error: "No outputs provided" }
    }

    return { valid: true }
  }
}
