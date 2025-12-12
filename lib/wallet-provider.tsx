"use client"

import { createContext, useState, useEffect } from "react"
import { useLaserEyes } from "@/lib/lasereyes-wallet-provider"
import type { WalletType } from "@/lib/wallets"
import type { WalletState } from "@/types"
import { selectWalletAddress, type AddressSelectionResult } from "@/lib/wallet-address-selector"
import { UTXOProvider } from "@/lib/utxo-provider"

interface WalletContextType extends WalletState {
  connect: (walletType?: WalletType) => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  error: string | null
  availableWallets: WalletType[]
  signPsbt: (psbtBase64: string, broadcast?: boolean) => Promise<{ signedPsbtBase64: string; txid?: string }>
  getUtxos: () => Promise<any[]>
  getBalance: () => Promise<number>
  // Address selection metadata
  selectedAddress: string | null
  paymentAddress: string | null
  ordinalsAddress: string | null
  paymentBalance: number
  ordinalsBalance: number
  totalBalance: number
  isResolvingAddress: boolean
  addressSelectionReason: string | null
}

const defaultContextValue: WalletContextType = {
  connected: false,
  address: null,
  publicKey: null,
  network: "mainnet",
  connect: async () => {
    throw new Error("Wallet not initialized")
  },
  disconnect: () => {},
  isConnecting: false,
  error: null,
  availableWallets: [],
  signPsbt: async () => {
    throw new Error("Wallet not initialized")
  },
  getUtxos: async () => [],
  getBalance: async () => 0,
  selectedAddress: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentBalance: 0,
  ordinalsBalance: 0,
  totalBalance: 0,
  isResolvingAddress: false,
  addressSelectionReason: null,
}

const WalletContext = createContext<WalletContextType>(defaultContextValue)

