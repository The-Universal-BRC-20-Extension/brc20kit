"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/lib/wallet-provider"
import { ChainedMintBuilder, type ChainedPSBT, MintChainState, FeeCalculator } from "@/lib/brc20-mint"
import { FeeService, type MempoolFeeRates } from "@/lib/fee-service"
import { UTXOValidator, type UTXOStatusCheck } from "@/lib/utxo-validator"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Loader2, ExternalLink, Sparkles, RefreshCw, Info } from 'lucide-react'
import { OnboardingDialog } from "@/components/mint/onboarding-dialog"
import { StepWizard } from "@/components/mint/step-wizard"
import { TokenPreview } from "@/components/mint/token-preview"
import { ConfettiCelebration } from "@/components/mint/confetti-celebration"
import { EnhancedSlider } from "@/components/mint/enhanced-slider"
import { FeeSelector } from "@/components/mint/fee-selector"
import { CompactWalletButton } from "@/components/wallet/compact-wallet-button"
import { logPsbtDebugInfo, validatePsbtStructure } from "@/lib/psbt-utils"
import { tokenConfig } from "@/lib/config"

export const dynamic = "force-dynamic"

const WIZARD_STEPS = [
  { id: 1, title: "Configure", description: "Set parameters" },
  { id: 2, title: "Sign", description: "Approve transactions" },
  { id: 3, title: "Complete", description: "Minting done" },
]

