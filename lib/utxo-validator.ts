const COMMISSION_WALLET_ADDRESS = process.env.COMMISSION_WALLET_ADDRESS
const COMMISSION_AMOUNT_BTC = process.env.COMMISSION_AMOUNT_BTC

if (COMMISSION_WALLET_ADDRESS && COMMISSION_AMOUNT_BTC) {
  const commissionSats = Math.floor(Number.parseFloat(COMMISSION_AMOUNT_BTC) * 100000000)

  if (isNaN(commissionSats) || commissionSats < 0) {
    console.warn("[brc20kit] ⚠️ Invalid COMMISSION_AMOUNT_BTC configuration")
  }
}

export interface UTXO {
  txid: string
  vout: number
  value: number
  scriptPubKey?: string
  address?: string
}

export interface PendingTransactionInfo {
  txid: string
  fee: number
  feeRate: number
  size: number
}

export interface BalanceRequirement {
  totalMints: number
  feePerTx: number
  totalFees: number
  commissionAmount: number
  minRequired: number
}

export interface UTXOStatusCheck {
  available: UTXO[]
  pending: Array<{ utxo: UTXO; pendingTx: PendingTransactionInfo }>
  totalAvailable: number
  totalPending: number
}

export class UTXOValidator {
  /**
   * Calculate total balance from UTXOs
   */
  static calculateTotalBalance(utxos: UTXO[]): number {
    return utxos.reduce((sum, utxo) => sum + utxo.value, 0)
  }

  /**
   * Check if UTXOs are being spent in pending transactions
   */
  static async checkPendingTransactions(utxos: UTXO[], address: string): Promise<UTXOStatusCheck> {
    try {
      console.log("[brc20kit] Checking for pending transactions...")

      // Fetch mempool transactions for this address
      const response = await fetch(`https://mempool.space/api/address/${address}/txs/mempool`)

      if (!response.ok) {
        console.warn("[brc20kit] Failed to fetch mempool transactions, assuming all UTXOs are available")
        return {
          available: utxos,
          pending: [],
          totalAvailable: this.calculateTotalBalance(utxos),
          totalPending: 0,
        }
      }

      const mempoolTxs = await response.json()
      console.log(`[brc20kit] Found ${mempoolTxs.length} pending transaction(s) in mempool`)

      // Build a set of spent outpoints from pending transactions
      const spentOutpoints = new Set<string>()
      const pendingTxMap = new Map<string, PendingTransactionInfo>()

      for (const tx of mempoolTxs) {
        const txInfo: PendingTransactionInfo = {
          txid: tx.txid,
          fee: tx.fee,
          feeRate: (tx.fee / tx.weight) * 4, // Convert vB to sat/vB
          size: tx.size,
        }
        pendingTxMap.set(tx.txid, txInfo)

        // Track all inputs being spent
        for (const input of tx.vin) {
          const outpoint = `${input.txid}:${input.vout}`
          spentOutpoints.add(outpoint)
        }
      }

      // Categorize UTXOs
      const available: UTXO[] = []
      const pending: Array<{ utxo: UTXO; pendingTx: PendingTransactionInfo }> = []

      for (const utxo of utxos) {
        const outpoint = `${utxo.txid}:${utxo.vout}`

        if (spentOutpoints.has(outpoint)) {
          // Find which transaction is spending it
          for (const tx of mempoolTxs) {
            const isSpentByTx = tx.vin.some((input: any) => input.txid === utxo.txid && input.vout === utxo.vout)
            if (isSpentByTx) {
              const pendingTx = pendingTxMap.get(tx.txid)!
              pending.push({ utxo, pendingTx })
              console.log(`[brc20kit] ⚠️ UTXO ${outpoint} is being spent by pending tx ${tx.txid}`)
              break
            }
          }
        } else {
          available.push(utxo)
        }
      }

      console.log(`[brc20kit] UTXO Status: ${available.length} available, ${pending.length} pending`)

      return {
        available,
        pending,
        totalAvailable: this.calculateTotalBalance(available),
        totalPending: this.calculateTotalBalance(pending.map((p) => p.utxo)),
      }
    } catch (error: any) {
      console.error("[brc20kit] Error checking pending transactions:", error.message)
      // On error, assume all UTXOs are available
      return {
        available: utxos,
        pending: [],
        totalAvailable: this.calculateTotalBalance(utxos),
        totalPending: 0,
      }
    }
  }

