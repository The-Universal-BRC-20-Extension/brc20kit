// Core type definitions 

export interface WalletState {
  connected: boolean
  address: string | null
  publicKey: string | null
  network: "mainnet" | "testnet" | "regtest"
}

export interface WalletContextType extends WalletState {
  connect: (walletType?: string) => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  error: string | null
  availableWallets: string[]
  signPsbt: (psbtBase64: string, broadcast?: boolean) => Promise<{ signedPsbtBase64: string; txid?: string }>
  getUtxos: () => Promise<any[]>
  getBalance: () => Promise<number>
}

export interface BRC20Token {
  ticker: string
  balance: string
  maxSupply: string
  mintLimit: string | null
  deployHeight: number
  deployer: string
  holders: number
}

export interface BRC20Balance {
  ticker: string
  balance: string
  available: string
  transferable: string
}

export interface TokenOperation {
  id: string
  type: "deploy" | "mint" | "transfer"
  ticker: string
  amount: string
  from: string
  to: string | null
  txid: string
  status: "pending" | "confirmed" | "failed"
  timestamp: number
  blockHeight: number | null
}
