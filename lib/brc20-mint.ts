// Consolidated BRC-20 Minting Module
// Contains all chained minting logic, fee calculation, validation, and state management

import { BRC20Builder } from "@/lib/brc20-builder"
import type { UTXO } from "@/lib/psbt/types"
import { FeeService, type MempoolFeeRates } from "@/lib/fee-service"
import { BRC20PSBTBuilder } from "@/lib/brc20-psbt-builder"
import type { TransactionInput } from "@/lib/transaction-input/types"
import { PSBTSizeCalculator } from "@/lib/psbt-size-calculator"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ChainedMintParams {
  ticker: string
  amounts: string[]
  receiverAddress: string
  userUtxos: UTXO[]
  feeRate: number
  changeAddress: string
}

export interface ChainedPSBT {
  index: number
  psbtHex: string
  psbtBase64: string
  mintAmount: string
  fee: number
  dependsOn: number | null
  inputs: ChainInput[]
  outputs: ChainOutput[]
  receiverScriptPubKey?: string // ScriptPubKey of the receiver output (for chaining)
}

export interface ChainInput {
  txid: string
  vout: number
  value: number
  address: string
  fromPreviousMint: boolean
}

export interface ChainOutput {
  type: "op_return" | "inscription" | "receiver" | "commission" | "change"
  address?: string
  value: number
  data?: string
}

export interface ChainedMintResult {
  psbts: ChainedPSBT[]
  totalFee: number
  totalMints: number
  estimatedConfirmationTime: string
}

export interface FeeCalculationResult {
  totalFee: number
  changeAmount: number
  minimumUtxoValue: number
  feePerTx: number
  vsize: number
}

export interface ChainFeeResult {
  totalChainFees: number
  feesPerTx: number
  maxChainLength: number
  breakdown: {
    index: number
    fee: number
    cumulativeFee: number
  }[]
}

export interface DustHandlingResult {
  receiverAmount: number
  changeAmount: number
  changeOutput: boolean
  increasedFee?: number
  strategy: "add_to_receiver" | "increase_fee" | "keep_change"
}

export interface PSBTValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface MintChainStateData {
  completedMints: CompletedMint[]
  pendingMints: PendingMint[]
  currentPosition: number
  totalMints: number
  ticker: string
  receiverAddress: string
  feeRate: number
}

export interface CompletedMint {
  index: number
  txid: string
  amount: string
  confirmedAt: number | null
  blockHeight: number | null
}

export interface PendingMint {
  index: number
  psbt: ChainedPSBT
  amount: string
  status: "unsigned" | "signed" | "broadcasting" | "failed"
  error?: string
}

export interface RecoveryResult {
  resumePosition: number
  remainingChain: ChainedPSBT[]
  lastConfirmedTxid: string
  canResume: boolean
  message: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DUST_THRESHOLD = 330
// Note: Size calculations now use PSBTSizeCalculator for precise values
// These constants are kept for backward compatibility but should be replaced
const TAPROOT_INPUT_VSIZE = 57.5
const TAPROOT_OUTPUT_VSIZE = 43
const BASE_TX_SIZE = 10.5

const COMMISSION_WALLET_ADDRESS =
  process.env.COMMISSION_WALLET_ADDRESS || process.env.NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS
const COMMISSION_AMOUNT_BTC = process.env.COMMISSION_AMOUNT_BTC || process.env.NEXT_PUBLIC_COMMISSION_AMOUNT_BTC

// Commission is optional - if not set, no commission will be charged
// Convert commission amount to satoshis (default to 0 if not set)
const COMMISSION_AMOUNT_SATS =
  COMMISSION_WALLET_ADDRESS && COMMISSION_AMOUNT_BTC
    ? Math.floor(Number.parseFloat(COMMISSION_AMOUNT_BTC) * 100000000)
    : 0

if (COMMISSION_WALLET_ADDRESS && COMMISSION_AMOUNT_BTC) {
  if (COMMISSION_AMOUNT_SATS < 0) {
    throw new Error("COMMISSION_AMOUNT_BTC must be non-negative")
  }
  console.log(`[brc20kit] Commission system enabled: ${COMMISSION_AMOUNT_SATS} sats to ${COMMISSION_WALLET_ADDRESS}`)
} else if (COMMISSION_AMOUNT_BTC && !COMMISSION_WALLET_ADDRESS) {
  console.warn(
    "[brc20kit] ⚠️ COMMISSION_AMOUNT_BTC is set but COMMISSION_WALLET_ADDRESS is missing. Commission will be disabled.",
  )
} else {
  console.log("[brc20kit] Commission system disabled - not configured")
}

// ============================================================================
// FEE CALCULATOR
// ============================================================================

export class FeeCalculator {
  static async getRecommendedFeeRates(): Promise<{ high: number; medium: number; low: number; economy: number }> {
    const fees = await FeeService.getFeeRates()
    return {
      high: fees.fastestFee,
      medium: fees.halfHourFee,
      low: fees.hourFee,
      economy: fees.economyFee,
    }
  }

  static async getFeeRateForPriority(
    priority: "economy" | "low" | "medium" | "high" | "fastest",
  ): Promise<{ rate: number; estimatedTime: string }> {
    const recommendation = await FeeService.getRecommendation(priority)
    return {
      rate: recommendation.rate,
      estimatedTime: recommendation.estimatedTime,
    }
  }

  static async estimateConfirmationTime(feeRate: number): Promise<string> {
    const fees = await FeeService.getFeeRates()
    return FeeService.estimateConfirmationTime(feeRate, fees)
  }

  static async getMempoolCongestion(): Promise<{
    level: "low" | "medium" | "high" | "extreme"
    description: string
    fees: MempoolFeeRates | null
  }> {
    try {
      const fees = await FeeService.getFeeRates()
      const congestion = FeeService.getCongestionLevel(fees)
      return {
        ...congestion,
        fees,
      }
    } catch (error) {
      return {
        level: "medium",
        description: "Unable to fetch mempool data",
        fees: null,
      }
    }
  }

