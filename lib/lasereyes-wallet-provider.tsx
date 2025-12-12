"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from "react"
import { LaserEyesClient, createStores, createConfig } from "@omnisat/lasereyes-core"
import type { NetworkType } from "@omnisat/lasereyes-core"
import { UTXOProvider } from "./utxo-provider"

// Supported wallet types from Lasereyes
export type LaserEyesWalletType =
  | "unisat"
  | "xverse"
  | "okx"
  | "leather"
  | "phantom"
  | "magiceden"
  | "orange"
  | "oyl"
  | "wizz"
  | "opnet"
  | "sparrow"

// Wallet metadata for UI
export interface WalletInfo {
  name: string
  icon: string
  description: string
  downloadUrl: string
  features: string[]
  recommended?: boolean
}

// Wallet logo URLs - using official wallet logos from their websites/CDNs
// Fallback to first letter of wallet name if logo fails to load
const WALLET_LOGO_URLS: Record<LaserEyesWalletType, string> = {
  unisat: "https://unisat.io/favicon.ico",
  xverse: "https://xverse.app/favicon.ico",
  okx: "https://www.okx.com/favicon.ico",
  leather: "https://leather.io/favicon.ico",
  phantom: "https://phantom.app/favicon.ico",
  magiceden: "https://magiceden.io/favicon.ico",
  orange: "https://orangewallet.com/favicon.ico",
  oyl: "https://oyl.io/favicon.ico",
  wizz: "https://wizzwallet.io/favicon.ico",
  opnet: "https://opnet.org/favicon.ico",
  sparrow: "https://sparrowwallet.com/favicon.ico",
}

export const WALLET_INFO: Record<LaserEyesWalletType, WalletInfo> = {
  unisat: {
    name: "Unisat",
    icon: WALLET_LOGO_URLS.unisat,
    description: "Popular Bitcoin wallet with full BRC-20 support",
    downloadUrl: "https://unisat.io",
    features: ["BRC-20", "Ordinals", "Taproot"],
    recommended: true,
  },
  xverse: {
    name: "Xverse",
    icon: WALLET_LOGO_URLS.xverse,
    description: "Bitcoin wallet with Stacks integration",
    downloadUrl: "https://xverse.app",
    features: ["BRC-20", "Ordinals", "Stacks"],
  },
  okx: {
    name: "OKX Wallet",
    icon: WALLET_LOGO_URLS.okx,
    description: "Multi-chain wallet from OKX exchange",
    downloadUrl: "https://okx.com/web3",
    features: ["BRC-20", "Multi-chain", "Trading"],
  },
  leather: {
    name: "Leather",
    icon: WALLET_LOGO_URLS.leather,
    description: "Bitcoin and Stacks wallet (formerly Hiro)",
    downloadUrl: "https://leather.io",
    features: ["Bitcoin", "Stacks", "Open Source"],
  },
  phantom: {
    name: "Phantom",
    icon: WALLET_LOGO_URLS.phantom,
    description: "Multi-chain wallet with Bitcoin support",
    downloadUrl: "https://phantom.app",
    features: ["Bitcoin", "Solana", "Ethereum"],
  },
  magiceden: {
    name: "Magic Eden",
    icon: WALLET_LOGO_URLS.magiceden,
    description: "NFT marketplace wallet",
    downloadUrl: "https://magiceden.io/wallet",
    features: ["Ordinals", "NFTs", "BRC-20"],
  },
  orange: {
    name: "Orange Wallet",
    icon: WALLET_LOGO_URLS.orange,
    description: "Bitcoin-focused wallet",
    downloadUrl: "https://orangewallet.com",
    features: ["Bitcoin", "Lightning", "Taproot"],
  },
  oyl: {
    name: "OYL Wallet",
    icon: WALLET_LOGO_URLS.oyl,
    description: "Bitcoin wallet for power users",
    downloadUrl: "https://oyl.io",
    features: ["Bitcoin", "Advanced", "Developer"],
  },
  wizz: {
    name: "Wizz Wallet",
    icon: WALLET_LOGO_URLS.wizz,
    description: "Simple Bitcoin wallet",
    downloadUrl: "https://wizzwallet.io",
    features: ["Bitcoin", "Simple", "Fast"],
  },
  opnet: {
    name: "OP_NET",
    icon: WALLET_LOGO_URLS.opnet,
    description: "OP_NET protocol wallet",
    downloadUrl: "https://opnet.org",
    features: ["Bitcoin", "OP_NET", "Advanced"],
  },
  sparrow: {
    name: "Sparrow",
    icon: WALLET_LOGO_URLS.sparrow,
    description: "Desktop Bitcoin wallet",
    downloadUrl: "https://sparrowwallet.com",
    features: ["Desktop", "Privacy", "Advanced"],
  },
}

