// Universal Wallet Adapter System - Consolidated
// Supports multiple Bitcoin wallets: Unisat, Xverse, OKX, and more

// ============================================================================
// Types and Interfaces
// ============================================================================

export type WalletType = "unisat" | "phantom" | "okx" | "xverse" | "magiceden" | "leather"

export interface WalletConnectionResult {
  address: string
  publicKey: string
  network: "mainnet" | "testnet"
}

export interface SignPsbtResult {
  signedPsbtHex: string
  signedPsbtBase64: string
}

export interface BroadcastResult {
  txid: string
}

// ============================================================================
// Base Wallet Adapter
// ============================================================================

/**
 * Universal Wallet Adapter Interface
 * All wallet implementations must conform to this interface
 */
export abstract class WalletAdapter {
  abstract readonly name: string
  abstract readonly type: WalletType
  abstract readonly icon: string

  abstract isInstalled(): boolean
  abstract connect(): Promise<WalletConnectionResult>
  abstract signPsbt(psbtHex: string, psbtBase64: string): Promise<SignPsbtResult>
  abstract broadcastTx(txHex: string): Promise<BroadcastResult>
  abstract getBalance(): Promise<number>
  abstract disconnect(): Promise<void>

  supportsTaproot(): boolean {
    return true
  }

  supportsPSBTv2(): boolean {
    return false
  }
}

// ============================================================================
// Unisat Wallet Adapter
// ============================================================================

export class UnisatAdapter extends WalletAdapter {
  readonly name = "Unisat"
  readonly type = "unisat" as const
  readonly icon = "/wallets/unisat.svg"

  private get unisat() {
    if (typeof window === "undefined") return null
    return (window as any).unisat
  }

  isInstalled(): boolean {
    return !!this.unisat
  }

  async connect(): Promise<WalletConnectionResult> {
    if (!this.unisat) {
      throw new Error("Unisat wallet not installed")
    }

    try {
      const accounts = await this.unisat.requestAccounts()
      const publicKey = await this.unisat.getPublicKey()
      const network = await this.unisat.getNetwork()

      return {
        address: accounts[0],
        publicKey,
        network: network === "livenet" ? "mainnet" : "testnet",
      }
    } catch (error: any) {
      throw new Error(`Unisat connection failed: ${error.message}`)
    }
  }

  async signPsbt(psbtHex: string, psbtBase64: string): Promise<SignPsbtResult> {
    if (!this.unisat) {
      throw new Error("Unisat wallet not installed")
    }

    try {
      const signedPsbtHex = await this.unisat.signPsbt(psbtHex)
      const signedPsbtBase64 = Buffer.from(signedPsbtHex, "hex").toString("base64")

      return {
        signedPsbtHex,
        signedPsbtBase64,
      }
    } catch (error: any) {
      throw new Error(`Unisat PSBT signing failed: ${error.message}`)
    }
  }

  async broadcastTx(txHex: string): Promise<BroadcastResult> {
    if (!this.unisat) {
      throw new Error("Unisat wallet not installed")
    }

    try {
      const txid = await this.unisat.pushTx(txHex)
      return { txid }
    } catch (error: any) {
      throw new Error(`Unisat broadcast failed: ${error.message}`)
    }
  }

  async getBalance(): Promise<number> {
    if (!this.unisat) {
      throw new Error("Unisat wallet not installed")
    }

    try {
      const balance = await this.unisat.getBalance()
      return balance.total || 0
    } catch (error: any) {
      throw new Error(`Unisat balance fetch failed: ${error.message}`)
    }
  }

  async disconnect(): Promise<void> {
    return Promise.resolve()
  }

  supportsTaproot(): boolean {
    return true
  }

  supportsPSBTv2(): boolean {
    return false
  }
}

// ============================================================================
// Xverse Wallet Adapter
// ============================================================================

export class XverseAdapter extends WalletAdapter {
  readonly name = "Xverse"
  readonly type = "xverse" as const
  readonly icon = "/wallets/xverse.svg"

  private connectedAddress: string | null = null
  private connectedPublicKey: string | null = null

  isInstalled(): boolean {
    if (typeof window === "undefined") return false
    return !!(window as any).XverseProviders || !!(window as any).BitcoinProvider
  }

