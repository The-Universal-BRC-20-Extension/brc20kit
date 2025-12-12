// PSBT Builder Type Definitions

export interface UTXO {
  txid: string
  vout: number
  value: number
  scriptPubKey: string
  address: string
  confirmations?: number
}

export interface PSBTInput {
  txid: string
  vout: number
  value: number
  scriptPubKey: string
  witnessUtxo?: {
    script: Buffer
    value: number
  }
  tapInternalKey?: Buffer
  tapMerkleRoot?: Buffer
}

export interface PSBTOutput {
  address: string
  value: number
  script?: Buffer
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface SignerCapabilities {
  canSignPSBT: boolean
  canDisplayAddress: boolean
  supportsMultisig: boolean
  supportedAddressTypes: string[]
}

export interface SignerConnection {
  type: SignerType
  connected: boolean
  deviceName?: string
  firmwareVersion?: string
}

export type SignerType =
  | "ledger"
  | "trezor"
  | "bitbox"
  | "coldcard"
  | "sparrow"
  | "electrum"
  | "bitcoin-core"
  | "custom"

export interface PSBTBuilderState {
  psbt: string | null
  selectedUTXOs: UTXO[]
  outputs: PSBTOutput[]
  feeRate: number
  totalFee: number
  changeAddress: string | null
  validationStatus: ValidationResult
}

export interface FeeEstimate {
  slow: number
  medium: number
  fast: number
}