// Wallet detection utilities
export class LaserEyesWalletDetector {
  static isWalletInstalled(type: LaserEyesWalletType): boolean {
    if (typeof window === "undefined") return false

    const checks: Record<LaserEyesWalletType, () => boolean> = {
      unisat: () => !!(window as any).unisat,
      xverse: () => !!(window as any).XverseProviders || !!(window as any).BitcoinProvider,
      okx: () => !!(window as any).okxwallet?.bitcoin,
      leather: () => !!(window as any).LeatherProvider || !!(window as any).HiroWalletProvider,
      phantom: () => !!(window as any).phantom?.bitcoin,
      magiceden: () => !!(window as any).magicEden?.bitcoin,
      orange: () => !!(window as any).orangeWallet,
      oyl: () => !!(window as any).oyl,
      wizz: () => !!(window as any).wizz,
      opnet: () => !!(window as any).opnet,
      sparrow: () => false, // Desktop wallet, not browser extension
    }

    return checks[type]?.() || false
  }

  static detectInstalledWallets(): LaserEyesWalletType[] {
    const allWallets: LaserEyesWalletType[] = [
      "unisat",
      "xverse",
      "okx",
      "leather",
      "phantom",
      "magiceden",
      "orange",
      "oyl",
      "wizz",
      "opnet",
      "sparrow",
    ]

    return allWallets.filter((wallet) => this.isWalletInstalled(wallet))
  }
}

// Context type
interface LaserEyesWalletContextType {
  // Connection state
  connected: boolean
  address: string | null
  paymentAddress: string | null
  publicKey: string | null
  network: NetworkType
  balance: number
  provider: string | null

  // Available wallets
  installedWallets: LaserEyesWalletType[]
  availableWallets: LaserEyesWalletType[]

  // Actions
  connect: (walletType: LaserEyesWalletType) => Promise<void>
  disconnect: () => Promise<void>
  switchNetwork: (network: NetworkType) => Promise<void>

  // Transaction methods
  signPsbt: (
    psbt: string,
    finalize?: boolean,
    broadcast?: boolean,
  ) => Promise<{ signedPsbtBase64: string; txid?: string }>
  sendBTC: (to: string, amount: number) => Promise<string>
  getUtxos: () => Promise<any[]>
  getBalance: () => Promise<number>

  // State
  isConnecting: boolean
  error: string | null

  // Lasereyes client
  client: LaserEyesClient | null
}

const LaserEyesWalletContext = createContext<LaserEyesWalletContextType | null>(null)

export function useLaserEyesWallet() {
  const context = useContext(LaserEyesWalletContext)
  if (!context) {
    throw new Error("useLaserEyesWallet must be used within LaserEyesWalletProvider")
  }
  return context
}

export const useLaserEyes = useLaserEyesWallet

