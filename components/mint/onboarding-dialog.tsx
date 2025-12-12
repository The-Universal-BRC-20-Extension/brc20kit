"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Wallet, LinkIcon, Zap } from "lucide-react"

interface OnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "Welcome to BRC-20 Minting",
      description: "Learn how to mint BRC-20 tokens with chained PSBTs in just a few steps",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This portal allows you to mint BRC-20 tokens using advanced chained PSBT technology. You can create up to 25
            linked mint transactions in a single flow.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <span>Support for 6+ Bitcoin wallets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <span>100% client-side PSBT construction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <span>Automatic fee calculation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Step 1: Connect Your Wallet",
      description: "Connect a Bitcoin wallet that supports Taproot and PSBT signing",
      icon: Wallet,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We support multiple Bitcoin wallets including Unisat, Xverse, OKX, Phantom, and Magic Eden. Make sure your
            wallet is installed and has sufficient BTC for minting and fees.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Recommended Wallets:</strong>
                </div>
                <ul className="space-y-1 ml-4">
                  <li>• Unisat - Best for BRC-20 operations</li>
                  <li>• Xverse - Full Bitcoin DeFi support</li>
                  <li>• OKX - Multi-chain wallet</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Step 2: Configure Your Mint",
      description: "Set up your token ticker, amount, and number of mints",
      icon: LinkIcon,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the token ticker (minimum 5 characters, any characters allowed), amount per mint, and how many mints
            you want to create. The system will automatically calculate fees and build the PSBT chain.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Chained PSBTs:</strong>
                </div>
                <p className="text-muted-foreground">
                  Each PSBT after the first uses the output from the previous transaction as its input, creating a
                  dependency chain. This allows you to mint multiple tokens efficiently.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      title: "Step 3: Sign & Broadcast",
      description: "Sign each PSBT in sequence and broadcast to the network",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once the chain is built, you'll sign each PSBT sequentially. The system will automatically update each PSBT
            with the transaction ID from the previous one before signing.
          </p>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Important:</strong>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Sign PSBTs in order (cannot skip)</li>
                  <li>• Each signature triggers automatic broadcast</li>
                  <li>• Progress is tracked and can be resumed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]
  const Icon = currentStep.icon

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onOpenChange(false)
      setStep(0)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>{currentStep.title}</DialogTitle>
              <DialogDescription>{currentStep.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">{currentStep.content}</div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${index === step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>{step < steps.length - 1 ? "Next" : "Get Started"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
