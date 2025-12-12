"use client"

import { type ReactNode, useState, useCallback, useEffect } from "react"
import { WalletContext, type WalletContextType } from "./wallet-provider"
import { WalletDetector, WalletFactory, type WalletType } from "./wallets"
import { UTXOProvider } from "./utxo-provider" // UTXO provider (uses Unisat API)

export function WalletProviderImplementation({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([])
  const [currentWalletType, setCurrentWalletType] = useState<WalletType | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleLaserEyesConnected = (event: CustomEvent) => {
      console.log("[brc20kit] LaserEyes connected event received:", event.detail)
      setAddress(event.detail.address)
      setNetwork(event.detail.network)
      setConnected(true)
      setCurrentWalletType(null) // LaserEyes is external to our adapter system
    }

    const handleLaserEyesDisconnected = () => {
      console.log("[brc20kit] LaserEyes disconnected event received")
      if (!currentWalletType) {
        // Only clear if not using a different wallet
        setConnected(false)
        setAddress(null)
        setPublicKey(null)
      }
    }

    window.addEventListener("lasereyes:connected" as any, handleLaserEyesConnected)
    window.addEventListener("lasereyes:disconnected" as any, handleLaserEyesDisconnected)

    // Check for existing LaserEyes connection on mount
    const laserEyesConnected = localStorage.getItem("lasereyes_connected")
    const laserEyesAddress = localStorage.getItem("lasereyes_address")
    const laserEyesNetwork = localStorage.getItem("lasereyes_network")

    if (laserEyesConnected && laserEyesAddress) {
      console.log("[brc20kit] Restoring LaserEyes connection state")
      setAddress(laserEyesAddress)
      setNetwork(laserEyesNetwork as "mainnet" | "testnet")
      setConnected(true)
    }

    return () => {
      window.removeEventListener("lasereyes:connected" as any, handleLaserEyesConnected)
      window.removeEventListener("lasereyes:disconnected" as any, handleLaserEyesDisconnected)
    }
  }, [currentWalletType])

  // Detect wallets on mount
  useEffect(() => {
    console.log("[brc20kit] WalletProvider mounting, starting wallet detection...")

    // Initial detection
    const detected = WalletDetector.detectInstalledWallets()
    setAvailableWallets(detected)

    // Set up retry detection
    WalletDetector.detectWithRetry((wallets) => {
      console.log("[brc20kit] Wallets detected via retry:", wallets)
      setAvailableWallets(wallets)
    })

    // Listen for wallet injection events
    const cleanup = WalletDetector.listenForWalletEvents((wallets) => {
      console.log("[brc20kit] Wallets detected via events:", wallets)
      setAvailableWallets(wallets)
    })

    return cleanup
  }, [])

  const connect = useCallback(
    async (walletType?: WalletType) => {
      console.log("[brc20kit] Connect called with wallet type:", walletType)
      setIsConnecting(true)
      setError(null)

      try {
        // If no wallet type specified, use first available
        const typeToConnect = walletType || availableWallets[0]

        if (!typeToConnect) {
          throw new Error("No wallet available. Please install a Bitcoin wallet extension.")
        }

        console.log("[brc20kit] Connecting to wallet:", typeToConnect)
        const adapter = WalletFactory.getAdapter(typeToConnect)

        if (!adapter.isInstalled()) {
          throw new Error(`${adapter.name} wallet is not installed`)
        }

        const result = await adapter.connect()
        console.log("[brc20kit] Wallet connected successfully:", result)

        setAddress(result.address)
        setPublicKey(result.publicKey)
        setNetwork(result.network)
        setConnected(true)
        setCurrentWalletType(typeToConnect)

        // Store connection in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("wallet_connected", typeToConnect)
          localStorage.setItem("wallet_address", result.address)
        }
      } catch (err: any) {
        console.error("[brc20kit] Wallet connection error:", err)
        setError(err.message || "Failed to connect wallet")
        setConnected(false)
      } finally {
        setIsConnecting(false)
      }
    },
    [availableWallets],
  )

  const disconnect = useCallback(async () => {
    console.log("[brc20kit] Disconnect called")

    try {
      if (currentWalletType) {
        const adapter = WalletFactory.getAdapter(currentWalletType)
        await adapter.disconnect()
      }
    } catch (err) {
      console.error("[brc20kit] Disconnect error:", err)
    }

    setConnected(false)
    setAddress(null)
    setPublicKey(null)
    setCurrentWalletType(null)
    setError(null)

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("wallet_connected")
      localStorage.removeItem("wallet_address")
    }
  }, [currentWalletType])

  const signPsbt = useCallback(
    async (psbtBase64: string, broadcast = false): Promise<{ signedPsbtBase64: string; txid?: string }> => {
      if (!currentWalletType) {
        throw new Error("No wallet connected")
      }

      const adapter = WalletFactory.getAdapter(currentWalletType)
      const psbtHex = Buffer.from(psbtBase64, "base64").toString("hex")

      const result = await adapter.signPsbt(psbtHex, psbtBase64)

      if (broadcast) {
        const txHex = result.signedPsbtHex
        const broadcastResult = await adapter.broadcastTx(txHex)
        return {
          signedPsbtBase64: result.signedPsbtBase64,
          txid: broadcastResult.txid,
        }
      }

      return { signedPsbtBase64: result.signedPsbtBase64 }
    },
    [currentWalletType],
  )

  const getUtxos = useCallback(async (): Promise<any[]> => {
    if (!address) {
      return []
    }

    try {
      const utxos = await UTXOProvider.getUTXOs(address)
      console.log("[brc20kit] Fetched UTXOs via wallet provider:", utxos.length)
      return utxos
    } catch (error) {
      console.error("[brc20kit] Failed to fetch UTXOs via wallet provider:", error)
      return []
    }
  }, [address])

  const getBalance = useCallback(async (): Promise<number> => {
    if (!currentWalletType) {
      return 0
    }

    try {
      const adapter = WalletFactory.getAdapter(currentWalletType)
      return await adapter.getBalance()
    } catch (err) {
      console.error("[brc20kit] Get balance error:", err)
      return 0
    }
  }, [currentWalletType])

  // Auto-reconnect on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWallet = localStorage.getItem("wallet_connected") as WalletType | null
      if (savedWallet && availableWallets.includes(savedWallet)) {
        console.log("[brc20kit] Auto-reconnecting to saved wallet:", savedWallet)
        connect(savedWallet).catch((err) => {
          console.error("[brc20kit] Auto-reconnect failed:", err)
          localStorage.removeItem("wallet_connected")
        })
      }
    }
  }, [availableWallets, connect])

  const contextValue: WalletContextType = {
    connected,
    address,
    publicKey,
    network,
    connect,
    disconnect,
    isConnecting,
    error,
    availableWallets,
    signPsbt,
    getUtxos,
    getBalance,
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}