export function useWallet(): WalletContextType {
  const laserEyes = useLaserEyes()
  const [addressSelection, setAddressSelection] = useState<AddressSelectionResult | null>(null)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)

  // Resolve address selection when wallet connects or addresses change
  useEffect(() => {
    if (!laserEyes.connected || (!laserEyes.paymentAddress && !laserEyes.address)) {
      setAddressSelection(null)
      return
    }

    const resolveAddress = async () => {
      setIsResolvingAddress(true)
      try {
        console.log("[brc20kit] 🔍 Resolving wallet address selection...")
        const selection = await selectWalletAddress(laserEyes.paymentAddress, laserEyes.address)
        setAddressSelection(selection)
        console.log("[brc20kit] ✅ Address resolved:", selection.selectedAddress.substring(0, 8) + "...")
        console.log("[brc20kit] 💰 Total balance from selection:", selection.totalBalance, "sats")
        
        // Try to refresh LaserEyes balance after address selection
        if (laserEyes.connected && laserEyes.getBalance) {
          try {
            const refreshedBalance = await laserEyes.getBalance()
            console.log("[brc20kit] 💰 LaserEyes balance refreshed:", refreshedBalance, "sats")
          } catch (balError: any) {
            console.warn("[brc20kit] ⚠️ Could not refresh LaserEyes balance:", balError.message)
          }
        }
      } catch (error: any) {
        console.error("[brc20kit] ❌ Address resolution failed:", error.message)
        // Fallback to payment address if available
        const fallbackAddress = laserEyes.paymentAddress || laserEyes.address
        if (fallbackAddress) {
          // Try to fetch balance for fallback address
          let fallbackBalance = 0
          try {
            const utxos = await UTXOProvider.getUTXOs(fallbackAddress)
            fallbackBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
            console.log("[brc20kit] 💰 Fallback address balance:", fallbackBalance, "sats")
          } catch (balError: any) {
            console.warn("[brc20kit] ⚠️ Could not fetch fallback balance:", balError.message)
          }
          
          setAddressSelection({
            selectedAddress: fallbackAddress,
            paymentAddress: laserEyes.paymentAddress,
            ordinalsAddress: laserEyes.address,
            paymentBalance: laserEyes.paymentAddress === fallbackAddress ? fallbackBalance : 0,
            ordinalsBalance: laserEyes.address === fallbackAddress ? fallbackBalance : 0,
            totalBalance: fallbackBalance,
            reason: "Fallback (resolution failed)",
          })
        }
      } finally {
        setIsResolvingAddress(false)
      }
    }

    resolveAddress()
  }, [laserEyes.connected, laserEyes.paymentAddress, laserEyes.address, laserEyes.getBalance])

  // Use selected address, fallback to payment address, then ordinals address
  const walletAddress = addressSelection?.selectedAddress || laserEyes.paymentAddress || laserEyes.address || null

  const logOnce = (() => {
    let lastLog = ""
    return (message: string) => {
      if (message !== lastLog) {
        console.log(message)
        lastLog = message
      }
    }
  })()

  logOnce("[brc20kit] 🌉 Wallet bridge state:", {
    connected: laserEyes.connected,
    selectedAddress: walletAddress,
    paymentAddress: laserEyes.paymentAddress,
    ordinalsAddress: laserEyes.address,
    isResolving: isResolvingAddress,
    selectionReason: addressSelection?.reason,
  })

  return {
    connected: laserEyes.connected,
    address: walletAddress,
    publicKey: laserEyes.publicKey || null,
    network: laserEyes.network as "mainnet" | "testnet",
    connect: async (walletType?: WalletType) => {
      console.log("[brc20kit] 🔌 Connecting:", walletType)
      if (walletType) {
        await laserEyes.connect(walletType)
      } else {
        throw new Error("Wallet type is required")
      }
    },
    disconnect: () => {
      console.log("[brc20kit] 🔌 Disconnecting")
      laserEyes.disconnect()
      setAddressSelection(null)
    },
    isConnecting: laserEyes.isConnecting,
    error: null,
    availableWallets: [],
    signPsbt: async (psbtBase64: string, broadcast = true) => {
      const result = await laserEyes.signPsbt(psbtBase64, true, broadcast)
      return result
    },
    getUtxos: async () => {
      // Use UTXOProvider (Unisat API) exclusively
      const address = walletAddress
      if (!address) {
        console.warn("[brc20kit] ⚠️ No address available for UTXO fetch")
        return []
      }
      try {
        console.log("[brc20kit] 📦 Fetching UTXOs using Unisat API for:", address.substring(0, 8) + "...")
        const utxos = await UTXOProvider.getUTXOs(address)
        return utxos || []
      } catch (error: any) {
        console.error("[brc20kit] ❌ getUtxos failed:", error.message)
        return []
      }
    },
    getBalance: async () => {
      // Always actively fetch balance from UTXOs for the selected address
      const address = walletAddress
      if (!address) {
        console.warn("[brc20kit] ⚠️ No address available for balance fetch")
        return 0
      }

      try {
        console.log("[brc20kit] 💰 Fetching balance for:", address.substring(0, 8) + "...")
        const utxos = await UTXOProvider.getUTXOs(address)
        const balance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
        console.log("[brc20kit] ✅ Balance fetched:", balance, "sats")
        return balance
      } catch (error: any) {
        console.error("[brc20kit] ❌ Failed to fetch balance:", error.message)
        // Fallback to address selection balance if available
        if (addressSelection) {
          console.log("[brc20kit] ⚠️ Using cached balance from address selection:", addressSelection.totalBalance)
          return addressSelection.totalBalance
        }
        // Last resort: try laserEyes balance
        console.log("[brc20kit] ⚠️ Using laserEyes balance as fallback:", laserEyes.balance)
        return laserEyes.balance || 0
      }
    },
    // Address selection metadata
    selectedAddress: walletAddress,
    paymentAddress: laserEyes.paymentAddress,
    ordinalsAddress: laserEyes.address,
    paymentBalance: addressSelection?.paymentBalance || 0,
    ordinalsBalance: addressSelection?.ordinalsBalance || 0,
    totalBalance: addressSelection?.totalBalance || laserEyes.balance,
    isResolvingAddress,
    addressSelectionReason: addressSelection?.reason || null,
  }
}

export { WalletContext }
export type { WalletContextType }
