/**
 * Wallet Address Selector
 * 
 * Selects the best wallet address based on balance checking.
 * Checks both payment address (bc1q...) and ordinals address (bc1p...)
 * and selects the one with the highest balance.
 */

import { UTXOProvider } from "./utxo-provider"

export interface AddressSelectionResult {
  selectedAddress: string
  paymentAddress: string | null
  ordinalsAddress: string | null
  paymentBalance: number
  ordinalsBalance: number
  totalBalance: number
  reason: string
}

/**
 * Select wallet address based on balance
 * 
 * Selection Logic:
 * 1. If paymentAddress balance > 0 AND ordinalsAddress balance = 0
 *    → Use paymentAddress
 * 2. If paymentAddress balance = 0 AND ordinalsAddress balance > 0
 *    → Use ordinalsAddress
 * 3. If BOTH have balance > 0
 *    → Use address with MAX(balance)
 * 4. If BOTH have balance = 0
 *    → Default to paymentAddress (with warning)
 * 5. If balance fetch fails
 *    → Default to paymentAddress (with warning)
 */
export async function selectWalletAddress(
  paymentAddress: string | null,
  ordinalsAddress: string | null
): Promise<AddressSelectionResult> {
  // If no addresses provided, return error state
  if (!paymentAddress && !ordinalsAddress) {
    throw new Error("[brc20kit] ❌ No wallet addresses available")
  }

  // If only one address, use it
  if (paymentAddress && !ordinalsAddress) {
    console.log("[brc20kit] 📍 Only payment address available, using:", paymentAddress.substring(0, 8) + "...")
    try {
      const utxos = await UTXOProvider.getUTXOs(paymentAddress)
      const balance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
      return {
        selectedAddress: paymentAddress,
        paymentAddress,
        ordinalsAddress: null,
        paymentBalance: balance,
        ordinalsBalance: 0,
        totalBalance: balance,
        reason: "Only payment address available",
      }
    } catch (error) {
      console.warn("[brc20kit] ⚠️ Failed to fetch balance for payment address, using anyway")
      return {
        selectedAddress: paymentAddress,
        paymentAddress,
        ordinalsAddress: null,
        paymentBalance: 0,
        ordinalsBalance: 0,
        totalBalance: 0,
        reason: "Payment address (balance fetch failed)",
      }
    }
  }

  if (ordinalsAddress && !paymentAddress) {
    console.log("[brc20kit] 📍 Only ordinals address available, using:", ordinalsAddress.substring(0, 8) + "...")
    try {
      const utxos = await UTXOProvider.getUTXOs(ordinalsAddress)
      const balance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
      return {
        selectedAddress: ordinalsAddress,
        paymentAddress: null,
        ordinalsAddress,
        paymentBalance: 0,
        ordinalsBalance: balance,
        totalBalance: balance,
        reason: "Only ordinals address available",
      }
    } catch (error) {
      console.warn("[brc20kit] ⚠️ Failed to fetch balance for ordinals address, using anyway")
      return {
        selectedAddress: ordinalsAddress,
        paymentAddress: null,
        ordinalsAddress,
        paymentBalance: 0,
        ordinalsBalance: 0,
        totalBalance: 0,
        reason: "Ordinals address (balance fetch failed)",
      }
    }
  }

  // Both addresses available - fetch balances for both
  console.log("[brc20kit] 🔍 Checking balances for both addresses...")
  console.log("[brc20kit]   Payment:", paymentAddress!.substring(0, 8) + "...")
  console.log("[brc20kit]   Ordinals:", ordinalsAddress!.substring(0, 8) + "...")

  let paymentBalance = 0
  let ordinalsBalance = 0

  // Fetch payment address balance
  try {
    const paymentUtxos = await UTXOProvider.getUTXOs(paymentAddress!)
    paymentBalance = paymentUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
    console.log("[brc20kit] 💰 Payment address balance:", paymentBalance, "sats")
  } catch (error: any) {
    console.warn("[brc20kit] ⚠️ Failed to fetch payment address balance:", error.message)
    // Continue with 0 balance
  }

  // Fetch ordinals address balance
  try {
    const ordinalsUtxos = await UTXOProvider.getUTXOs(ordinalsAddress!)
    ordinalsBalance = ordinalsUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
    console.log("[brc20kit] 💰 Ordinals address balance:", ordinalsBalance, "sats")
  } catch (error: any) {
    console.warn("[brc20kit] ⚠️ Failed to fetch ordinals address balance:", error.message)
    // Continue with 0 balance
  }

  const totalBalance = paymentBalance + ordinalsBalance

  // Selection logic
  let selectedAddress: string
  let reason: string

  if (paymentBalance > 0 && ordinalsBalance === 0) {
    // Only payment has balance
    selectedAddress = paymentAddress!
    reason = "Payment address has balance"
  } else if (paymentBalance === 0 && ordinalsBalance > 0) {
    // Only ordinals has balance
    selectedAddress = ordinalsAddress!
    reason = "Ordinals address has balance"
  } else if (paymentBalance > 0 && ordinalsBalance > 0) {
    // Both have balance - use the one with MAX balance
    if (paymentBalance >= ordinalsBalance) {
      selectedAddress = paymentAddress!
      reason = `Payment address has higher balance (${paymentBalance} vs ${ordinalsBalance} sats)`
    } else {
      selectedAddress = ordinalsAddress!
      reason = `Ordinals address has higher balance (${ordinalsBalance} vs ${paymentBalance} sats)`
    }
  } else {
    // Both are zero - default to payment address
    selectedAddress = paymentAddress!
    reason = "Both addresses have zero balance, defaulting to payment address"
    console.warn("[brc20kit] ⚠️ Both addresses have zero balance!")
  }

  console.log("[brc20kit] ✅ Selected address:", selectedAddress.substring(0, 8) + "...")
  console.log("[brc20kit] 📊 Reason:", reason)
  console.log("[brc20kit] 💰 Total balance:", totalBalance, "sats")

  return {
    selectedAddress,
    paymentAddress: paymentAddress!,
    ordinalsAddress: ordinalsAddress!,
    paymentBalance,
    ordinalsBalance,
    totalBalance,
    reason,
  }
}