  static calculateSingleMintFees(
    fundingUtxoValue: number,
    feeRateSatsPerVbyte: number,
    ticker: string = "OPQT",
    amount: string = "1000",
  ): FeeCalculationResult {
    // Use precise size calculation
    // Assume P2TR input (most common) - can be improved with actual UTXO detection
    const hasCommission = COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS !== undefined

    // Build inputs array for size calculation
    const inputs = [
      {
        address: undefined, // Will use scriptPubKey fallback
        scriptPubKey: "5120" + "0".repeat(64), // Placeholder P2TR scriptPubKey
      },
    ]

    const totalVsize = PSBTSizeCalculator.calculateFirstPSBTSize({
      inputs,
      ticker,
      amount,
      hasCommission,
      commissionAddress: hasCommission ? COMMISSION_WALLET_ADDRESS : undefined,
      commissionScriptPubKey: undefined, // Will use address-based detection
    })

    // Add 5% safety margin to fee calculation
    const totalFee = Math.ceil(totalVsize * feeRateSatsPerVbyte * 1.05)

    // Calculate change: input - commission - network fee
    const changeAmount = fundingUtxoValue - COMMISSION_AMOUNT_SATS - totalFee

    // Minimum required: commission + network fee + dust for change
    const minimumUtxoValue = COMMISSION_AMOUNT_SATS + totalFee + DUST_THRESHOLD

    return {
      totalFee,
      changeAmount,
      minimumUtxoValue,
      feePerTx: totalFee,
      vsize: totalVsize,
    }
  }

  static calculateChainFees(
    initialUtxoValue: number,
    chainLength: number,
    feeRate: number,
    ticker: string = "OPQT",
    amount: string = "1000",
    inputType: "P2WPKH" | "P2TR" = "P2TR",
  ): ChainFeeResult {
    if (chainLength < 1 || chainLength > 25) {
      throw new Error("Chain length must be between 1 and 25")
    }

    const hasCommission = COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS !== undefined

    // Calculate first transaction size with precise calculator
    // Assume P2TR input (most common) - can be improved with actual UTXO detection
    const firstInputs = [
      {
        address: undefined, // Will use scriptPubKey fallback
        scriptPubKey: inputType === "P2TR" ? "5120" + "0".repeat(64) : "0014" + "0".repeat(40), // Placeholder
      },
    ]

    const firstTxVsize = PSBTSizeCalculator.calculateFirstPSBTSize({
      inputs: firstInputs,
      ticker,
      amount,
      hasCommission,
      commissionAddress: hasCommission ? COMMISSION_WALLET_ADDRESS : undefined,
      commissionScriptPubKey: undefined, // Will use address-based detection
    })

    // Add 5% safety margin to fee calculation
    const firstTxFee = Math.ceil(firstTxVsize * feeRate * 1.05)

    // Calculate subsequent transaction size (chained PSBT)
    const chainedTxVsize = PSBTSizeCalculator.calculateChainedPSBTSize({
      inputType,
      ticker,
      amount,
    })

    // Add 5% safety margin to chained transaction fees
    const chainedTxFee = Math.ceil(chainedTxVsize * feeRate * 1.05)

    // Total fees: first tx fee + commission + subsequent tx fees
    const totalNetworkFees = firstTxFee + chainedTxFee * (chainLength - 1)
    const totalCommissionFees = COMMISSION_AMOUNT_SATS // Only first mint pays commission
    const totalChainFees = totalNetworkFees + totalCommissionFees

    // Required funding: total fees + minimum dust for final change
    const requiredFunding = totalChainFees + DUST_THRESHOLD

    if (initialUtxoValue < requiredFunding) {
      throw new Error(
        `Insufficient funds for chain. Need ${requiredFunding} sats (${totalNetworkFees} network fees + ${totalCommissionFees} commission + ${DUST_THRESHOLD} dust), have ${initialUtxoValue} sats`,
      )
    }

    const breakdown = []
    let cumulativeFee = 0

    for (let i = 0; i < chainLength; i++) {
      const fee = i === 0 ? firstTxFee + COMMISSION_AMOUNT_SATS : chainedTxFee
      cumulativeFee += fee
      breakdown.push({ index: i, fee, cumulativeFee })
    }

    return {
      totalChainFees,
      feesPerTx: chainedTxFee,
      maxChainLength: Math.min(
        25,
        Math.floor((initialUtxoValue - firstTxFee - COMMISSION_AMOUNT_SATS) / (DUST_THRESHOLD + chainedTxFee)),
      ),
      breakdown,
    }
  }

  static handleChangeOutput(changeAmount: number): { changeOutput: boolean; increasedFee?: number } {
    if (changeAmount < DUST_THRESHOLD) {
      // If change is below dust threshold, add it to network fee
      return {
        changeOutput: false,
        increasedFee: changeAmount,
      }
    }

    return {
      changeOutput: true,
    }
  }

  static validateFee(fee: number, totalInput: number): { valid: boolean; error?: string; warning?: string } {
    if (fee <= 0) {
      return { valid: false, error: "Fee must be positive" }
    }

    if (fee < 1000) {
      return { valid: true, warning: "Fee may be too low for timely confirmation" }
    }

    if (fee > totalInput * 0.5) {
      return { valid: false, error: "Fee exceeds 50% of input value" }
    }

    if (fee > totalInput * 0.1) {
      return { valid: true, warning: "Fee is more than 10% of input value" }
    }

    return { valid: true }
  }
}

// ============================================================================
// PSBT VALIDATOR
// ============================================================================

export class PSBTValidator {
  static validatePSBTStructure(psbt: ChainedPSBT): PSBTValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // First mint can have 2 outputs (OP_RETURN, Change) or 3 outputs (OP_RETURN, Commission, Change)
    // Subsequent mints have 2 outputs: OP_RETURN, Change
    const isFirstMint = psbt.index === 0

