// BRC-20 transaction builder utilities

export interface DeployTokenParams {
  ticker: string
  maxSupply: string
  mintLimit?: string
}

export interface MintTokenParams {
  ticker: string
  amount: string
}

export interface TransferTokenParams {
  ticker: string
  amount: string
  recipient: string
}

export class BRC20Builder {
  /**
   * Generate BRC-20 deploy operation JSON
   */
  static createDeployJSON(params: DeployTokenParams): string {
    const payload: Record<string, string> = {
      p: "brc-20",
      op: "deploy",
      tick: params.ticker.toLowerCase(),
      max: params.maxSupply,
    }

    if (params.mintLimit) {
      payload.lim = params.mintLimit
    }

    return JSON.stringify(payload)
  }

  /**
   * Generate BRC-20 mint operation JSON
   */
  static createMintJSON(params: MintTokenParams): string {
    return JSON.stringify({
      p: "brc-20",
      op: "mint",
      tick: params.ticker.toLowerCase(),
      amt: params.amount,
    })
  }

  /**
   * Generate BRC-20 transfer operation JSON
   */
  static createTransferJSON(params: TransferTokenParams): string {
    return JSON.stringify({
      p: "brc-20",
      op: "transfer",
      tick: params.ticker.toLowerCase(),
      amt: params.amount,
    })
  }

  /**
   * Validate ticker format (any length except exactly 4 characters)
   */
  static validateTicker(ticker: string): { valid: boolean; error?: string } {
    if (!ticker) {
      return { valid: false, error: "Ticker is required" }
    }

    if (ticker.length === 4) {
      return { valid: false, error: "Ticker cannot be exactly 4 characters (reserved for standard BRC-20)" }
    }

    // No regex validation - any characters are allowed

    return { valid: true }
  }

  /**
   * Validate amount format
   */
  static validateAmount(amount: string): { valid: boolean; error?: string } {
    if (!amount) {
      return { valid: false, error: "Amount is required" }
    }

    const num = Number.parseFloat(amount)
    if (isNaN(num) || num <= 0) {
      return { valid: false, error: "Amount must be a positive number" }
    }

    return { valid: true }
  }

  /**
   * Validate Bitcoin address format (basic check)
   */
  static validateAddress(address: string): { valid: boolean; error?: string } {
    if (!address) {
      return { valid: false, error: "Address is required" }
    }

    // Basic validation for Bitcoin addresses
    if (address.startsWith("bc1") || address.startsWith("tb1") || address.startsWith("1") || address.startsWith("3")) {
      return { valid: true }
    }

    return { valid: false, error: "Invalid Bitcoin address format" }
  }
}
