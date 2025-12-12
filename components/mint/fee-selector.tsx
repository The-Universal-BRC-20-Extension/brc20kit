"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Zap, Clock, Settings2, TrendingUp } from "lucide-react"
import type { MempoolFeeRates } from "@/lib/fee-service"

interface FeeOption {
  id: string
  label: string
  rate: number
  estimatedTime: string
}

interface FeeSelectorProps {
  options: FeeOption[]
  selected: number
  onSelect: (rate: number) => void
  disabled?: boolean
  minCustomFee?: number
  maxCustomFee?: number
  mempoolFees?: MempoolFeeRates | null
}

export function FeeSelector({
  options,
  selected,
  onSelect,
  disabled = false,
  minCustomFee = 0.2,
  maxCustomFee = 500,
  mempoolFees,
}: FeeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customFee, setCustomFee] = useState(selected)
  const [animateSelected, setAnimateSelected] = useState<string | null>(null)

  const isCustom = !options.some((opt) => opt.rate === selected)

  const handleOptionClick = (option: FeeOption) => {
    setShowCustom(false)
    setAnimateSelected(option.id)
    onSelect(option.rate)

    setTimeout(() => {
      setAnimateSelected(null)
    }, 600)
  }

  const handleCustomClick = () => {
    setShowCustom(true)
    setCustomFee(selected)
  }

  const handleCustomApply = () => {
    onSelect(customFee)
  }

  const getIcon = (id: string) => {
    switch (id) {
      case "slow":
        return <Clock className="h-3.5 w-3.5" />
      case "medium":
        return <TrendingUp className="h-3.5 w-3.5" />
      case "fast":
        return <Zap className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <Label>Fees</Label>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = !showCustom && selected === option.rate
          const isAnimating = animateSelected === option.id
          return (
            <Button
              key={option.id}
              variant="outline"
              size="sm"
              onClick={() => handleOptionClick(option)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-start gap-0.5 h-auto py-2 px-3 transition-all relative",
                "bg-white hover:bg-accent/5 border-border",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
                isAnimating && "scale-110 shadow-lg",
              )}
              aria-pressed={isSelected}
              aria-label={`${option.label} fee option: ${option.rate} sat/vB, ${option.estimatedTime}`}
            >
              <div className="flex items-center gap-1.5 w-full">
                {getIcon(option.id)}
                <span className="font-semibold">{option.label}</span>
              </div>
              <div className={cn("flex items-baseline gap-1 text-[10px] opacity-80", isSelected && "opacity-90")}>
                <span className="font-mono font-semibold">{option.rate} sat/vB</span>
                <span>•</span>
                <span>{option.estimatedTime}</span>
              </div>
            </Button>
          )
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCustomClick}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 h-auto py-2 px-3 transition-all",
            "bg-white hover:bg-accent/5 border-border",
            (showCustom || isCustom) && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
          )}
          aria-pressed={showCustom || isCustom}
          aria-label="Custom fee option"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="font-semibold">Custom</span>
        </Button>
      </div>

      {!showCustom && (
        <div className="flex items-center justify-between text-sm px-1 py-2 bg-muted/30 rounded-md">
          <span className="text-foreground/80 font-medium">
            {options.find((o) => o.rate === selected)?.estimatedTime || "Custom rate"}
          </span>
          <Badge variant="secondary" className="font-mono font-semibold">
            {selected} sat/vB
          </Badge>
        </div>
      )}

      {/* Custom fee input */}
      {showCustom && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-fee" className="text-sm">
              Custom Fee Rate
            </Label>
            <Badge variant="secondary" className="font-mono text-xs">
              {customFee} sat/vB
            </Badge>
          </div>

          <Slider
            id="custom-fee"
            value={[customFee]}
            onValueChange={(values) => setCustomFee(values[0])}
            min={minCustomFee}
            max={maxCustomFee}
            step={1}
            disabled={disabled}
            className="py-2"
            aria-label="Custom fee rate slider"
          />

          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={customFee}
              onChange={(e) => setCustomFee(Number(e.target.value))}
              min={minCustomFee}
              max={maxCustomFee}
              disabled={disabled}
              className="h-8 text-sm"
              aria-label="Custom fee rate input"
            />
            <Button size="sm" onClick={handleCustomApply} disabled={disabled}>
              Apply
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Higher fees = faster confirmation. Range: {minCustomFee}-{maxCustomFee} sat/vB
          </p>
        </div>
      )}
    </div>
  )
}