    // Check if commission output exists in the PSBT
    const commissionOutput = psbt.outputs.find((o) => o.type === "commission")
    const hasCommission = !!commissionOutput

    // Expected outputs: OP_RETURN + (Commission?) + Change
    const expectedOutputs = isFirstMint ? (hasCommission ? 3 : 2) : 2

    if (psbt.outputs.length !== expectedOutputs) {
      errors.push(`PSBT must have exactly ${expectedOutputs} outputs (found ${psbt.outputs.length})`)
    }

    const opReturnOutput = psbt.outputs[0]
    if (!opReturnOutput || opReturnOutput.type !== "op_return") {
      errors.push("Output 0 must be OP_RETURN inscription")
    } else if (opReturnOutput.value !== 0) {
      errors.push("Output 0 must have zero value")
    }

    // Validate commission output if present
    if (hasCommission) {
      if (COMMISSION_AMOUNT_SATS > 0 && commissionOutput!.value !== COMMISSION_AMOUNT_SATS) {
        errors.push(`Commission output must be ${COMMISSION_AMOUNT_SATS} sats (got ${commissionOutput!.value})`)
      }

      if (COMMISSION_WALLET_ADDRESS && commissionOutput!.address !== COMMISSION_WALLET_ADDRESS) {
        errors.push(`Commission must go to ${COMMISSION_WALLET_ADDRESS}`)
      }
    }

    // FIX: Change output is ALWAYS at index 1 in actual transaction
    // Metadata array may have different ordering, but actual transaction is:
    // [OP_RETURN (0), Change (1), Commission? (2)]
    // So we find change by type, not by index
    const changeOutput = psbt.outputs.find((o) => o.type === "change")

    if (!changeOutput) {
      errors.push(`Change output is missing`)
    } else {
      if (changeOutput.value < DUST_THRESHOLD) {
        errors.push(`Change output below dust limit (${DUST_THRESHOLD} sats, got ${changeOutput.value})`)
      }
    }

    const totalInput = psbt.inputs.reduce((sum, inp) => sum + inp.value, 0)
    const totalOutput = psbt.outputs.reduce((sum, out) => sum + out.value, 0)
    const fee = totalInput - totalOutput

    if (fee <= 0) {
      errors.push("Fee must be positive (outputs exceed inputs)")
    }

    // For small UTXOs (under 50k sats), allow higher fee percentages since we're working with dust-level amounts
    // This is common in chained minting where each transaction creates a small change output for the next mint
    const feePercentage = fee / totalInput
    const isSmallUtxo = totalInput < 50000 // Less than 50k sats
    const maxFeePercentage = isSmallUtxo ? 0.8 : 0.5 // Allow up to 80% for small UTXOs, 50% for larger ones

    if (feePercentage > maxFeePercentage) {
      errors.push(`Fee exceeds ${maxFeePercentage * 100}% of input value - outside reasonable bounds`)
    }

    if (fee < 1000 && !isSmallUtxo) {
      warnings.push("Fee may be too low for timely confirmation")
    }

    if (psbt.inputs.length === 0) {
      errors.push("PSBT must have at least one input")
    }