  /**
   * Calculate required balance for minting operation with commission
   */
  static calculateRequiredBalance(numMints: number, feeRate: number, txSize = 250): BalanceRequirement {
    const feePerTx = Math.ceil(txSize * feeRate)
    const totalNetworkFees = feePerTx * numMints

    // Parse commission amount
    const commissionSats = COMMISSION_AMOUNT_BTC ? Math.floor(Number.parseFloat(COMMISSION_AMOUNT_BTC) * 100000000) : 0

    // Total required: network fees + commission + minimum dust for final change
    const minRequired = totalNetworkFees + commissionSats + 330

    return {
      totalMints: numMints,
      feePerTx,
      totalFees: totalNetworkFees,
      commissionAmount: commissionSats,
      minRequired,
    }
  }

  /**
   * Verify if UTXOs have sufficient balance for operation including commission
   */
  static verifyBalance(
    utxos: UTXO[],
    numMints: number,
    feeRate: number,
  ): {
    valid: boolean
    available: number
    required: number
    deficit?: number
    error?: string
  } {
    const available = this.calculateTotalBalance(utxos)
    const requirement = this.calculateRequiredBalance(numMints, feeRate)

    if (available < requirement.minRequired) {
      return {
        valid: false,
        available,
        required: requirement.minRequired,
        deficit: requirement.minRequired - available,
        error: `Insufficient balance. Need ${requirement.minRequired} sats (${requirement.totalFees} network fees + ${requirement.commissionAmount} commission + 330 dust) but only have ${available} sats (deficit: ${requirement.minRequired - available} sats)`,
      }
    }

    return {
      valid: true,
      available,
      required: requirement.minRequired,
    }
  }

  /**
   * Select optimal UTXOs for transaction
   * Uses a simple greedy algorithm to minimize inputs
   */
  static selectUtxos(utxos: UTXO[], targetAmount: number): UTXO[] {
    // Sort UTXOs by value (descending)
    const sorted = [...utxos].sort((a, b) => b.value - a.value)

    const selected: UTXO[] = []
    let total = 0

    for (const utxo of sorted) {
      if (total >= targetAmount) {
        break
      }
      selected.push(utxo)
      total += utxo.value
    }

    if (total < targetAmount) {
      throw new Error(`Cannot select sufficient UTXOs. Need ${targetAmount} sats but only found ${total} sats`)
    }

    return selected
  }

  /**
   * Validate UTXO structure
   */
  static validateUtxo(utxo: any): utxo is UTXO {
    return (
      typeof utxo === "object" &&
      typeof utxo.txid === "string" &&
      typeof utxo.vout === "number" &&
      typeof utxo.value === "number" &&
      utxo.value > 0
    )
  }

  /**
   * Filter and validate UTXOs
   */
  static filterValidUtxos(utxos: any[]): UTXO[] {
    return utxos.filter((utxo) => this.validateUtxo(utxo))
  }

  /**
   * Validate commission wallet address format
   */
  static validateCommissionAddress(address: string): { valid: boolean; error?: string } {
    try {
      // Basic Bitcoin address validation
      if (!address || address.length < 26 || address.length > 90) {
        return { valid: false, error: "Invalid address length" }
      }

      // Check for valid address prefixes
      const validPrefixes = ["1", "3", "bc1", "tb1", "2", "m", "n"]
      const hasValidPrefix = validPrefixes.some((prefix) => address.startsWith(prefix))

      if (!hasValidPrefix) {
        return { valid: false, error: "Invalid address prefix" }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: "Invalid address format" }
    }
  }

  /**
   * Validate environment variables for commission system
   */
  static validateCommissionConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!COMMISSION_WALLET_ADDRESS) {
      errors.push("COMMISSION_WALLET_ADDRESS environment variable is required")
    } else {
      const addressValidation = this.validateCommissionAddress(COMMISSION_WALLET_ADDRESS)
      if (!addressValidation.valid) {
        errors.push(`Invalid COMMISSION_WALLET_ADDRESS: ${addressValidation.error}`)
      }
    }

    if (!COMMISSION_AMOUNT_BTC) {
      errors.push("COMMISSION_AMOUNT_BTC environment variable is required")
    } else {
      const amount = Number.parseFloat(COMMISSION_AMOUNT_BTC)
      if (isNaN(amount) || amount < 0) {
        errors.push("COMMISSION_AMOUNT_BTC must be a valid non-negative number")
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