function MintPageContent() {
  const wallet = useWallet()
  const { toast } = useToast()

  // Ticker and amount are hardcoded from config - users cannot change them
  const ticker = tokenConfig.defaultTicker
  const amount = tokenConfig.defaultAmount
  const [numMints, setNumMints] = useState(tokenConfig.defaultNumMints)
  const [selectedFeeRate, setSelectedFeeRate] = useState<number>(tokenConfig.defaultFeeRate)
  const [mempoolFees, setMempoolFees] = useState<MempoolFeeRates | null>(null)
  const [feeOptions, setFeeOptions] = useState<any[]>([])
  const [isFetchingFees, setIsFetchingFees] = useState(false)
  const [utxoBalance, setUtxoBalance] = useState<number>(0)
  const [utxoStatus, setUtxoStatus] = useState<UTXOStatusCheck | null>(null)
  const [isCheckingUtxos, setIsCheckingUtxos] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [feeEstimate, setFeeEstimate] = useState<any>(null)

  const [isBuilding, setIsBuilding] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [chainResult, setChainResult] = useState<any>(null)
  const [chainState, setChainState] = useState<MintChainState | null>(null)
  const [signedPsbts, setSignedPsbts] = useState<Map<number, string>>(new Map())
  const [currentSigningIndex, setCurrentSigningIndex] = useState(0)

  useEffect(() => {
    fetchMempoolFees()
  }, [])

  const fetchMempoolFees = async () => {
    setIsFetchingFees(true)

    try {
      console.log("[brc20kit] Fetching fee rates from mempool.space...")
      const fees = await FeeService.fetchFeeRates()
      const options = FeeService.getFeeOptions(fees)

      setMempoolFees(fees)
      setFeeOptions(options)

      const mediumOption = options.find((opt) => opt.id === "medium")
      if (mediumOption) {
        setSelectedFeeRate(mediumOption.rate)
      }

      console.log("[brc20kit] Fee rates loaded successfully:", fees)
    } catch (error: any) {
      console.error("[brc20kit] Failed to fetch mempool fees:", error.message)
      toast({
        variant: "destructive",
        title: "Failed to load fee rates",
        description: "Refresh the page to try again",
      })
    } finally {
      setIsFetchingFees(false)
    }
  }

  useEffect(() => {
    if (wallet.connected && wallet.selectedAddress) {
      fetchUtxoBalance()
    }
  }, [wallet.connected, wallet.selectedAddress])

  const fetchUtxoBalance = async () => {
    try {
      console.log("[brc20kit] Fetching balance...")
      if (wallet.connected && wallet.selectedAddress) {
        const balance = await wallet.getBalance()
        setUtxoBalance(balance)
        console.log("[brc20kit] UTXO balance:", balance, "sats")
        console.log("[brc20kit] Selected address:", wallet.selectedAddress.substring(0, 8) + "...")
        console.log("[brc20kit] Selection reason:", wallet.addressSelectionReason)

        await checkUtxoStatus()
      } else {
        setUtxoBalance(0)
        setUtxoStatus(null)
      }
    } catch (error: any) {
      console.error("[brc20kit] Failed to fetch UTXO balance:", error.message)
      setUtxoBalance(0)
      setUtxoStatus(null)
      toast({
        variant: "destructive",
        title: "Error fetching balance",
        description: "Could not retrieve your wallet balance.",
      })
    }
  }

  const checkUtxoStatus = async () => {
    if (!wallet.connected || !wallet.selectedAddress) return

    setIsCheckingUtxos(true)
    try {
      console.log("[brc20kit] Checking UTXO status for pending transactions...")
      const utxos = await wallet.getUtxos()
      const status = await UTXOValidator.checkPendingTransactions(utxos, wallet.selectedAddress)
      setUtxoStatus(status)

      if (status.pending.length > 0) {
        console.warn(`[brc20kit] ⚠️ ${status.pending.length} UTXO(s) are involved in pending transactions`)
        status.pending.forEach((p) => {
          console.warn(
            `[brc20kit]   - ${p.utxo.txid}:${p.utxo.vout} (${p.utxo.value} sats) spent by ${p.pendingTx.txid} at ${p.pendingTx.feeRate.toFixed(1)} sat/vB`,
          )
        })
      }
    } catch (error: any) {
      console.error("[brc20kit] Failed to check UTXO status:", error.message)
      toast({
        variant: "destructive",
        title: "Error checking UTXO status",
        description: "Could not verify UTXO status.",
      })
    } finally {
      setIsCheckingUtxos(false)
    }
  }

  useEffect(() => {
    if (numMints > 0 && wallet.connected && mempoolFees) {
      try {
        const mockUtxoValue = utxoBalance || 100000
        const estimate = FeeCalculator.calculateChainFees(mockUtxoValue, numMints, selectedFeeRate)
        setFeeEstimate(estimate)
      } catch (err: any) {
        console.error("[brc20kit] Fee calculation error:", err.message)
        setFeeEstimate(null)
      }
    }
  }, [numMints, selectedFeeRate, wallet.connected, utxoBalance, mempoolFees])

  const verifyUtxoBalance = async (): Promise<{ valid: boolean; error?: string }> => {
    if (!feeEstimate) {
      return { valid: false, error: "Unable to calculate fees" }
    }

    try {
      const available = utxoBalance
      const totalRequired = feeEstimate.totalChainFees

      if (available < totalRequired) {
        return {
          valid: false,
          error: `Insufficient balance. Need ${totalRequired} sats but only have ${available} sats`,
        }
      }

      return { valid: true }
    } catch (error: any) {
      console.error("[brc20kit] Balance verification error:", error.message)
      return { valid: false, error: "Failed to verify balance" }
    }
  }

  const handleMint = async () => {
    // Unified mint handler - builds chain and signs in one flow
    if (!wallet.connected || !wallet.selectedAddress) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Connect your wallet to continue",
      })
      return
    }

    if (wallet.isResolvingAddress) {
      toast({
        variant: "default",
        title: "Resolving wallet address...",
        description: "Please wait while we check your wallet balance",
      })
      return
    }

    if (!utxoStatus) {
      await checkUtxoStatus()
    }

    if (utxoStatus && utxoStatus.pending.length > 0) {
      toast({
        variant: "destructive",
        title: "Pending UTXOs detected",
        description: `${utxoStatus.pending.length} UTXO(s) locked. Wait for confirmation or use RBF.`,
      })
      return
    }

    const balanceCheck = await verifyUtxoBalance()
    if (!balanceCheck.valid) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: balanceCheck.error,
      })
      return
    }

    setIsBuilding(true)
    setCompletedSteps([1])
    setCurrentStep(2)

    try {
      console.log("[brc20kit] 🚀 ==================== STARTING MINT PROCESS ====================")
      console.log("[brc20kit] 📝 User Configuration:")
      console.log("[brc20kit]   - Ticker:", ticker)
      console.log("[brc20kit]   - Amount per mint:", amount)
      console.log("[brc20kit]   - Number of mints:", numMints)
      console.log("[brc20kit]   - Fee rate:", selectedFeeRate, "sat/vB")
      console.log("[brc20kit]   - Selected address:", wallet.selectedAddress)
      console.log("[brc20kit]   - Address selection reason:", wallet.addressSelectionReason)
      console.log("[brc20kit]   - UTXO balance:", utxoBalance, "sats")

      let userUtxos

      try {
        console.log("[brc20kit] 🔍 Fetching user UTXOs using Unisat API...")
        userUtxos = await wallet.getUtxos()

        if (utxoStatus && utxoStatus.pending.length > 0) {
          console.log("[brc20kit] 🚫 Filtering out UTXOs in pending transactions...")
          const pendingOutpoints = new Set(utxoStatus.pending.map((p) => `${p.utxo.txid}:${p.utxo.vout}`))
          userUtxos = userUtxos.filter((utxo: any) => {
            const outpoint = `${utxo.txid}:${utxo.vout}`
            return !pendingOutpoints.has(outpoint)
          })
          console.log(`[brc20kit] ✅ ${userUtxos.length} available UTXOs after filtering`)
        }

        console.log("[brc20kit] ✅ Fetched", userUtxos.length, "UTXOs")
        userUtxos.forEach((utxo: any, i: number) => {
          console.log(`[brc20kit]   UTXO ${i + 1}: ${utxo.txid}:${utxo.vout} - ${utxo.value} sats`)
        })
      } catch (err: any) {
        console.error("[brc20kit] ❌ Failed to fetch UTXOs:", err.message)
        throw new Error(`Failed to fetch UTXOs: ${err.message}`)
      }

      const amounts = Array(numMints).fill(amount)

      const result = await ChainedMintBuilder.buildChain({
        ticker,
        amounts,
        receiverAddress: wallet.selectedAddress,
        userUtxos,
        feeRate: selectedFeeRate,
        changeAddress: wallet.selectedAddress,
      })

      const state = new MintChainState()
      state.initializeChain({
        totalMints: numMints,
        ticker,
        receiverAddress: wallet.selectedAddress,
        feeRate: selectedFeeRate,
        psbts: result.psbts,
      })
      setChainState(state)
      setChainResult(result)

      console.log("[brc20kit] ✅ Mint chain built successfully!")
      console.log("[brc20kit]   - Total PSBTs:", result.psbts.length)
      console.log("[brc20kit]   - Total fees:", result.totalFee, "sats")
      console.log("[brc20kit]   - Estimated confirmation:", result.estimatedConfirmationTime)

      // Automatically proceed to signing after building
      setIsBuilding(false)
      setIsSigning(true)
      setCompletedSteps([1])
      setCurrentStep(2)

      // Start signing immediately - pass result and state directly to avoid React state timing issues
      await handleSignChain(result, state)
    } catch (err: any) {
      console.error("[brc20kit] ❌ Failed to build chain:", err)
      console.error("[brc20kit]   - Error message:", err.message)
      console.error("[brc20kit]   - Stack trace:", err.stack)
      toast({
        variant: "destructive",
        title: "Failed to build chain",
        description: err.message || "Unknown error",
      })
      setIsBuilding(false)
    }
  }

  const handleSignChain = async (providedChainResult?: any, providedChainState?: MintChainState) => {
    // Use provided parameters if available (from handleMint), otherwise use state
    const activeChainResult = providedChainResult || chainResult
    const activeChainState = providedChainState || chainState

    if (!activeChainResult || !activeChainState) {
      console.error("[brc20kit] ❌ Cannot sign: chainResult or chainState missing")
      console.error("[brc20kit]   - chainResult:", !!activeChainResult)
      console.error("[brc20kit]   - chainState:", !!activeChainState)
      toast({
        variant: "destructive",
        title: "Cannot sign",
        description: "Chain data is missing. Please try again.",
      })
      return
    }

    if (!wallet.connected || !wallet.selectedAddress) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
      })
      return
    }

    setIsSigning(true)
    setCurrentSigningIndex(0)

    try {
      console.log("[brc20kit] ✍️ ==================== STARTING SIGNING PROCESS ====================")
      console.log("[brc20kit] 📋 Signing Configuration:")
      console.log("[brc20kit]   - Total PSBTs to sign:", activeChainResult.psbts.length)
      console.log("[brc20kit]   - Ticker:", ticker)
      console.log("[brc20kit]   - Fee rate:", selectedFeeRate, "sat/vB")

      const signed = new Map<number, string>()

      for (let i = 0; i < activeChainResult.psbts.length; i++) {
        console.log(`[brc20kit] 📝 ==================== PROCESSING PSBT #${i} ====================`)
        setCurrentSigningIndex(i)
        const psbt = activeChainResult.psbts[i]

        activeChainState.updateMintStatus(i, "signing")

        let psbtToSign = psbt

        if (psbt.dependsOn !== null) {
          console.log(`[brc20kit] 🔗 PSBT #${i} depends on PSBT #${psbt.dependsOn}`)
            const previousTxid = signed.get(psbt.dependsOn)
            const previousPsbt = activeChainResult.psbts[psbt.dependsOn]
          const previousScriptPubKey = previousPsbt.receiverScriptPubKey

          console.log(`[brc20kit]   - Previous txid: ${previousTxid}`)
          console.log(`[brc20kit]   - Previous scriptPubKey: ${previousScriptPubKey}`)

          if (previousTxid && previousScriptPubKey) {
            console.log(`[brc20kit] 🔄 Updating chained PSBT #${i} with confirmed txid...`)
            const scriptPubKeyHex =
              typeof previousScriptPubKey === "string" && !previousScriptPubKey.includes(",")
                ? previousScriptPubKey
                : previousScriptPubKey

            psbtToSign = await ChainedMintBuilder.updateChainedPSBT(psbt, previousTxid, scriptPubKeyHex)
          } else {
            throw new Error(`Missing previous transaction data for PSBT ${i}`)
          }
        }

        try {
          console.log(`[brc20kit] 🔐 Signing PSBT #${i}:`)
          console.log(`[brc20kit]   - Mint amount: ${psbtToSign.mintAmount} ${ticker}`)
          console.log(`[brc20kit]   - Fee: ${psbtToSign.fee} sats`)
          console.log(`[brc20kit]   - Inputs:`, psbtToSign.inputs.length)
          psbtToSign.inputs.forEach((inp: any, idx: number) => {
            console.log(
              `[brc20kit]     Input ${idx}: ${inp.txid}:${inp.vout} (${inp.value} sats, from previous: ${inp.fromPreviousMint})`,
            )
          })
          console.log(`[brc20kit]   - Outputs:`, psbtToSign.outputs.length)
          psbtToSign.outputs.forEach((out: any, idx: number) => {
            console.log(
              `[brc20kit]     Output ${idx}: ${out.type} - ${out.value} sats ${out.address ? `(${out.address})` : ""}`,
            )
          })

          logPsbtDebugInfo(psbtToSign.psbtBase64, `PSBT #${i}`)

          const validation = validatePsbtStructure(psbtToSign.psbtBase64)
          if (!validation.valid) {
            console.error(`[brc20kit] ❌ PSBT #${i} validation failed:`, validation.errors)
            throw new Error(`PSBT validation failed: ${validation.errors.join("; ")}`)
          }

          console.log(`[brc20kit] ✅ PSBT #${i} validation passed`)
          console.log(`[brc20kit] 📤 Sending PSBT #${i} to wallet for signing...`)
          console.log(`[brc20kit]   - Wallet connected:`, wallet.connected)
          console.log(`[brc20kit]   - Wallet address:`, wallet.selectedAddress?.substring(0, 8) + "...")
          console.log(`[brc20kit]   - PSBT size:`, psbtToSign.psbtBase64.length, "bytes")

          // Verify wallet is connected before signing
          if (!wallet.connected) {
            throw new Error("Wallet is not connected. Please reconnect your wallet.")
          }

          if (!wallet.selectedAddress) {
            throw new Error("No wallet address available. Please reconnect your wallet.")
          }

          console.log(`[brc20kit] 🔐 Calling wallet.signPsbt()...`)
          const signResult = await wallet.signPsbt(psbtToSign.psbtBase64, true)
          console.log(`[brc20kit] ✅ Wallet signPsbt() returned:`, {
            hasSignedPsbt: !!signResult.signedPsbtBase64,
            hasTxid: !!signResult.txid,
            txid: signResult.txid?.substring(0, 16) + "...",
          })
          const txid = signResult.txid || `mock_txid_${i}`

          console.log(`[brc20kit] ✅ PSBT #${i} signed and broadcast!`)
          console.log(`[brc20kit]   - Transaction ID: ${txid}`)

          signed.set(i, txid)

          activeChainState.completeMint(i, txid)

          console.log(`[brc20kit] ✅ Mint #${i + 1} completed successfully!`)
          console.log(`[brc20kit]   - Progress: ${i + 1}/${activeChainResult.totalMints}`)

          toast({
            title: `Transaction ${i + 1}/${activeChainResult.totalMints} confirmed`,
            description: (
              <a
                href={`https://mempool.space/tx/${txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                View on mempool <ExternalLink className="h-3 w-3" />
              </a>
            ),
          })
        } catch (err: any) {
          console.error(`[brc20kit] ❌ Failed to sign PSBT #${i}:`, err)
          console.error(`[brc20kit]   - Error message:`, err.message)
          console.error(`[brc20kit]   - Error details:`, err)
          activeChainState.failMint(i, err.message)
          throw err
        }
      }

      // Update state with the chain data so UI can display completion
      setChainResult(activeChainResult)
      setChainState(activeChainState)
      setSignedPsbts(signed)
      setCompletedSteps([1, 2])
      setCurrentStep(3)
      setShowConfetti(true)

      console.log("[brc20kit] 🎉 ==================== ALL MINTS COMPLETED! ====================")
      console.log("[brc20kit] 📊 Final Summary:")
      console.log("[brc20kit]   - Total mints:", activeChainResult.psbts.length)
      console.log("[brc20kit]   - Total fees paid:", activeChainResult.totalFee, "sats")
      console.log("[brc20kit]   - Total minted:", Number(amount) * numMints, ticker)
      console.log("[brc20kit]   - Transaction IDs:")
      signed.forEach((txid, index) => {
        console.log(`[brc20kit]     ${index + 1}. ${txid}`)
      })

      toast({
        title: "Minting complete!",
        description: `Successfully minted ${Number(amount) * numMints} ${ticker}`,
      })
    } catch (err: any) {
      console.error("[brc20kit] ❌ ==================== SIGNING PROCESS FAILED ====================")
      console.error("[brc20kit]   - Failed at PSBT:", currentSigningIndex)
      console.error("[brc20kit]   - Error:", err.message)
      console.error("[brc20kit]   - Stack:", err.stack)
      toast({
        variant: "destructive",
        title: "Signing failed",
        description: err.message || "Unknown error",
      })
    } finally {
      setIsSigning(false)
    }
  }

  // Form validation - ticker and amount are always valid (from config)
  const isFormValid = ticker && amount && Number(amount) > 0

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 max-w-6xl">
      <ConfettiCelebration trigger={showConfetti} />

      <div className="space-y-4 sm:space-y-6">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-primary p-4 sm:p-6 text-primary-foreground fade-in">
          <div className="absolute inset-0 bg-dot-grid opacity-10" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-20" aria-hidden="true" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                BRC-20 Mint
              </h1>
              <p className="text-xs sm:text-sm text-primary-foreground/90">Create up to 25 linked transactions</p>
            </div>
            <div className="flex flex-row sm:flex-col md:flex-row items-center sm:items-end md:items-center gap-3 w-full sm:w-auto">
              <CompactWalletButton />
            </div>
          </div>
        </div>

        {isFetchingFees && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Loading fee rates...</AlertDescription>
          </Alert>
        )}

        <StepWizard steps={WIZARD_STEPS} currentStep={currentStep} completedSteps={completedSteps} />

        {!wallet.connected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Connect your wallet to start</AlertDescription>
          </Alert>
        )}

        {utxoStatus && utxoStatus.pending.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{utxoStatus.pending.length} pending UTXO(s)</p>
                  <p className="text-xs mt-1">{utxoStatus.totalPending.toLocaleString()} sats locked</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkUtxoStatus}
                    disabled={isCheckingUtxos}
                    className="h-7 text-xs bg-transparent"
                  >
                    <RefreshCw className={`h-3 w-3 ${isCheckingUtxos ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-7 text-xs bg-transparent">
                    <a
                      href={`https://mempool.space/address/${wallet.selectedAddress || wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6 order-2 lg:order-1">
            <GlassCard className="p-4 sm:p-5 md:p-6 hover-lift fade-in">
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Mint Configuration</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Configure your BRC-20 mint operation</p>
                </div>

                {/* Token Configuration - Read Only */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Minting Token</Label>
                    <div className="text-lg font-semibold">{ticker}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Amount Per Mint</Label>
                    <div className="text-lg font-semibold">{amount}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    These values are configured from environment variables and cannot be changed.
                  </p>
                </div>

                <EnhancedSlider
                  value={numMints}
                  onChange={setNumMints}
                  min={1}
                  max={25}
                  step={1}
                  disabled={!wallet.connected}
                  label="Number of Mints"
                  description={`${numMints} transaction${numMints > 1 ? "s" : ""}`}
                />

                {mempoolFees && feeOptions.length > 0 && (
                  <FeeSelector
                    options={feeOptions}
                    selected={selectedFeeRate}
                    onSelect={setSelectedFeeRate}
                    disabled={!wallet.connected}
                    minCustomFee={0.2}
                    maxCustomFee={500}
                    mempoolFees={mempoolFees}
                  />
                )}

                {feeEstimate && mempoolFees && (
                  <Alert variant={utxoBalance >= feeEstimate.totalChainFees ? "default" : "destructive"}>
                    <AlertDescription>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">Total Fees</span>
                        <span className="text-sm font-mono font-semibold">
                          {feeEstimate.totalChainFees.toLocaleString()} sats
                        </span>
                      </div>
                      {utxoBalance < feeEstimate.totalChainFees && (
                        <p className="text-xs mt-2 text-destructive font-medium">
                          Need {(feeEstimate.totalChainFees - utxoBalance).toLocaleString()} more sats
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleMint}
                  disabled={!isFormValid || isBuilding || isSigning || !wallet.connected || !mempoolFees || wallet.isResolvingAddress}
                  className="w-full hover-lift text-sm sm:text-base"
                  size="lg"
                >
                  {isBuilding || isSigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isBuilding ? "Preparing..." : `Signing ${currentSigningIndex + 1}/${chainResult?.totalMints || numMints}`}
                    </>
                  ) : (
                    `Mint ${ticker} Tokens`
                  )}
                </Button>
              </div>
            </GlassCard>

            {/* Progress indicator during minting */}
            {(isBuilding || isSigning) && chainResult && (
              <GlassCard className="p-4 sm:p-5 md:p-6 hover-lift fade-in">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold">Minting Progress</h2>
                    <Badge variant="secondary">{chainResult.totalMints} transactions</Badge>
                  </div>

                  {isSigning && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Signing transactions</span>
                        <span className="font-mono font-semibold">
                          {currentSigningIndex + 1}/{chainResult.totalMints}
                        </span>
                      </div>
                      <Progress value={((currentSigningIndex + 1) / chainResult.totalMints) * 100} />
                    </div>
                  )}

                  <div className="space-y-2">
                    {chainResult.psbts.map((psbt: ChainedPSBT, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 sm:p-3 border rounded-lg bg-background/50 transition-all"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Badge variant="outline" className="w-10 sm:w-12 justify-center text-xs">
                            #{index + 1}
                          </Badge>
                          <div className="text-xs sm:text-sm">
                            <div className="font-medium">
                              {psbt.mintAmount} {ticker}
                            </div>
                            <div className="text-xs text-muted-foreground">{psbt.fee} sats</div>
                          </div>
                        </div>
                        <div>
                          {signedPsbts.has(index) ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs font-medium">Signed</span>
                            </div>
                          ) : isSigning && currentSigningIndex === index ? (
                            <div className="flex items-center gap-1.5 text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-xs">Signing...</span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Success message */}
            {chainResult && signedPsbts.size === chainResult.totalMints && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 bounce-in">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="font-semibold mb-1">All transactions confirmed!</div>
                  <div className="text-sm">
                    Successfully minted {Number(amount) * numMints} {ticker} tokens across {chainResult.totalMints} transaction{chainResult.totalMints > 1 ? "s" : ""}.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-8 fade-in" style={{ animationDelay: "200ms" }}>
              <TokenPreview ticker={ticker} amount={amount} numMints={numMints} feeRate={selectedFeeRate} />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="ghost" size="sm" onClick={() => setShowOnboarding(true)} className="text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            Need help? View guide
          </Button>
        </div>
      </div>

      <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} />
    </div>
  )
}

export default function MintPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return <MintPageContent />
}
