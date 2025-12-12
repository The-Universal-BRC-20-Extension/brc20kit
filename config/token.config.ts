/**
 * Token Configuration
 * Centralized configuration for BRC-20 minting portal
 *
 * This file reads from environment variables and provides
 * a single source of truth for token defaults and settings.
 */

export interface TokenConfig {
  network: "mainnet" | "testnet"
  defaultTicker: string
  defaultAmount: string
  defaultFeeRate: number
  defaultNumMints: number
  feesAddress?: string
  feesAmountBTC?: string
  feesAmountSats?: number
  feesScriptPubKey?: string
  logoUrl?: string
  logoDarkUrl?: string
  projectName: string
  simplicityApiUrl: string
  bitcoinRpcUrl?: string
}

function loadTokenConfig(): TokenConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "mainnet") as "mainnet" | "testnet"
  const defaultTicker = process.env.NEXT_PUBLIC_DEFAULT_TICKER || ""
  const defaultAmount = process.env.NEXT_PUBLIC_DEFAULT_AMOUNT || "1000"
  const defaultFeeRate = Number.parseFloat(process.env.NEXT_PUBLIC_DEFAULT_FEE_RATE || "1")
  const defaultNumMints = Number.parseInt(process.env.NEXT_PUBLIC_DEFAULT_NUM_MINTS || "1", 10)

  const feesAddress =
    process.env.NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS ||
    process.env.COMMISSION_WALLET_ADDRESS ||
    process.env.NEXT_PUBLIC_FEES_ADDRESS ||
    undefined

  const feesAmountBTC = process.env.NEXT_PUBLIC_COMMISSION_AMOUNT_BTC || process.env.COMMISSION_AMOUNT_BTC || undefined

  const feesScriptPubKey =
    process.env.COMMISSION_SCRIPT_PUBKEY || process.env.NEXT_PUBLIC_COMMISSION_SCRIPT_PUBKEY || undefined

  const feesAmountSats =
    feesAmountBTC && feesAddress ? Math.floor(Number.parseFloat(feesAmountBTC) * 100_000_000) : undefined

  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || undefined
  const logoDarkUrl = process.env.NEXT_PUBLIC_LOGO_DARK_URL || logoUrl || undefined
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "BRC-20 Kit"
  const simplicityApiUrl = process.env.NEXT_PUBLIC_SIMPLICITY_API_URL || "https://api.simplicity.network"
  const bitcoinRpcUrl = process.env.BITCOIN_RPC_URL || undefined

  if (defaultNumMints < 1 || defaultNumMints > 25) {
    console.warn(`[TokenConfig] defaultNumMints (${defaultNumMints}) out of range, using 1`)
  }

  if (feesAddress && !feesAmountBTC) {
    console.warn("[TokenConfig] feesAddress is set but feesAmountBTC is missing. Fees will be disabled.")
  }

  if (feesAmountBTC && !feesAddress) {
    console.warn("[TokenConfig] feesAmountBTC is set but feesAddress is missing. Fees will be disabled.")
  }

  if (feesAddress && feesAmountSats && feesAmountSats < 0) {
    throw new Error("[TokenConfig] feesAmountBTC must be non-negative")
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[TokenConfig] Configuration loaded:")
    console.log("  - Network:", network)
    console.log("  - Default ticker:", defaultTicker || "(not set)")
    console.log("  - Default amount:", defaultAmount)
    console.log("  - Default fee rate:", defaultFeeRate, "sat/vB")
    console.log("  - Default num mints:", defaultNumMints)
    console.log("  - Fees address:", feesAddress || "(disabled)")
    console.log("  - Fees amount:", feesAmountSats ? `${feesAmountSats} sats` : "(disabled)")
    console.log("  - Logo URL:", logoUrl || "(default)")
    console.log("  - Project name:", projectName)
  }

  return {
    network,
    defaultTicker,
    defaultAmount,
    defaultFeeRate,
    defaultNumMints: Math.max(1, Math.min(25, defaultNumMints)),
    feesAddress,
    feesAmountBTC,
    feesAmountSats,
    feesScriptPubKey,
    logoUrl,
    logoDarkUrl,
    projectName,
    simplicityApiUrl,
    bitcoinRpcUrl,
  }
}

export const tokenConfig = loadTokenConfig()

export function isPlatformFeesEnabled(): boolean {
  return !!(tokenConfig.feesAddress && tokenConfig.feesAmountSats && tokenConfig.feesAmountSats > 0)
}

export function getPlatformFeesInfo(): {
  enabled: boolean
  address?: string
  amountSats?: number
  amountBTC?: string
} {
  const enabled = isPlatformFeesEnabled()

  return {
    enabled,
    address: enabled ? tokenConfig.feesAddress : undefined,
    amountSats: enabled ? tokenConfig.feesAmountSats : undefined,
    amountBTC: enabled ? tokenConfig.feesAmountBTC : undefined,
  }
}