    for (let i = 0; i < psbt.inputs.length; i++) {
      const input = psbt.inputs[i]

      if (input.value <= 0) {
        errors.push(`Input ${i} has invalid value: ${input.value}`)
      }

      if (!input.txid || input.txid.length !== 64) {
        if (!input.txid.startsWith("pending_")) {
          errors.push(`Input ${i} has invalid txid format`)
        }
      }

      if (input.vout < 0) {
        errors.push(`Input ${i} has invalid vout: ${input.vout}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static validateChainConsistency(psbts: ChainedPSBT[]): PSBTValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (psbts.length === 0) {
      errors.push("Chain must have at least one PSBT")
      return { valid: false, errors, warnings }
    }

    if (psbts.length > 25) {
      errors.push("Chain exceeds maximum length of 25 PSBTs")
    }

    const firstPsbt = psbts[0]
    if (firstPsbt.dependsOn !== null) {
      errors.push("First PSBT should not depend on any previous PSBT")
    }

    for (let i = 1; i < psbts.length; i++) {
      const psbt = psbts[i]

      if (psbt.dependsOn !== i - 1) {
        errors.push(`PSBT ${i} has incorrect dependency. Expected ${i - 1}, got ${psbt.dependsOn}`)
      }

      const hasChainedInput = psbt.inputs.some((inp) => inp.fromPreviousMint)
      if (!hasChainedInput) {
        errors.push(`PSBT ${i} does not have input from previous mint`)
      }

      const previousPsbt = psbts[i - 1]
      const previousReceiverOutput = previousPsbt.outputs.find((o) => o.type === "change") // Changed from receiver to change
      const chainedInput = psbt.inputs.find((inp) => inp.fromPreviousMint)

      if (previousReceiverOutput && chainedInput) {
        if (chainedInput.value !== previousReceiverOutput.value) {
          errors.push(
            `PSBT ${i} input value (${chainedInput.value}) does not match previous change output (${previousReceiverOutput.value})`,
          )
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static validateInscriptionData(data: string, expectedTicker: string, expectedAmount: string): PSBTValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const hexData = data.replace(/^6a[0-9a-f]{2}/, "")
      const jsonString = Buffer.from(hexData, "hex").toString("utf8")
      const inscription = JSON.parse(jsonString)

      if (inscription.p !== "brc-20") {
        errors.push(`Invalid protocol: expected "brc-20", got "${inscription.p}"`)
      }

      if (inscription.op !== "mint") {
        errors.push(`Invalid operation: expected "mint", got "${inscription.op}"`)
      }

      if (inscription.tick !== expectedTicker.toLowerCase()) {
        errors.push(`Ticker mismatch: expected "${expectedTicker}", got "${inscription.tick}"`)
      }

      if (inscription.amt !== expectedAmount) {
        warnings.push(`Amount mismatch: expected "${expectedAmount}", got "${inscription.amt}"`)
      }
    } catch (error) {
      errors.push(`Failed to parse inscription data: ${error}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

// ============================================================================
// MINT CHAIN STATE
// ============================================================================

export class MintChainState {
  private state: MintChainStateData

  constructor(initialState?: Partial<MintChainStateData>) {
    this.state = {
      completedMints: [],
      pendingMints: [],
      currentPosition: 0,
      totalMints: 0,
      ticker: "",
      receiverAddress: "",
      feeRate: 1,
      ...initialState,
    }
  }

  initializeChain(params: {
    totalMints: number
    ticker: string
    receiverAddress: string
    feeRate: number
    psbts: ChainedPSBT[]
  }): void {
    this.state = {
      completedMints: [],
      pendingMints: params.psbts.map((psbt) => ({
        index: psbt.index,
        psbt,
        amount: psbt.mintAmount,
        status: "unsigned",
      })),
      currentPosition: 0,
      totalMints: params.totalMints,
      ticker: params.ticker,
      receiverAddress: params.receiverAddress,
      feeRate: params.feeRate,
    }
  }

  completeMint(index: number, txid: string, blockHeight?: number): void {
    const pendingIndex = this.state.pendingMints.findIndex((m) => m.index === index)

    if (pendingIndex === -1) {
      throw new Error(`No pending mint found at index ${index}`)
    }

    const pending = this.state.pendingMints[pendingIndex]

    this.state.completedMints.push({
      index,
      txid,
      amount: pending.amount,
      confirmedAt: Date.now(),
      blockHeight: blockHeight || null,
    })

    this.state.pendingMints.splice(pendingIndex, 1)

    if (index === this.state.currentPosition) {
      this.state.currentPosition++
    }
  }

  failMint(index: number, error: string): void {
    const pendingIndex = this.state.pendingMints.findIndex((m) => m.index === index)

    if (pendingIndex !== -1) {
      this.state.pendingMints[pendingIndex].status = "failed"
      this.state.pendingMints[pendingIndex].error = error
    }
  }

  updateMintStatus(index: number, status: PendingMint["status"]): void {
    const pending = this.state.pendingMints.find((m) => m.index === index)

    if (pending) {
      pending.status = status
    }
  }

  recoverFromInterruption(lastConfirmedTxid?: string): RecoveryResult {
    if (!lastConfirmedTxid && this.state.completedMints.length > 0) {
      const lastCompleted = this.state.completedMints[this.state.completedMints.length - 1]
      lastConfirmedTxid = lastCompleted.txid
    }

    if (!lastConfirmedTxid) {
      return {
        resumePosition: 0,
        remainingChain: this.state.pendingMints.map((p) => p.psbt),
        lastConfirmedTxid: "",
        canResume: true,
        message: "Starting chain from beginning",
      }
    }

    const position = this.state.completedMints.findIndex((m) => m.txid === lastConfirmedTxid)

    if (position === -1) {
      return {
        resumePosition: 0,
        remainingChain: [],
        lastConfirmedTxid: lastConfirmedTxid,
        canResume: false,
        message: "Transaction ID not found in completed mints",
      }
    }

    const resumePosition = position + 1
    const remainingPending = this.state.pendingMints.filter((p) => p.index >= resumePosition)

    return {
      resumePosition,
      remainingChain: remainingPending.map((p) => p.psbt),
      lastConfirmedTxid,
      canResume: remainingPending.length > 0,
      message: `Resuming from position ${resumePosition}. ${remainingPending.length} mints remaining.`,
    }
  }

  getProgress(): {
    completed: number
    pending: number
    failed: number
    total: number
    percentComplete: number
  } {
    const failed = this.state.pendingMints.filter((m) => m.status === "failed").length

    return {
      completed: this.state.completedMints.length,
      pending: this.state.pendingMints.length - failed,
      failed,
      total: this.state.totalMints,
      percentComplete: (this.state.completedMints.length / this.state.totalMints) * 100,
    }
  }

  getNextMint(): PendingMint | null {
    const next = this.state.pendingMints.find((m) => m.status === "unsigned" || m.status === "failed")
    return next || null
  }

  getCompletedMints(): CompletedMint[] {
    return [...this.state.completedMints]
  }

  getPendingMints(): PendingMint[] {
    return [...this.state.pendingMints]
  }

  isComplete(): boolean {
    return this.state.completedMints.length === this.state.totalMints
  }

  exportState(): MintChainStateData {
    return { ...this.state }
  }

  importState(state: MintChainStateData): void {
    this.state = { ...state }
  }

  reset(): void {
    this.state = {
      completedMints: [],
      pendingMints: [],
      currentPosition: 0,
      totalMints: 0,
      ticker: "",
      receiverAddress: "",
      feeRate: 1,
    }
  }
}

// ============================================================================
// CHAINED MINT BUILDER
// ============================================================================

export class ChainedMintBuilder {
  static async buildChain(params: ChainedMintParams): Promise<ChainedMintResult> {
    const { ticker, amounts, receiverAddress, userUtxos, feeRate, changeAddress } = params

    console.log("[brc20kit] 🔨 ==================== BUILDING MINT CHAIN ====================")
    console.log("[brc20kit] 📋 Chain Parameters:")
    console.log("[brc20kit]   - Ticker:", ticker)
    console.log("[brc20kit]   - Total mints:", amounts.length)
    console.log("[brc20kit]   - Amounts:", amounts)
    console.log("[brc20kit]   - Receiver:", receiverAddress)
    console.log("[brc20kit]   - Fee rate:", feeRate, "sat/vB")
    console.log("[brc20kit]   - Commission:", COMMISSION_AMOUNT_SATS, "sats to", COMMISSION_WALLET_ADDRESS)
    console.log("[brc20kit]   - Available UTXOs:", userUtxos.length)
    console.log(
      "[brc20kit]   - Total UTXO value:",
      userUtxos.reduce((sum, u) => sum + u.value, 0),
      "sats",
    )

    this.validateChainParams(params)

    const psbts: ChainedPSBT[] = []
    const totalMints = amounts.length
    const totalInput = userUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
    const feeResult = FeeCalculator.calculateChainFees(totalInput, totalMints, feeRate)
    const totalFee = feeResult.totalChainFees

    console.log("[brc20kit] 💰 Fee Calculation:")
    console.log("[brc20kit]   - Total chain fees:", totalFee, "sats")
    console.log("[brc20kit]   - Network fees:", totalFee - COMMISSION_AMOUNT_SATS, "sats")
    console.log("[brc20kit]   - Commission:", COMMISSION_AMOUNT_SATS, "sats")
    console.log("[brc20kit]   - Max chain length:", feeResult.maxChainLength)

    const requiredAmount = totalFee + DUST_THRESHOLD
    const selectedUtxos = this.selectUTXOsForChain(userUtxos, requiredAmount)

    console.log("[brc20kit] 🎯 Selected UTXOs:")
    selectedUtxos.forEach((utxo, i) => {
      console.log(`[brc20kit]   ${i + 1}. ${utxo.txid}:${utxo.vout} - ${utxo.value} sats`)
    })

    console.log("[brc20kit] 🔨 Building PSBT #0 (first mint with commission)...")
    const firstPsbt = await this.buildFirstMint({
      ticker,
      amount: amounts[0],
      receiverAddress,
      userUtxos: selectedUtxos,
      feeRate,
      changeAddress,
    })

    const firstValidation = PSBTValidator.validatePSBTStructure(firstPsbt)
    if (!firstValidation.valid) {
      console.error("[brc20kit] ❌ First PSBT validation failed:", firstValidation.errors)
      throw new Error(`First PSBT validation failed: ${firstValidation.errors.join(", ")}`)
    }

    console.log("[brc20kit] ✅ PSBT #0 built successfully:")
    console.log("[brc20kit]   - Mint amount:", firstPsbt.amount, ticker)
    console.log("[brc20kit]   - Fee:", firstPsbt.fee, "sats")
    console.log("[brc20kit]   - Inputs:", firstPsbt.inputs.length)
    console.log("[brc20kit]   - Outputs:", firstPsbt.outputs.length)
    firstPsbt.outputs.forEach((out, i) => {
      console.log(`[brc20kit]     Output ${i}: ${out.type} - ${out.value} sats ${out.address ? `(${out.address})` : ""}`)
    })

    psbts.push(firstPsbt)

    for (let i = 1; i < totalMints; i++) {
      console.log(`[brc20kit] 🔗 Building chained PSBT #${i}...`)
      const previousPsbt = psbts[i - 1]

      const chainedPsbt = this.buildChainedMint({
        index: i,
        ticker,
        amount: amounts[i],
        receiverAddress,
        previousPsbt,
        feeRate,
        changeAddress,
        isLast: i === totalMints - 1,
      })

      const validation = PSBTValidator.validatePSBTStructure(chainedPsbt)
      if (!validation.valid) {
        console.error(`[brc20kit] ❌ PSBT ${i} validation failed:`, validation.errors)
        throw new Error(`PSBT ${i} validation failed: ${validation.errors.join(", ")}`)
      }

      console.log(`[brc20kit] ✅ PSBT #${i} built successfully:`)
      console.log(`[brc20kit]   - Depends on: PSBT #${chainedPsbt.dependsOn}`)
      console.log(`[brc20kit]   - Mint amount: ${chainedPsbt.amount} ${ticker}`)
      console.log(`[brc20kit]   - Fee: ${chainedPsbt.fee} sats`)
      console.log(`[brc20kit]   - Input value: ${chainedPsbt.inputs[0].value} sats`)
      console.log(`[brc20kit]   - Outputs:`)
      chainedPsbt.outputs.forEach((out, j) => {
        console.log(`[brc20kit]     Output ${j}: ${out.type} - ${out.value} sats ${out.address ? `(${out.address})` : ""}`)
      })

      psbts.push(chainedPsbt)
    }

    const chainValidation = PSBTValidator.validateChainConsistency(psbts)
    if (!chainValidation.valid) {
      console.error("[brc20kit] ❌ Chain validation failed:", chainValidation.errors)
      throw new Error(`Chain validation failed: ${chainValidation.errors.join(", ")}`)
    }

    console.log("[brc20kit] ✅ ==================== CHAIN BUILD COMPLETE ====================")
    console.log("[brc20kit] 📊 Chain Summary:")
    console.log("[brc20kit]   - Total PSBTs:", psbts.length)
    console.log("[brc20kit]   - Total fees:", totalFee, "sats")
    console.log(
      "[brc20kit]   - Total amount:",
      amounts.reduce((sum, amt) => sum + Number(amt), 0),
      ticker,
    )

    return {
      psbts,
      totalFee,
      totalMints,
      estimatedConfirmationTime: await FeeCalculator.estimateConfirmationTime(feeRate),
    }
  }

  private static async buildFirstMint(params: {
    ticker: string
    amount: string
    receiverAddress: string
    userUtxos: TransactionInput[]
    feeRate: number
    changeAddress: string
  }): Promise<ChainedPSBT> {
    console.log(`[brc20kit] 🔨 Constructing first mint PSBT:`)
    console.log(`[brc20kit]   - Ticker: ${params.ticker}`)
    console.log(`[brc20kit]   - Amount: ${params.amount}`)
    console.log(`[brc20kit]   - Receiver: ${params.receiverAddress}`)

    const totalInput = params.userUtxos.reduce((sum, utxo) => sum + utxo.value, 0)

    // Use precise size calculation
    const hasCommission = COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS !== undefined
    const inputsForSize = params.userUtxos.map((utxo) => ({
      address: utxo.address,
      scriptPubKey: utxo.scriptPubKey,
    }))

    const estimatedSize = PSBTSizeCalculator.calculateFirstPSBTSize({
      inputs: inputsForSize,
      ticker: params.ticker,
      amount: params.amount,
      hasCommission,
      commissionAddress: hasCommission ? COMMISSION_WALLET_ADDRESS : undefined,
      commissionScriptPubKey: undefined, // Will use address-based detection
    })

    const estimatedFee = Math.ceil(estimatedSize * params.feeRate)

    console.log(
      `[brc20kit]   - Calculated network fee: ${estimatedFee} sats (${estimatedSize} vB × ${params.feeRate} sat/vB)`,
    )
    if (COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS) {
      console.log(`[brc20kit]   - Commission: ${COMMISSION_AMOUNT_SATS} sats`)
    }

    // Calculate change: input - commission - network fee
    const changeOutput = totalInput - COMMISSION_AMOUNT_SATS - estimatedFee

    if (COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS) {
      console.log(`[brc20kit]   - Commission output: ${COMMISSION_AMOUNT_SATS} sats to ${COMMISSION_WALLET_ADDRESS}`)
    }
    console.log(`[brc20kit]   - Change output: ${changeOutput} sats`)
    console.log(`[brc20kit]   - Calculation: ${totalInput} - ${COMMISSION_AMOUNT_SATS} - ${estimatedFee} = ${changeOutput}`)

    if (changeOutput < DUST_THRESHOLD) {
      const requiredAmount = COMMISSION_AMOUNT_SATS + estimatedFee + DUST_THRESHOLD
      throw new Error(`Insufficient funds. Need ${requiredAmount} sats, have ${totalInput} sats`)
    }

    const mintJSON = BRC20Builder.createMintJSON({ ticker: params.ticker, amount: params.amount })
    const opReturnData = this.createOpReturnHex(mintJSON)

    const utxosForPsbt = params.userUtxos.map((utxo) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      scriptPk: utxo.scriptPubKey,
      address: utxo.address,
    }))

    console.log(`[brc20kit]   - Mapped UTXOs for PSBT builder:`)
    utxosForPsbt.forEach((utxo, idx) => {
      console.log(`[brc20kit]     UTXO ${idx}: scriptPk = ${utxo.scriptPk}`)
    })

    console.log(`[brc20kit]   - OP_RETURN hex: ${opReturnData}`)

    const psbtBuilder = new BRC20PSBTBuilder(process.env.NEXT_PUBLIC_NETWORK === "testnet" ? "testnet" : "mainnet")
    const brc20Data = JSON.parse(mintJSON)

    // Build PSBT with commission (if configured)
    console.log(`[brc20kit] 🔍 Commission check:`)
    console.log(`[brc20kit]   - COMMISSION_AMOUNT_SATS: ${COMMISSION_AMOUNT_SATS}`)
    console.log(`[brc20kit]   - COMMISSION_WALLET_ADDRESS: ${COMMISSION_WALLET_ADDRESS || "undefined"}`)
    console.log(
      `[brc20kit]   - Will use commission: ${COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS ? "YES" : "NO"}`,
    )

    const psbtResult =
      COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS
        ? await psbtBuilder.buildMintWithCommissionPSBT(
            utxosForPsbt,
            params.receiverAddress,
            brc20Data,
            COMMISSION_WALLET_ADDRESS,
            COMMISSION_AMOUNT_SATS,
            changeOutput,
            params.feeRate,
          )
        : await psbtBuilder.buildMintPSBT(
            utxosForPsbt,
            params.receiverAddress,
            brc20Data,
            changeOutput + COMMISSION_AMOUNT_SATS, // Add commission back to change if no commission address
            params.feeRate,
          )

    const inputs: ChainInput[] = params.userUtxos.map((utxo) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      address: utxo.address,
      fromPreviousMint: false,
    }))

    const outputs: ChainOutput[] = [
      {
        type: "op_return",
        value: 0,
        data: opReturnData,
      },
      ...(COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS
        ? [
            {
              type: "commission" as const,
              address: COMMISSION_WALLET_ADDRESS,
              value: COMMISSION_AMOUNT_SATS,
            },
          ]
        : []),
      {
        type: "change",
        address: params.receiverAddress,
        value: changeOutput,
      },
    ]

    console.log(`[brc20kit] ✅ PSBT #0 built successfully:`)
    console.log(`[brc20kit]   - Mint amount: ${params.amount} ${params.ticker}`)
    console.log(`[brc20kit]   - Network fee: ${estimatedFee} sats`)
    if (COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS) {
      console.log(`[brc20kit]   - Commission: ${COMMISSION_AMOUNT_SATS} sats`)
    }
    console.log(`[brc20kit]   - Inputs: ${inputs.length}`)
    console.log(`[brc20kit]   - Outputs: ${outputs.length}`)
    outputs.forEach((out, idx) => {
      console.log(`[brc20kit]     Output ${idx}: ${out.type} - ${out.value} sats ${out.address ? `(${out.address})` : ""}`)
    })

    // Use scriptPubKey extracted from PSBT (no ECC required)
    const receiverScriptPubKeyHex = psbtResult.changeScriptPubKey

    return {
      index: 0,
      psbtHex: psbtResult.psbtHex,
      psbtBase64: psbtResult.psbtBase64,
      ticker: params.ticker,
      amount: params.amount,
      fee: estimatedFee + (COMMISSION_AMOUNT_SATS > 0 && COMMISSION_WALLET_ADDRESS ? COMMISSION_AMOUNT_SATS : 0),
      dependsOn: null,
      inputs,
      outputs,
      receiverScriptPubKey: receiverScriptPubKeyHex,
    }
  }

