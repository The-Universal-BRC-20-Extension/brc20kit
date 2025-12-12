# BRC-20 PSBT Transaction Flow Documentation

## Overview

This document explains the complete flow for creating, signing, and broadcasting BRC-20 mint transactions using Partially Signed Bitcoin Transactions (PSBTs) with bitcoinjs-lib and wallet integrations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Transaction Flow](#transaction-flow)
4. [PSBT Construction](#psbt-construction)
5. [Wallet Integration](#wallet-integration)
6. [Error Handling](#error-handling)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The BRC-20 minting system uses a modern PSBT-based architecture that separates transaction construction from signing:

\`\`\`
┌─────────────────┐
│   User Action   │
│  (Mint Button)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch UTXOs    │ ◄─── Simplicity SDK API
│  from Address   │      (via /api/utxos)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build PSBT     │ ◄─── bitcoinjs-lib
│  with BRC-20    │      BRC20PSBTBuilder
│  OP_RETURN      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sign PSBT      │ ◄─── Wallet (Xverse, Unisat, etc.)
│  with Wallet    │      WalletAdapter
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Finalize PSBT  │ ◄─── bitcoinjs-lib
│  Extract TX     │      psbt.finalizeAllInputs()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Broadcast TX   │ ◄─── mempool.space API
│  to Network     │      or Wallet broadcast
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Success!      │
│   TXID: xxxxx   │
└─────────────────┘
\`\`\`

---

## Key Components

### 1. **BRC20PSBTBuilder** (`lib/brc20-psbt-builder.ts`)

The core PSBT builder using bitcoinjs-lib to create valid Bitcoin transactions.

**Responsibilities:**
- Construct PSBTs with proper witnessUtxo data
- Add OP_RETURN outputs with BRC-20 JSON data
- Calculate fees and change outputs
- Validate UTXO data and addresses

**Key Methods:**
\`\`\`typescript
buildMintPSBT(
  utxos: UTXO[],
  recipientAddress: string,
  brc20Data: BRC20Operation,
  feeRate: number
): Promise<string>
\`\`\`

### 2. **ChainedMintBuilder** (`lib/brc20-mint.ts`)

Handles the orchestration of BRC-20 minting operations.

**Responsibilities:**
- Build the first PSBT with real UTXOs
- Create placeholder PSBTs for chained mints
- Coordinate between UTXO fetching and PSBT building

**Key Methods:**
\`\`\`typescript
buildChain(): Promise<ChainedMintResult>
buildFirstMint(): Promise<string>
\`\`\`

### 3. **UTXOProvider** (`lib/utxo-provider.ts`)

Fetches and manages UTXOs from the Simplicity SDK API.

**Responsibilities:**
- Fetch UTXOs from backend API route
- Preserve scriptPubKey data for PSBT construction
- Convert API format to internal TransactionInput format

**Key Methods:**
\`\`\`typescript
getUTXOs(address: string): Promise<TransactionInput[]>
\`\`\`

### 4. **WalletAdapter** (`lib/wallets.ts`)

Universal wallet integration supporting multiple Bitcoin wallets.

**Supported Wallets:**
- Xverse (Taproot P2TR)
- Unisat
- OKX Wallet
- Phantom (planned)
- Magic Eden (planned)

**Key Methods:**
\`\`\`typescript
signPsbt(psbtHex: string, psbtBase64: string): Promise<SignPsbtResult>
broadcastTx(txHex: string): Promise<BroadcastResult>
\`\`\`

### 5. **API Routes**

#### `/api/utxos` (`app/api/utxos/route.ts`)
Proxy route to fetch UTXOs from Simplicity SDK API.

**Request:**
\`\`\`json
{
  "address": "bc1q..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "txid": "abc123...",
      "vout": 0,
      "satoshi": 22300,
      "scriptPk": "0014...",
      "address": "bc1q...",
      "inscriptions": [],
      "height": 922664,
      "isSpent": false
    }
  ]
}
\`\`\`

---

## Transaction Flow

### Step-by-Step Process

#### 1. **User Initiates Mint**

User clicks "Mint" button in the UI (`app/mint/page.tsx`).

\`\`\`typescript
const handleMint = async () => {
  // Fetch user's UTXOs
  const utxos = await wallet.getUTXOs()
  
  // Build PSBT chain
  const chain = await builder.buildChain()
  
  // Sign and broadcast first PSBT
  const txid = await signAndBroadcast(chain.psbts[0])
}
\`\`\`

#### 2. **Fetch UTXOs**

`UTXOProvider.getUTXOs()` fetches available UTXOs:

\`\`\`typescript
// Call backend API
const response = await fetch("/api/utxos", {
  method: "POST",
  body: JSON.stringify({ address })
})

// Parse and convert to TransactionInput format
const utxos = response.data.map(utxo => ({
  txid: utxo.txid,
  vout: utxo.vout,
  value: utxo.satoshi,
  scriptPubKey: utxo.scriptPk // Critical for PSBT!
}))
\`\`\`

**Important:** The `scriptPk` field from the API is preserved as `scriptPubKey` because bitcoinjs-lib requires it to construct witnessUtxo data.

#### 3. **Build PSBT**

`BRC20PSBTBuilder.buildMintPSBT()` creates the PSBT:

\`\`\`typescript
const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })

// Add inputs with witnessUtxo
for (const utxo of utxos) {
  const scriptPubKey = Buffer.from(utxo.scriptPk, "hex")
  
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      script: Uint8Array.from(scriptPubKey), // Must be Uint8Array
      value: BigInt(utxo.value)              // Must be bigint
    }
  })
}

// Add OP_RETURN output with BRC-20 data
const brc20Json = JSON.stringify({
  p: "brc-20",
  op: "mint",
  tick: "ordi",
  amt: "1000"
})
const opReturnScript = bitcoin.script.compile([
  bitcoin.opcodes.OP_RETURN,
  Buffer.from(brc20Json, "utf8")
])

psbt.addOutput({
  script: opReturnScript,
  value: BigInt(0)
})

// Add change output
psbt.addOutput({
  address: recipientAddress,
  value: BigInt(changeAmount)
})

return psbt.toBase64()
\`\`\`

#### 4. **Sign PSBT with Wallet**

`XverseAdapter.signPsbt()` sends PSBT to wallet for signing:

\`\`\`typescript
const { request } = await import("sats-connect")

const response = await request("signPsbt", {
  psbt: psbtBase64,
  signInputs: {
    [connectedAddress]: [0] // Sign input 0
  },
  broadcast: false
})

const signedPsbtBase64 = response.result.psbt
\`\`\`

#### 5. **Finalize PSBT**

After wallet signs, finalize to extract transaction:

\`\`\`typescript
const psbt = bitcoin.Psbt.fromBase64(signedPsbtBase64)

// Finalize all inputs (add witness data to transaction)
psbt.finalizeAllInputs()

// Extract complete transaction
const tx = psbt.extractTransaction()
const txHex = tx.toHex()
\`\`\`

**Critical:** This step converts the PSBT into a complete Bitcoin transaction ready for broadcast.

#### 6. **Broadcast Transaction**

Send transaction hex to Bitcoin network:

\`\`\`typescript
const response = await fetch("https://mempool.space/api/tx", {
  method: "POST",
  body: txHex
})

const txid = await response.text()
// txid: "276bfea81630a98487bc800bbe2834d9a2b2bce5bace02012c6767c8f8c044d1"
\`\`\`

---

## PSBT Construction

### Understanding PSBTs

A PSBT is a partially complete Bitcoin transaction that can be passed between different parties for signing. It contains:

- **Transaction data**: inputs, outputs, locktime
- **Signing data**: witnessUtxo, redeemScript, witnessScript
- **Metadata**: input/output scripts, key paths

### WitnessUtxo Format

For Taproot (P2TR) transactions, wallets need `witnessUtxo` data:

\`\`\`typescript
witnessUtxo: {
  script: Uint8Array,  // scriptPubKey of the UTXO being spent
  value: bigint        // Amount in satoshis
}
\`\`\`

**Common Mistakes:**
- ❌ Using `Buffer` instead of `Uint8Array` for script
- ❌ Using `number` instead of `bigint` for value
- ❌ Missing `scriptPubKey` data from API response

### BRC-20 OP_RETURN Format

BRC-20 operations use OP_RETURN outputs:

\`\`\`typescript
// BRC-20 mint operation
{
  "p": "brc-20",      // Protocol
  "op": "mint",       // Operation
  "tick": "ordi",     // Token ticker (case-insensitive)
  "amt": "1000"       // Amount to mint (as string)
}

// Compiled into Bitcoin script
OP_RETURN <json_bytes>
\`\`\`

### Fee Calculation

Simple fee estimation:

\`\`\`typescript
const estimatedSize = 10 + (inputCount * 58) + (outputCount * 43) + opReturnSize
const fee = estimatedSize * feeRate // feeRate in sats/vbyte
\`\`\`

**Typical sizes:**
- P2TR input: ~58 vbytes
- P2TR output: ~43 vbytes
- OP_RETURN: ~(data_length + 10) vbytes

---

## Wallet Integration

### Xverse Wallet

**Special Requirements:**
- Uses `sats-connect` library
- Requires payment + ordinals addresses
- Returns signed PSBT (needs finalization)

**Connection:**
\`\`\`typescript
const response = await request("getAccounts", {
  purposes: ["payment", "ordinals"],
  message: "Connect to BRC-20 Kit"
})
\`\`\`

**Signing:**
\`\`\`typescript
const response = await request("signPsbt", {
  psbt: psbtBase64,
  signInputs: {
    [address]: [0] // Input indices to sign
  },
  broadcast: false
})
\`\`\`

### Unisat Wallet

**Direct window API:**
\`\`\`typescript
const signedPsbtHex = await window.unisat.signPsbt(psbtHex)
const txid = await window.unisat.pushTx(signedTxHex)
\`\`\`

### OKX Wallet

**Similar to Unisat:**
\`\`\`typescript
const signedPsbtHex = await window.okxwallet.bitcoin.signPsbt(psbtHex)
const txid = await window.okxwallet.bitcoin.pushTx(txHex)
\`\`\`

---

## Error Handling

### Common Errors and Solutions

#### 1. **"UTXO missing scriptPubKey"**

**Cause:** API response doesn't include `scriptPk` field.

**Solution:**
\`\`\`typescript
// Ensure API response includes scriptPk
{
  "txid": "...",
  "vout": 0,
  "satoshi": 22300,
  "scriptPk": "0014b4b47f0f..." // Required!
}
\`\`\`

#### 2. **"Invalid PSBT" from wallet**

**Cause:** Incorrect witnessUtxo format.

**Solution:**
\`\`\`typescript
// Use correct types
witnessUtxo: {
  script: Uint8Array.from(Buffer.from(scriptPk, "hex")),
  value: BigInt(satoshi)
}
\`\`\`

#### 3. **"Transaction missing input data" on broadcast**

**Cause:** PSBT not finalized after signing.

**Solution:**
\`\`\`typescript
const psbt = bitcoin.Psbt.fromBase64(signedPsbt)
psbt.finalizeAllInputs()  // Critical!
const tx = psbt.extractTransaction()
\`\`\`

#### 4. **"Insufficient funds"**

**Cause:** Not enough sats for fee + change (min 546 sats).

**Solution:**
\`\`\`typescript
const changeAmount = totalInput - fee
if (changeAmount < 546) {
  throw new Error("Insufficient funds for fee")
}
\`\`\`

---

## Troubleshooting

### Debug Utilities

#### 1. **PSBT Decoder**

\`\`\`typescript
import { BRC20PSBTBuilder } from "@/lib/brc20-psbt-builder"

const info = BRC20PSBTBuilder.decodePSBT(psbtBase64)
console.log("PSBT Info:", info)
// Output: { valid: true, inputCount: 1, outputs: [...] }
\`\`\`

#### 2. **UTXO Inspector**

\`\`\`typescript
console.log("UTXOs:", JSON.stringify(utxos, null, 2))
// Check for scriptPk field presence
\`\`\`

#### 3. **Transaction Hex Validator**

Use mempool.space to decode transaction:
\`\`\`
https://mempool.space/tx/push
\`\`\`

### Network Configuration

Ensure correct network settings:

\`\`\`typescript
// mainnet
const network = bitcoin.networks.bitcoin

// testnet
const network = bitcoin.networks.testnet
\`\`\`

### CORS Issues with Simplicity SDK

Add Origin header when calling SDK:

\`\`\`typescript
const response = await fetch(apiUrl, {
  headers: {
    "Origin": "https://v0.app",
    "X-Custom-Secret": apiSecret
  }
})
\`\`\`

---

## Best Practices

1. **Always preserve scriptPubKey data** through the entire UTXO → PSBT flow
2. **Use correct types** (Uint8Array, bigint) for bitcoinjs-lib
3. **Finalize PSBTs** after signing before broadcast
4. **Validate PSBTs** before sending to wallets
5. **Handle errors gracefully** with user-friendly messages
6. **Log strategically** for debugging without exposing sensitive data
7. **Test on testnet** before deploying to mainnet

---

## References

- [BIP 174: PSBT Standard](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki)
- [bitcoinjs-lib Documentation](https://github.com/bitcoinjs/bitcoinjs-lib)
- [BRC-20 Standard](https://domo-2.gitbook.io/brc-20-experiment/)
- [Taproot (P2TR) Explained](https://bitcoinops.org/en/topics/taproot/)
- [sats-connect Library](https://github.com/secretkeylabs/sats-connect)

---

## Changelog

**v1.0.0 (2025-01-08)**
- Initial documentation
- Complete PSBT flow using bitcoinjs-lib
- Xverse wallet integration with finalization
- Simplicity SDK API integration