  async connect(): Promise<WalletConnectionResult> {
    if (!this.isInstalled()) {
      throw new Error("Xverse wallet not installed")
    }

    try {
      const { request } = await import("sats-connect")

      const response = await request("getAccounts", {
        purposes: ["payment", "ordinals"],
        message: "Connect to BRC-20 Kit",
      })

      if (response.status === "success") {
        const paymentAddress = response.result.find((account: any) => account.purpose === "payment")
        const ordinalsAddress = response.result.find((account: any) => account.purpose === "ordinals")

        const address = paymentAddress?.address || ordinalsAddress?.address
        const publicKey = paymentAddress?.publicKey || ordinalsAddress?.publicKey

        if (!address || !publicKey) {
          throw new Error("Failed to get Xverse account details")
        }

        this.connectedAddress = address
        this.connectedPublicKey = publicKey

        console.log("[brc20kit] Xverse connected:", address)

        return {
          address,
          publicKey,
          network: "mainnet",
        }
      } else {
        throw new Error(response.error?.message || "Xverse connection rejected")
      }
    } catch (error: any) {
      console.error("[brc20kit] Xverse connection error:", error)
      throw new Error(`Xverse connection failed: ${error.message}`)
    }
  }

  async signPsbt(psbtHex: string, psbtBase64: string): Promise<SignPsbtResult> {
    if (!this.isInstalled()) {
      throw new Error("Xverse wallet not installed")
    }

    if (!this.connectedAddress) {
      throw new Error("Xverse wallet not connected. Please connect first.")
    }

    try {
      const { request } = await import("sats-connect")
      const bitcoin = await import("bitcoinjs-lib")

      console.log("[brc20kit] Requesting Xverse signature...")

      const response = await request("signPsbt", {
        psbt: psbtBase64,
        signInputs: {
          [this.connectedAddress]: [0],
        },
        broadcast: false,
      })

      if (response.status === "success") {
        const signedPsbtBase64 = response.result.psbt
        const signedPsbtHex = Buffer.from(signedPsbtBase64, "base64").toString("hex")

        console.log("[brc20kit] PSBT signed, finalizing...")

        try {
          const psbt = bitcoin.Psbt.fromBase64(signedPsbtBase64)
          psbt.finalizeAllInputs()

          const tx = psbt.extractTransaction()
          const finalTxHex = tx.toHex()

          console.log("[brc20kit] ✅ PSBT finalized successfully")

          return {
            signedPsbtHex: finalTxHex,
            signedPsbtBase64: Buffer.from(finalTxHex, "hex").toString("base64"),
          }
        } catch (finalizeError: any) {
          console.error("[brc20kit] ❌ PSBT finalization failed:", finalizeError.message)
          console.warn("[brc20kit] Using unfinalized PSBT (may fail on broadcast)")

          return {
            signedPsbtHex,
            signedPsbtBase64,
          }
        }
      } else {
        throw new Error(response.error?.message || "PSBT signing rejected")
      }
    } catch (error: any) {
      console.error("[brc20kit] Xverse signing error:", error.message)
      throw new Error(`Xverse PSBT signing failed: ${error.message}`)
    }
  }

  async broadcastTx(txHex: string): Promise<BroadcastResult> {
    try {
      const { config } = await import("./config")
      const apiUrl =
        config.network === "mainnet" ? "https://mempool.space/api/tx" : "https://mempool.space/testnet/api/tx"

      console.log("[brc20kit] Broadcasting transaction...")

      const response = await fetch(apiUrl, {
        method: "POST",
        body: txHex,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Broadcast failed: ${errorText}`)
      }

      const txid = await response.text()

      console.log("[brc20kit] ✅ Transaction broadcast successful:", txid)

      return { txid }
    } catch (error: any) {
      console.error("[brc20kit] Broadcast error:", error.message)
      throw new Error(`Xverse broadcast failed: ${error.message}`)
    }
  }

  async getBalance(): Promise<number> {
    if (!this.connectedAddress) {
      return 0
    }

    try {
      const { config } = await import("./config")
      const apiUrl =
        config.network === "mainnet"
          ? `https://mempool.space/api/address/${this.connectedAddress}`
          : `https://mempool.space/testnet/api/address/${this.connectedAddress}`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch balance")
      }

      const data = await response.json()
      return data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
    } catch (error: any) {
      console.error("[brc20kit] Xverse balance fetch error:", error)
      return 0
    }
  }

  async disconnect(): Promise<void> {
    this.connectedAddress = null
    this.connectedPublicKey = null
    console.log("[brc20kit] Xverse disconnected")
    return Promise.resolve()
  }

  supportsTaproot(): boolean {
    return true
  }
}

// ============================================================================
// OKX Wallet Adapter
// ============================================================================

export class OKXAdapter extends WalletAdapter {
  readonly name = "OKX Wallet"
  readonly type = "okx" as const
  readonly icon = "/wallets/okx.svg"

  private get okx() {
    if (typeof window === "undefined") return null
    return (window as any).okxwallet?.bitcoin
  }

  isInstalled(): boolean {
    return !!this.okx
  }