  private static buildChainedMint(params: {
    index: number
    ticker: string
    amount: string
    receiverAddress: string
    previousPsbt: ChainedPSBT
    feeRate: number
    changeAddress: string
    isLast: boolean
  }): ChainedPSBT {
    const { index, ticker, amount, receiverAddress, previousPsbt, feeRate } = params

    console.log(`[brc20kit] 🔗 Constructing chained mint #${index}:`)

    // Use precise size calculation for chained PSBT
    // Detect input type from previous change output address
    const previousChangeOutput = previousPsbt.outputs.find((o) => o.type === "change")!
    const inputType = PSBTSizeCalculator.detectType(previousChangeOutput.address, undefined)

    const chainedSize = PSBTSizeCalculator.calculateChainedPSBTSize({
      inputType,
      ticker,
      amount,
    })

    const mintFee = Math.ceil(chainedSize * feeRate)
    console.log(`[brc20kit]   - Calculated fee: ${mintFee} sats (${chainedSize} vB × ${feeRate} sat/vB)`)

    const mintJSON = BRC20Builder.createMintJSON({ ticker, amount })
    const opReturnData = this.createOpReturnHex(mintJSON)

    // Get change output from previous PSBT (already found above)

    const inputValue = previousChangeOutput.value
    console.log(`[brc20kit]   - Input from PSBT #${previousPsbt.index}: ${inputValue} sats`)

    // Calculate new change: input - network fee
    const changeOutputValue = inputValue - mintFee
    console.log(`[brc20kit]   - Change output: ${changeOutputValue} sats`)
    console.log(`[brc20kit]   - Calculation: ${inputValue} - ${mintFee} = ${changeOutputValue}`)

    if (changeOutputValue < DUST_THRESHOLD) {
      const shortfall = DUST_THRESHOLD + mintFee - inputValue
      console.error(`[brc20kit] ❌ Insufficient funds for chained mint ${index}:`)
      console.error(`[brc20kit]   - Need: ${DUST_THRESHOLD + mintFee} sats (${DUST_THRESHOLD} dust + ${mintFee} fee)`)
      console.error(`[brc20kit]   - Have: ${inputValue} sats`)
      console.error(`[brc20kit]   - Short: ${shortfall} sats`)
      throw new Error(
        `Insufficient funds for chained mint ${index}: need ${DUST_THRESHOLD + mintFee} sats, have ${inputValue} sats`,
      )
    }

    // FIX: Calculate correct vout based on actual transaction structure
    // Actual transaction outputs: [OP_RETURN (index 0), Change (index 1), Commission? (index 2)]
    // Change is ALWAYS at index 1, regardless of commission
    // The metadata outputs array has different ordering, so we can't use findIndex
    const correctVout = 1

    console.log(`[brc20kit]   - Previous PSBT outputs structure:`)
    previousPsbt.outputs.forEach((out, idx) => {
      console.log(`[brc20kit]     Metadata index ${idx}: ${out.type} - ${out.value} sats`)
    })
    console.log(`[brc20kit]   - Using vout: ${correctVout} (change output in actual transaction)`)
    console.log(`[brc20kit]   - Change value: ${previousChangeOutput.value} sats`)

    const placeholderUtxo = {
      txid: `pending_${previousPsbt.index}`,
      vout: correctVout, // FIX: Use correct vout (always 1, not metadata array index)
      value: previousChangeOutput.value,
      scriptPk: "00",
      address: previousChangeOutput.address,
    }

    const inputs: ChainInput[] = [
      {
        txid: placeholderUtxo.txid,
        vout: placeholderUtxo.vout,
        value: placeholderUtxo.value,
        address: placeholderUtxo.address!,
        fromPreviousMint: true,
      },
    ]

    const outputs: ChainOutput[] = [
      {
        type: "op_return",
        value: 0,
        data: opReturnData,
      },
      {
        type: "change",
        address: receiverAddress,
        value: changeOutputValue,
      },
    ]

    // Placeholder PSBT - scriptPubKey will be set during updateChainedPSBT
    // No need to call toOutputScript() which requires ECC
    const psbtBase64 = Buffer.from(
      JSON.stringify({
        placeholder: true,
        waitingFor: previousPsbt.index,
      }),
    ).toString("base64")

    return {
      index,
      psbtHex: "",
      psbtBase64,
      ticker,
      amount,
      fee: mintFee,
      dependsOn: previousPsbt.index,
      inputs,
      outputs,
      receiverScriptPubKey: previousPsbt.receiverScriptPubKey, // Use from previous PSBT
    }
  }

