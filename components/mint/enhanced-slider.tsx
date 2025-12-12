"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EnhancedSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  disabled?: boolean
  label: string
  description?: string
}

export function EnhancedSlider({ value, onChange, min, max, step, disabled, label, description }: EnhancedSliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Badge
          variant="secondary"
          className={cn("transition-all duration-200", isDragging && "scale-110 bg-primary text-primary-foreground")}
        >
          {value}
        </Badge>
      </div>

      <div className="relative">
        {/* Visual markers */}
        <div className="flex justify-between mb-2 px-1">
          {[min, Math.floor((max - min) / 2) + min, max].map((marker) => (
            <div
              key={marker}
              className={cn(
                "text-xs transition-colors",
                value === marker ? "text-primary font-semibold" : "text-muted-foreground",
              )}
            >
              {marker}
            </div>
          ))}
        </div>

        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          className="relative"
        />

        {/* Progress indicator */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-primary transition-all duration-300" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