  async connect(): Promise<WalletConnectionResult> {
    if (!this.okx) {
      throw new Error("OKX Wallet not installed")
    }

    try {
      const result = await this.okx.connect()
      const publicKey = await this.okx.getPublicKey()

      return {
        address: result.address,
        publicKey,
        network: result.network || "testnet",
      }
    } catch (error: any) {
      throw new Error(`OKX connection failed: ${error.message}`)
    }
  }

  async signPsbt(psbtHex: string, psbtBase64: string): Promise<SignPsbtResult> {
    if (!this.okx) {
      throw new Error("OKX Wallet not installed")
    }

    try {
      const signedPsbtHex = await this.okx.signPsbt(psbtHex)
      const signedPsbtBase64 = Buffer.from(signedPsbtHex, "hex").toString("base64")

      return {
        signedPsbtHex,
        signedPsbtBase64,
      }
    } catch (error: any) {
      throw new Error(`OKX PSBT signing failed: ${error.message}`)
    }
  }

  async broadcastTx(txHex: string): Promise<BroadcastResult> {
    if (!this.okx) {
      throw new Error("OKX Wallet not installed")
    }

    try {
      const txid = await this.okx.pushTx(txHex)
      return { txid }
    } catch (error: any) {
      throw new Error(`OKX broadcast failed: ${error.message}`)
    }
  }

  async getBalance(): Promise<number> {
    if (!this.okx) {
      throw new Error("OKX Wallet not installed")
    }

    try {
      const balance = await this.okx.getBalance()
      return balance.total || 0
    } catch (error: any) {
      return 0
    }
  }

  async disconnect(): Promise<void> {
    if (this.okx?.disconnect) {
      await this.okx.disconnect()
    }
  }

  supportsTaproot(): boolean {
    return true
  }
}

// ============================================================================
// Wallet Factory
// ============================================================================

export class WalletFactory {
  private static adapters: Map<WalletType, WalletAdapter> = new Map()

  static getAdapter(type: WalletType): WalletAdapter {
    if (!this.adapters.has(type)) {
      const adapter = this.createAdapter(type)
      this.adapters.set(type, adapter)
    }

    return this.adapters.get(type)!
  }

  private static createAdapter(type: WalletType): WalletAdapter {
    switch (type) {
      case "unisat":
        return new UnisatAdapter()
      case "xverse":
        return new XverseAdapter()
      case "okx":
        return new OKXAdapter()
      case "phantom":
        throw new Error("Phantom adapter not yet implemented")
      case "magiceden":
        throw new Error("Magic Eden adapter not yet implemented")
      case "leather":
        throw new Error("Leather adapter not yet implemented")
      default:
        throw new Error(`Unknown wallet type: ${type}`)
    }
  }

  static getSupportedWallets(): WalletType[] {
    return ["unisat", "xverse", "okx"]
  }

  static clearCache(): void {
    this.adapters.clear()
  }
}

// ============================================================================
// Wallet Detector
// ============================================================================

export class WalletDetector {
  private static detectionAttempts = 0
  private static maxAttempts = 5
  private static detectionInterval = 500 // ms
  private static listeners: Set<(wallets: WalletType[]) => void> = new Set()

  /**
   * Check if a specific wallet type is installed
   * Performs a real-time check of the wallet's presence
   */
  static isWalletInstalled(type: WalletType): boolean {
    if (typeof window === "undefined") {
      return false
    }

    switch (type) {
      case "unisat":
        return !!(window as any).unisat
      case "phantom":
        return !!(window as any).phantom?.bitcoin
      case "okx":
        return !!(window as any).okxwallet?.bitcoin
      case "xverse":
        return !!(window as any).XverseProviders || !!(window as any).BitcoinProvider
      case "magiceden":
        return !!(window as any).magicEden?.bitcoin
      case "leather":
        return !!(window as any).LeatherProvider || !!(window as any).HiroWalletProvider
      default:
        return false
    }
  }