  static async updateChainedPSBT(
    psbt: ChainedPSBT,
    previousTxid: string,
    previousScriptPubKey: string,
  ): Promise<ChainedPSBT> {
    console.log(`[brc20kit] 🔄 Updating chained PSBT #${psbt.index} with confirmed txid:`)
    console.log(`[brc20kit]   - Previous txid: ${previousTxid}`)
    console.log(`[brc20kit]   - ScriptPubKey: ${previousScriptPubKey}`)

    let scriptPubKeyHex = previousScriptPubKey

    // If scriptPubKey looks like an array string (e.g., "0,20,180,180..."), convert to hex
    if (previousScriptPubKey.includes(",")) {
      console.log(`[brc20kit]   - Converting array format to hex...`)
      const bytes = previousScriptPubKey.split(",").map((n) => Number.parseInt(n.trim()))
      scriptPubKeyHex = Buffer.from(bytes).toString("hex")
      console.log(`[brc20kit]   - Converted scriptPubKey: ${scriptPubKeyHex}`)
    }

    const psbtBuilder = new BRC20PSBTBuilder(process.env.NEXT_PUBLIC_NETWORK === "testnet" ? "testnet" : "mainnet")

    const previousChangeOutput = psbt.outputs.find((o) => o.type === "change")
    if (!previousChangeOutput) {
      throw new Error("Missing change output in previous PSBT")
    }

    const chainInput = psbt.inputs.find((i) => i.fromPreviousMint)!

    // FIX: Validate and correct vout (change output is always at index 1 in actual transaction)
    // The metadata outputs array may have different ordering, but actual transaction is:
    // [OP_RETURN (0), Change (1), Commission? (2)]
    let correctVout = chainInput.vout
    if (correctVout !== 1) {
      console.warn(
        `[brc20kit] ⚠️ Warning: vout is ${correctVout}, expected 1 for change output. ` +
        `Correcting to 1...`
      )
      correctVout = 1
    }

    const utxo = {
      txid: previousTxid,
      vout: correctVout, // FIX: Use corrected vout (always 1)
      value: chainInput.value,
      scriptPk: scriptPubKeyHex, // Use the properly formatted hex string
      address: chainInput.address,
    }

    console.log(`[brc20kit]   - Using UTXO: ${utxo.txid}:${utxo.vout} (${utxo.value} sats)`)
    console.log(`[brc20kit]   - ScriptPubKey hex: ${utxo.scriptPk}`)

    const opReturnOutput = psbt.outputs.find((o) => o.type === "op_return")
    if (!opReturnOutput || !opReturnOutput.data) {
      throw new Error("Missing OP_RETURN data in PSBT")
    }

    const hexData = opReturnOutput.data.replace(/^6a[0-9a-f]{2}/, "")
    const jsonString = Buffer.from(hexData, "hex").toString("utf8")
    const brc20Data = JSON.parse(jsonString)

    console.log(`[brc20kit]   - BRC-20 data: ${JSON.stringify(brc20Data)}`)

    // The structure should be: OP_RETURN (0 sats) + change back to sender
    const changeOutput = psbt.outputs.find((o) => o.type === "change")!
    const changeValue = changeOutput.value

    const actualFee = chainInput.value - changeValue

    // Use precise size calculation for chained PSBT
    // Detect input type from UTXO address
    const inputType = PSBTSizeCalculator.detectType(utxo.address, utxo.scriptPk)

    // Extract ticker and amount from BRC-20 data
    const ticker = brc20Data.tick || brc20Data.ticker || "OPQT"
    const amount = brc20Data.amt || brc20Data.amount || "1000"

    const estimatedSize = PSBTSizeCalculator.calculateChainedPSBTSize({
      inputType,
      ticker,
      amount,
    })

    const calculatedFeeRate = Math.ceil(actualFee / estimatedSize)

    console.log(
      `[brc20kit]   - Using calculated fee rate: ${calculatedFeeRate} sat/vB (fee: ${actualFee} sats, size: ~${estimatedSize} vB)`,
    )

    const psbtResult = await psbtBuilder.buildMintPSBT(
      [utxo],
      changeOutput.address!, // Change goes back to the same address
      brc20Data,
      changeValue,
      calculatedFeeRate,
    )

    const updatedInputs: ChainInput[] = [
      {
        txid: previousTxid,
        vout: utxo.vout,
        value: utxo.value,
        address: utxo.address!,
        fromPreviousMint: true,
      },
    ]

    console.log("[brc20kit] ✅ PSBT #", psbt.index, "updated successfully")

    return {
      ...psbt,
      psbtHex: psbtResult.psbtHex,
      psbtBase64: psbtResult.psbtBase64,
      inputs: updatedInputs,
      receiverScriptPubKey: psbtResult.changeScriptPubKey, // Update with extracted scriptPubKey
    }
  }

