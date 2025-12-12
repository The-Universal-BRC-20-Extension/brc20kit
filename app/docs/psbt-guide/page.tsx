"use client"

import { GlassCard } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CodeBlock } from "@/components/docs/code-block"
import { TableOfContents } from "@/components/docs/table-of-contents"
import { Button } from "@/components/ui/button"

const tocItems = [
  { id: "fundamentals", title: "PSBT Fundamentals", level: 2 },
  { id: "core-concepts", title: "Core Concepts", level: 3 },
  { id: "brc20-structure", title: "BRC-20 Structure", level: 3 },
  { id: "on-chain", title: "On-Chain Analysis", level: 2 },
  { id: "wallets", title: "Wallet Compatibility", level: 2 },
  { id: "chaining", title: "PSBT Chaining", level: 2 },
  { id: "implementation", title: "Implementation", level: 2 },
]

export default function PSBTGuidePage() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
        <div className="space-y-8">
          <div className="space-y-4 fade-in">
            <Link href="/docs">
              <Button variant="ghost" size="sm" className="hover-lift">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documentation
              </Button>
            </Link>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground">
              <div className="absolute inset-0 bg-grid-white/10" aria-hidden="true" />
              <div className="relative z-10 space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">BRC-20 Minting PSBT Deep Dive</h1>
                <p className="text-xl text-primary-foreground/90">
                  A comprehensive guide to constructing Partially Signed Bitcoin Transactions for BRC-20 token minting
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="fundamentals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-muted/50">
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="analysis">On-Chain</TabsTrigger>
              <TabsTrigger value="wallets">Wallets</TabsTrigger>
              <TabsTrigger value="chaining">Chaining</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>

            <TabsContent value="fundamentals" className="space-y-6">
              <GlassCard className="p-6 hover-lift fade-in" id="fundamentals">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">PSBT Format Fundamentals (BIP-174 & BIP-370)</h2>
                    <p className="text-muted-foreground">
                      Understanding the core concepts of Partially Signed Bitcoin Transactions
                    </p>
                  </div>

                  <div className="space-y-4" id="core-concepts">
                    <h3 className="text-lg font-semibold">Core Concepts</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2 slide-in-left" style={{ animationDelay: "100ms" }}>
                        <span className="text-primary font-bold">•</span>
                        <div>
                          <strong>PSBT Purpose:</strong> Partially Signed Bitcoin Transaction - enables multi-party
                          signing
                        </div>
                      </li>
                      <li className="flex items-start gap-2 slide-in-left" style={{ animationDelay: "200ms" }}>
                        <span className="text-primary font-bold">•</span>
                        <div>
                          <strong>Key Components:</strong> Global transaction data, per-input data, per-output data
                        </div>
                      </li>
                      <li className="flex items-start gap-2 slide-in-left" style={{ animationDelay: "300ms" }}>
                        <span className="text-primary font-bold">•</span>
                        <div>
                          <strong>Version Differences:</strong> PSBT v0 vs v2 (BIP-370) improvements
                        </div>
                      </li>
                      <li className="flex items-start gap-2 slide-in-left" style={{ animationDelay: "400ms" }}>
                        <span className="text-primary font-bold">•</span>
                        <div>
                          <strong>Role in Ordinals/BRC-20:</strong> Enables inscription creation without full UTXO
                          control
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4" id="brc20-structure">
                    <h3 className="text-lg font-semibold">BRC-20 Specific PSBT Structure</h3>
                    <CodeBlock
                      title="PSBT Structure"
                      language="text"
                      code={`Global PSBT:
  version: 2
  inputs_count: 1
  outputs_count: 3
  
Input 0 (User's UTXO):
  previous_txid: <funding_transaction_id>
  output_index: <vout_index>
  sequence: 0xFFFFFFFD (for RBF)
  witness_utxo: <value and scriptPubKey>
  taproot_internal_key: (if Taproot)
  sighash_type: SIGHASH_ALL

Output 0 (Inscription):
  script: OP_RETURN <ordinal_protocol_prefix> <brc20_mint_json>
  value: 0
  
Output 1 (Receiver):
  script: <taproot_address_script>
  value: 546 (dust limit)
  
Output 2 (Change):
  script: <user_change_address>
  value: <input_value - 546 - fees>`}
                    />
                  </div>

                  <Alert className="bounce-in">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Key Insight</AlertTitle>
                    <AlertDescription>
                      The PSBT format allows wallets to sign transactions without having complete information about all
                      inputs, making it perfect for BRC-20 inscription workflows where the inscription data is added by
                      a third party.
                    </AlertDescription>
                  </Alert>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <GlassCard className="p-6 hover-lift fade-in" id="on-chain">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">On-Chain BRC-20 Mint Analysis</h2>
                    <p className="text-muted-foreground">Studying real-world BRC-20 mint transactions</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Transaction Structure Study</h3>
                    <p className="text-sm text-muted-foreground">
                      Use mempool.space API to fetch 3-5 recent BRC-20 mint transactions and observe:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Input patterns (single UTXO vs multiple)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Output ordering consistency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Fee rates used in practice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Taproot adoption percentage</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dust Threshold Confirmation</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm">
                        <strong>Current Standard:</strong> 546 satoshis (SegWit v1/Taproot)
                      </p>
                      <p className="text-sm">
                        <strong>Rationale:</strong> Economic dust limit prevents UTXO spam
                      </p>
                      <p className="text-sm">
                        <strong>Verification:</strong> Check multiple transactions confirm this value
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fee Estimation Strategy</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">High Priority</h4>
                          <p className="text-sm text-muted-foreground">25-50 sat/vB</p>
                          <p className="text-xs text-muted-foreground mt-2">Fast confirmation</p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Medium Priority</h4>
                          <p className="text-sm text-muted-foreground">10-25 sat/vB</p>
                          <p className="text-xs text-muted-foreground mt-2">Normal speed</p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Low Priority</h4>
                          <p className="text-sm text-muted-foreground">5-10 sat/vB</p>
                          <p className="text-xs text-muted-foreground mt-2">Slow confirmation</p>
                        </div>
                      </GlassCard>
                    </div>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Batch Considerations</AlertTitle>
                      <AlertDescription>
                        Larger chains need higher fees for timely processing to ensure all transactions confirm in
                        sequence.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="wallets" className="space-y-6">
              <GlassCard className="p-6 hover-lift fade-in" id="wallets">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Wallet SDK Compatibility Analysis</h2>
                    <p className="text-muted-foreground">Testing and integrating with popular Bitcoin wallets</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Testing Matrix</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Wallet</th>
                            <th className="text-center p-2">PSBT</th>
                            <th className="text-center p-2">Taproot</th>
                            <th className="text-center p-2">signPsbt()</th>
                            <th className="text-center p-2">Broadcast</th>
                            <th className="text-left p-2">Quirks</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          <tr className="border-b">
                            <td className="p-2 font-medium">Unisat</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="p-2 text-muted-foreground">Hex encoding</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Phantom</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="p-2 text-muted-foreground">Network params</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">OKX</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="p-2 text-muted-foreground">Fee limits</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Xverse</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">⚠️</td>
                            <td className="text-center p-2">✅</td>
                            <td className="p-2 text-muted-foreground">Stacks integration</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium">Magic Eden</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="p-2 text-muted-foreground">Marketplace focus</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">Leather</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="text-center p-2">✅</td>
                            <td className="p-2 text-muted-foreground">Bitcoin-focused</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Testing Procedures</h3>
                    <ol className="space-y-3 text-sm list-decimal list-inside">
                      <li>
                        <strong>Installation:</strong> <code className="bg-muted px-1 py-0.5 rounded">npm install</code>{" "}
                        each SDK
                      </li>
                      <li>
                        <strong>Connection Test:</strong> Basic wallet connection
                      </li>
                      <li>
                        <strong>Address Generation:</strong> Verify bc1p Taproot format
                      </li>
                      <li>
                        <strong>PSBT Creation:</strong> Build simple mint transaction
                      </li>
                      <li>
                        <strong>Signing Test:</strong>{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">wallet.signPsbt(psbtHex, options)</code>
                      </li>
                      <li>
                        <strong>Broadcast:</strong> Verify transaction reaches network
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Common Quirks</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Hex Encoding</h4>
                        <p className="text-xs text-muted-foreground">Some wallets expect different hex formats</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Network Parameters</h4>
                        <p className="text-xs text-muted-foreground">Mainnet vs testnet handling varies</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Fee Policies</h4>
                        <p className="text-xs text-muted-foreground">Maximum fee limits or custom RBF settings</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">Error Handling</h4>
                        <p className="text-xs text-muted-foreground">User rejection vs technical failures</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="chaining" className="space-y-6">
              <GlassCard className="p-6 hover-lift fade-in" id="chaining">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">PSBT Chaining Algorithm Design</h2>
                    <p className="text-muted-foreground">Building sequential mint chains for batch operations</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sequential Minting Flow</h3>
                    <CodeBlock
                      title="Sequential Minting Flow"
                      language="text"
                      code={`Chain of N mints (max 25 due to standard limits):

Mint 1: [User UTXO] → [OP_RETURN, Receiver1, Change1]
Mint 2: [Receiver1 UTXO] → [OP_RETURN, Receiver2, Change2]  
Mint 3: [Receiver2 UTXO] → [OP_RETURN, Receiver3, Change3]
...
Mint N: [ReceiverN-1 UTXO] → [OP_RETURN, FinalReceiver, ChangeN]`}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Algorithm Pseudocode</h3>
                    <CodeBlock
                      title="Algorithm Pseudocode"
                      language="javascript"
                      code={`function createMintChain(initialUTXO, receiverAddresses, mintData) {
  let currentInput = initialUTXO
  let chainPSBTs = []
  
  for (i = 0; i < receiverAddresses.length; i++) {
    let psbt = new PSBT()
    
    // Add input from previous output
    psbt.addInput({
      hash: currentInput.txid,
      index: currentInput.vout,
      sequence: 0xFFFFFFFD
    })
    
    // Add outputs
    psbt.addOutput({
      script: createOpReturn(mintData[i]),
      value: 0
    })
    
    psbt.addOutput({
      script: receiverAddresses[i],
      value: 546
    })
    
    // Calculate change (handle last iteration differently)
    let changeValue = calculateChange(currentInput.value, 546, fees)
    if (i < receiverAddresses.length - 1 && changeValue >= 546) {
      psbt.addOutput({
        script: changeAddress,
        value: changeValue
      })
      currentInput = createUTXO(psbt, 2) // Change becomes next input
    } else if (changeValue < 546) {
      // Merge strategy needed
      handleDustChange(psbt, receiverAddresses[i])
    }
    
    chainPSBTs.push(psbt)
  }
  
  return chainPSBTs
}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Edge Case Handling</h3>
                    <div className="space-y-4">
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">1. Dust Change Problem</h4>
                          <CodeBlock
                            title="Dust Change Problem"
                            language="javascript"
                            code={`if (changeValue < 546) {
  // Option 1: Increase receiver output
  receiverValue = 546 + changeValue
  // Option 2: Don't create change, add to receiver
  // Requires receiver agreement
}`}
                          />
                        </div>
                      </GlassCard>

                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">2. Batch Fee Estimation</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Calculate total virtual size of chain</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Apply single fee rate across all transactions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Reserve fees from initial UTXO</span>
                            </li>
                          </ul>
                        </div>
                      </GlassCard>

                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">3. Partial Signing Recovery</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Store chain state after each successful sign</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>If user cancels, can resume from last signed PSBT</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Implement checkpoint system for long chains</span>
                            </li>
                          </ul>
                        </div>
                      </GlassCard>

                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">4. Maximum Chain Length</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Standard limit: 25 transactions (anti-DoS)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Validate receiver addresses count upfront</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Provide progress indicators to user</span>
                            </li>
                          </ul>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6">
              <GlassCard className="p-6 hover-lift fade-in" id="implementation">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Implementation Considerations</h2>
                    <p className="text-muted-foreground">Security, UX, and performance best practices</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Security Aspects</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Input Validation</h4>
                          <p className="text-sm text-muted-foreground">Verify all UTXOs belong to user</p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Fee Safety</h4>
                          <p className="text-sm text-muted-foreground">Prevent fee draining attacks</p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Finality</h4>
                          <p className="text-sm text-muted-foreground">Ensure chain completes or fully rolls back</p>
                        </div>
                      </GlassCard>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Experience</h3>
                    <div className="space-y-3">
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Progress Tracking</h4>
                          <p className="text-sm text-muted-foreground">
                            Show mint progress through chain with clear indicators
                          </p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Error Handling</h4>
                          <p className="text-sm text-muted-foreground">
                            Clear messages for failures with recovery options
                          </p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Confirmation</h4>
                          <p className="text-sm text-muted-foreground">
                            Explain multi-transaction nature upfront with estimated time and costs
                          </p>
                        </div>
                      </GlassCard>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance Optimizations</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Parallel Processing</h4>
                          <p className="text-sm text-muted-foreground">Prepare next PSBT while previous signs</p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Caching</h4>
                          <p className="text-sm text-muted-foreground">
                            Store frequently used data (fee estimates, network params)
                          </p>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-6 hover-lift fade-in">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Batch Verification</h4>
                          <p className="text-sm text-muted-foreground">Validate entire chain before starting</p>
                        </div>
                      </GlassCard>
                    </div>
                  </div>

                  <Alert className="bounce-in">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ready to Build?</AlertTitle>
                    <AlertDescription>
                      Use the concepts you've learned here to build your own PSBT-based applications with the Mint page.
                    </AlertDescription>
                  </Alert>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden lg:block">
          <TableOfContents items={tocItems} />
        </aside>
      </div>
    </div>
  )
}