  /**
   * Detect installed wallets with retry logic for async wallet injection
   * Many wallet extensions inject their APIs asynchronously after page load
   */
  static detectInstalledWallets(): WalletType[] {
    const installed: WalletType[] = []

    if (typeof window === "undefined") {
      console.log("[brc20kit] Wallet detection skipped: not in browser environment")
      return installed
    }

    const walletChecks = [
      {
        type: "unisat" as WalletType,
        check: () => !!(window as any).unisat,
        paths: ["window.unisat"],
      },
      {
        type: "phantom" as WalletType,
        check: () => !!(window as any).phantom?.bitcoin,
        paths: ["window.phantom", "window.phantom.bitcoin"],
      },
      {
        type: "okx" as WalletType,
        check: () => !!(window as any).okxwallet?.bitcoin,
        paths: ["window.okxwallet", "window.okxwallet.bitcoin"],
      },
      {
        type: "xverse" as WalletType,
        check: () => !!(window as any).XverseProviders || !!(window as any).BitcoinProvider,
        paths: ["window.XverseProviders", "window.BitcoinProvider"],
      },
      {
        type: "magiceden" as WalletType,
        check: () => !!(window as any).magicEden?.bitcoin,
        paths: ["window.magicEden", "window.magicEden.bitcoin"],
      },
      {
        type: "leather" as WalletType,
        check: () => !!(window as any).LeatherProvider || !!(window as any).HiroWalletProvider,
        paths: ["window.LeatherProvider", "window.HiroWalletProvider"],
      },
    ]

    console.log("[brc20kit] Wallet detection (attempt #" + (this.detectionAttempts + 1) + ")")

    for (const wallet of walletChecks) {
      if (wallet.check()) {
        installed.push(wallet.type)
        console.log(`[brc20kit] ✓ ${wallet.type} detected`)
      }
    }

    if (installed.length > 0) {
      console.log(`[brc20kit] Found ${installed.length} wallet(s):`, installed)
    }

    return installed
  }

  static async detectWithRetry(
    onUpdate?: (wallets: WalletType[]) => void,
    maxAttempts = this.maxAttempts,
  ): Promise<WalletType[]> {
    console.log("[brc20kit] Starting wallet detection...")

    let lastDetected: WalletType[] = []

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      this.detectionAttempts = attempt

      const detected = this.detectInstalledWallets()

      if (detected.length > lastDetected.length) {
        console.log(`[brc20kit] New wallets detected on attempt ${attempt + 1}:`, detected)
        lastDetected = detected
        onUpdate?.(detected)
        this.notifyListeners(detected)
      }

      if (detected.length > 0 || attempt === maxAttempts - 1) {
        if (detected.length === 0) {
          console.log("[brc20kit] No wallets detected after all attempts")
        }
        return detected
      }

      await new Promise((resolve) => setTimeout(resolve, this.detectionInterval))
    }

    return lastDetected
  }

  /**
   * Listen for wallet injection events
   * Some wallets dispatch events when they're ready
   */
  static listenForWalletEvents(callback: (wallets: WalletType[]) => void): () => void {
    if (typeof window === "undefined") return () => {}

    console.log("[brc20kit] Setting up wallet injection event listeners...")

    const eventHandlers: Array<{ event: string; handler: EventListener }> = []

    const events = [
      "ethereum#initialized", // MetaMask-style
      "unisat#initialized",
      "xverse#initialized",
      "phantom#initialized",
      "okxwallet#initialized",
    ]

    const handleWalletEvent = (event: Event) => {
      console.log("[brc20kit] Wallet injection event detected:", event.type)
      const detected = this.detectInstalledWallets()
      callback(detected)
      this.notifyListeners(detected)
    }

    for (const event of events) {
      window.addEventListener(event, handleWalletEvent)
      eventHandlers.push({ event, handler: handleWalletEvent })
    }

    return () => {
      for (const { event, handler } of eventHandlers) {
        window.removeEventListener(event, handler)
      }
    }
  }

  /**
   * Subscribe to wallet detection updates
   */
  static subscribe(callback: (wallets: WalletType[]) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Notify all listeners of wallet changes
   */
  private static notifyListeners(wallets: WalletType[]): void {
    for (const listener of this.listeners) {
      listener(wallets)
    }
  }

  /**
   * Manual refresh of wallet detection
   * Useful for "Refresh" buttons in UI
   */
  static refresh(): WalletType[] {
    console.log("[brc20kit] Wallet detection refresh")
    this.detectionAttempts = 0
    const detected = this.detectInstalledWallets()
    this.notifyListeners(detected)
    return detected
  }

  /**
   * Get detailed wallet environment info for debugging
   */
  static getDebugInfo(): Record<string, any> {
    if (typeof window === "undefined") {
      return { environment: "server", wallets: [] }
    }

    return {
      environment: "browser",
      userAgent: navigator.userAgent,
      detectionAttempts: this.detectionAttempts,
      windowProperties: {
        unisat: typeof (window as any).unisat,
        phantom: typeof (window as any).phantom,
        okxwallet: typeof (window as any).okxwallet,
        XverseProviders: typeof (window as any).XverseProviders,
        BitcoinProvider: typeof (window as any).BitcoinProvider,
        magicEden: typeof (window as any).magicEden,
        LeatherProvider: typeof (window as any).LeatherProvider,
        HiroWalletProvider: typeof (window as any).HiroWalletProvider,
      },
      detectedWallets: this.detectInstalledWallets(),
    }
  }
}