  private static createOpReturnHex(json: string): string {
    const data = Buffer.from(json, "utf8")
    const length = data.length
    return `6a${length.toString(16).padStart(2, "0")}${data.toString("hex")}`
  }

  private static selectUTXOsForChain(utxos: UTXO[], requiredAmount: number): UTXO[] {
    const sorted = [...utxos].sort((a, b) => b.value - a.value)
    const selected: UTXO[] = []
    let total = 0

    for (const utxo of sorted) {
      selected.push(utxo)
      total += utxo.value

      if (total >= requiredAmount) {
        break
      }
    }

    if (total < requiredAmount) {
      throw new Error(`Insufficient funds for chain. Need ${requiredAmount} sats (including fees), have ${total} sats`)
    }

    return selected
  }

  private static validateChainParams(params: ChainedMintParams): void {
    const { ticker, amounts, receiverAddress, userUtxos, feeRate } = params

    const tickerValidation = BRC20Builder.validateTicker(ticker)
    if (!tickerValidation.valid) {
      throw new Error(tickerValidation.error)
    }

    if (!amounts || amounts.length === 0) {
      throw new Error("At least one mint amount is required")
    }

    if (amounts.length > 25) {
      throw new Error("Maximum 25 mints per chain")
    }

    for (let i = 0; i < amounts.length; i++) {
      const amountValidation = BRC20Builder.validateAmount(amounts[i])
      if (!amountValidation.valid) {
        throw new Error(`Invalid amount at index ${i}: ${amountValidation.error}`)
      }
    }

    const addressValidation = BRC20Builder.validateAddress(receiverAddress)
    if (!addressValidation.valid) {
      throw new Error(addressValidation.error)
    }

    if (!userUtxos || userUtxos.length === 0) {
      throw new Error("No UTXOs available")
    }

    if (feeRate < 0.2) {
      throw new Error("Fee rate must be at least 0.2 sat/vB")
    }
  }
}