export function LaserEyesWalletProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<LaserEyesClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [network, setNetwork] = useState<NetworkType>("mainnet")
  const [balance, setBalance] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installedWallets, setInstalledWallets] = useState<LaserEyesWalletType[]>([])

  // Initialize Lasereyes client
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stores = createStores()
      const config = createConfig({
        network: process.env.NEXT_PUBLIC_NETWORK === "testnet" ? "testnet" : "mainnet",
      })

      const laserEyesClient = new LaserEyesClient(stores, config)
      laserEyesClient.initialize()

      setClient(laserEyesClient)
      console.log("[brc20kit] ⚡ LaserEyes initialized")

      let lastLoggedState = { address: "", paymentAddress: "", balance: 0, provider: "" }

      const unsubscribe = stores.$store.subscribe((state) => {
        // Only log if something actually changed
        const hasChanged =
          state.address !== lastLoggedState.address ||
          state.paymentAddress !== lastLoggedState.paymentAddress ||
          state.balance !== lastLoggedState.balance ||
          state.provider !== lastLoggedState.provider

        if (hasChanged) {
          console.log("[brc20kit] 🔌 Wallet:", {
            connected: !!state.address,
            payment: state.paymentAddress?.substring(0, 8) + "...",
            balance: state.balance ? `${state.balance} sats` : "0",
            provider: state.provider,
          })

          lastLoggedState = {
            address: state.address,
            paymentAddress: state.paymentAddress,
            balance: state.balance,
            provider: state.provider,
          }
        }

        if (state.address) {
          setAddress(state.address)
          setConnected(true)
        } else {
          setAddress(null)
          setConnected(false)
        }

        if (state.paymentAddress) {
          setPaymentAddress(state.paymentAddress)
        } else {
          setPaymentAddress(null)
        }

        if (state.publicKey) {
          setPublicKey(state.publicKey)
        }

        if (state.balance !== undefined) {
          setBalance(state.balance)
        }

        if (state.provider) {
          setProvider(state.provider)
        }
      })

      // Subscribe to network changes
      const unsubscribeNetwork = stores.$network.subscribe((net) => {
        if (net !== network) {
          console.log("[brc20kit] 🌐 Network:", net)
          setNetwork(net)
        }
      })

      return () => {
        unsubscribe()
        unsubscribeNetwork()
      }
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        stringified: String(err),
      }
      console.error("[brc20kit] ❌ Failed to initialize LaserEyes:", errorDetails)
      setError("Failed to initialize wallet system")
    }
  }, [])

  // Detect installed wallets
  useEffect(() => {
    if (typeof window === "undefined") return

    const detectWallets = () => {
      const detected = LaserEyesWalletDetector.detectInstalledWallets()
      setInstalledWallets(detected)
    }

    // Initial detection
    detectWallets()

    // Retry detection for async wallet injection
    const timeouts = [500, 1000, 2000].map((delay) => setTimeout(detectWallets, delay))

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  const connect = async (walletType: LaserEyesWalletType) => {
    if (!client) {
      setError("Wallet system not initialized")
      return
    }

    console.log("[brc20kit] 🔌 Connecting to wallet:", walletType)
    setIsConnecting(true)
    setError(null)

    try {
      // Check if wallet is installed
      if (!LaserEyesWalletDetector.isWalletInstalled(walletType)) {
        throw new Error(`${WALLET_INFO[walletType].name} is not installed`)
      }

      // Convert wallet type to Lasereyes provider type
      const providerMap: Record<LaserEyesWalletType, string> = {
        unisat: "unisat",
        xverse: "xverse",
        okx: "okx",
        leather: "leather",
        phantom: "phantom",
        magiceden: "magiceden",
        orange: "orange",
        oyl: "oyl",
        wizz: "wizz",
        opnet: "opnet",
        sparrow: "sparrow",
      }

      await client.connect(providerMap[walletType] as any)
      setProvider(providerMap[walletType])

      // Request accounts
      const accounts = await client.requestAccounts()
      console.log("[brc20kit] ✅ Connected accounts:", accounts)

      // Get balance - try multiple methods
      try {
        const bal = await client.getBalance()
        const balanceNum = Number(bal)
        setBalance(balanceNum)
        console.log("[brc20kit] 💰 Balance from wallet:", balanceNum, "sats")
        
        // Also try to fetch from UTXOs as verification/fallback
        const utxoAddress = paymentAddress || address
        if (utxoAddress && balanceNum === 0) {
          try {
            console.log("[brc20kit] 🔍 Balance is 0, verifying with UTXO API...")
            const utxos = await UTXOProvider.getUTXOs(utxoAddress)
            const utxoBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
            if (utxoBalance > 0) {
              console.log("[brc20kit] 💰 Found balance via UTXO API:", utxoBalance, "sats")
              setBalance(utxoBalance)
            }
          } catch (utxoErr: any) {
            console.warn("[brc20kit] ⚠️ UTXO balance check failed:", utxoErr.message)
          }
        }
      } catch (balErr: any) {
        const errorDetails = {
          message: balErr?.message || "Unknown error",
          name: balErr?.name || "Error",
          stack: balErr?.stack,
        }
        console.warn("[brc20kit] ⚠️ Failed to fetch balance from wallet:", errorDetails)
        
        // Fallback: try UTXO API
        const utxoAddress = paymentAddress || address
        if (utxoAddress) {
          try {
            console.log("[brc20kit] 🔍 Falling back to UTXO API for balance...")
            const utxos = await UTXOProvider.getUTXOs(utxoAddress)
            const utxoBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
            setBalance(utxoBalance)
            console.log("[brc20kit] 💰 Balance from UTXO API:", utxoBalance, "sats")
          } catch (utxoErr: any) {
            console.warn("[brc20kit] ⚠️ UTXO balance fallback also failed:", utxoErr.message)
            setBalance(0)
          }
        } else {
          setBalance(0)
        }
      }
    } catch (err: any) {
      // Enhanced error logging for better diagnostics
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack || "No stack trace",
        code: err?.code,
        type: typeof err,
        stringified: String(err),
        fullError: err,
      }
      console.error("[brc20kit] ❌ Connection error:", errorDetails)
      console.error("[brc20kit] ❌ Error details:", {
        walletType,
        provider: providerMap[walletType],
        isInstalled: LaserEyesWalletDetector.isWalletInstalled(walletType),
        clientExists: !!client,
      })
      setError(err?.message || "Failed to connect wallet")
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    if (!client) return

    try {
      client.disconnect()
      setConnected(false)
      setAddress(null)
      setPaymentAddress(null)
      setPublicKey(null)
      setBalance(0)
      setProvider(null)
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        stringified: String(err),
      }
      console.error("[brc20kit] ❌ Disconnect error:", errorDetails)
    }
  }

  const switchNetwork = async (newNetwork: NetworkType) => {
    if (!client) {
      throw new Error("Wallet not connected")
    }

    try {
      await client.switchNetwork(newNetwork)
      setNetwork(newNetwork)
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        newNetwork,
        currentNetwork: network,
      }
      console.error("[brc20kit] ❌ Network switch error:", errorDetails)
      throw err
    }
  }

  const signPsbt = async (psbt: string, finalize = true, broadcast = false) => {
    if (!client) {
      throw new Error("Wallet not connected")
    }

    console.log("[brc20kit] 📝 Signing PSBT:", { broadcast, finalize, size: `${psbt.length} bytes` })

    try {
      const result = await client.signPsbt(psbt, finalize, false)

      let txid = result.txid
      const signedPsbtBase64 = result.psbt || result.signedPsbtBase64 || psbt

      if (!txid || txid === "") {
        try {
          const bitcoin = await import("bitcoinjs-lib")
          const psbtObj = bitcoin.Psbt.fromBase64(signedPsbtBase64)

          let tx: any = null

          // Try to extract transaction directly (PSBT already finalized by wallet)
          try {
            tx = psbtObj.extractTransaction()
            txid = tx.getId()
          } catch {
            // If extraction fails, try finalizing first
            psbtObj.finalizeAllInputs()
            tx = psbtObj.extractTransaction()
            txid = tx.getId()
          }

          if (broadcast && tx) {
            const txHex = tx.toHex()
            console.log("[brc20kit] 📡 Broadcasting:", txid.substring(0, 16) + "...")

            const apiUrl =
              network === "mainnet" ? "https://mempool.space/api/tx" : "https://mempool.space/testnet/api/tx"

            const response = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: txHex,
            })

            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Broadcast failed: ${errorText}`)
            }

            const broadcastTxid = await response.text()
            console.log("[brc20kit] ✅ Broadcast successful:", broadcastTxid)

            setTimeout(async () => {
              try {
                const checkUrl =
                  network === "mainnet"
                    ? `https://mempool.space/api/tx/${broadcastTxid}`
                    : `https://mempool.space/testnet/api/tx/${broadcastTxid}`

                const checkResponse = await fetch(checkUrl)
                if (checkResponse.ok) {
                  console.log("[brc20kit] ✅ Confirmed in mempool:", broadcastTxid.substring(0, 16) + "...")
                } else {
                  console.warn("[brc20kit] ⚠️ Not yet in mempool, may take a few seconds")
                }
              } catch (err) {
                console.warn("[brc20kit] ⚠️ Could not verify mempool status")
              }
            }, 2000)

            if (broadcastTxid && broadcastTxid !== txid) {
              txid = broadcastTxid
            }
          }
        } catch (extractError: any) {
          const errorDetails = {
            message: extractError?.message || "Unknown error",
            name: extractError?.name || "Error",
            stack: extractError?.stack,
            broadcast,
            hasTx: !!tx,
            hasTxid: !!txid,
          }
          console.error("[brc20kit] ❌ Failed to extract/broadcast:", errorDetails)
          if (broadcast) {
            throw new Error(`Failed to process transaction: ${extractError?.message || "Unknown error"}`)
          }
        }
      }

      console.log("[brc20kit] ✅ Signed:", txid ? txid.substring(0, 16) + "..." : "no txid")

      return {
        signedPsbtBase64,
        txid,
      }
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        psbtLength: psbt.length,
        broadcast,
        finalize,
      }
      console.error("[brc20kit] ❌ Signing failed:", errorDetails)
      throw err
    }
  }

  const sendBTC = async (to: string, amount: number) => {
    if (!client) {
      throw new Error("Wallet not connected")
    }

    try {
      const txId = await client.sendBTC(to, amount)
      return txId
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        to,
        amount,
      }
      console.error("[brc20kit] ❌ Send BTC error:", errorDetails)
      throw err
    }
  }

  const getUtxos = async () => {
    const utxoAddress = paymentAddress || address

    if (!client || !connected || !utxoAddress) {
      return []
    }

    try {
      try {
        const utxos = await client.getUtxos()

        if (utxos && utxos.length > 0) {
          console.log("[brc20kit] 📦", utxos.length, "UTXOs from wallet")
          return utxos.map((utxo: any) => ({
            txid: utxo.txid,
            vout: utxo.vout,
            value: utxo.value || utxo.satoshi || 0,
            scriptPubKey: utxo.scriptPubKey || utxo.scriptPk || "",
            address: utxo.address || utxoAddress,
          }))
        }
      } catch {
        // Fallback to API
      }

      const utxos = await UTXOProvider.getUTXOs(utxoAddress)
      console.log("[brc20kit] 📦", utxos.length, "UTXOs from API")
      return utxos
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        address: utxoAddress,
        connected,
        hasClient: !!client,
      }
      console.error("[brc20kit] ❌ UTXO fetch failed:", errorDetails)
      throw err
    }
  }

  const getBalanceMethod = async () => {
    if (!client || !connected) {
      return 0
    }

    try {
      const bal = await client.getBalance()
      const balanceNum = Number(bal)
      setBalance(balanceNum)
      return balanceNum
    } catch (err: any) {
      const errorDetails = {
        message: err?.message || "Unknown error",
        name: err?.name || "Error",
        stack: err?.stack,
        connected,
        hasClient: !!client,
      }
      console.error("[brc20kit] ❌ Failed to fetch balance:", errorDetails)
      throw err
    }
  }

  const allWallets: LaserEyesWalletType[] = [
    "unisat",
    "xverse",
    "okx",
    "leather",
    "phantom",
    "magiceden",
    "orange",
    "oyl",
    "wizz",
    "opnet",
  ]

  const value: LaserEyesWalletContextType = {
    connected,
    address,
    paymentAddress,
    publicKey,
    provider,
    network,
    balance,
    installedWallets,
    availableWallets: allWallets,
    connect,
    disconnect,
    switchNetwork,
    signPsbt,
    sendBTC,
    getUtxos,
    getBalance: getBalanceMethod,
    isConnecting,
    error,
    client,
  }

  return <LaserEyesWalletContext.Provider value={value}>{children}</LaserEyesWalletContext.Provider>
}
