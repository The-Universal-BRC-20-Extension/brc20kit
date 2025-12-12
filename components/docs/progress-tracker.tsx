"use client"

import { GlassCard } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStep {
  id: string
  title: string
  completed: boolean
}

interface ProgressTrackerProps {
  steps: ProgressStep[]
  currentStep: string
}

export function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep
          const isCompleted = step.completed

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                isCurrent && "bg-primary/10 border border-primary/20",
                isCompleted && "opacity-60",
              )}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className={cn("h-5 w-5", isCurrent ? "text-primary" : "text-muted-foreground")} />
                )}
              </div>
              <div className="flex-1">
                <div className={cn("text-sm font-medium", isCurrent && "text-primary", isCompleted && "line-through")}>
                  {step.title}
                </div>
              </div>
              {isCurrent && <div className="text-xs text-primary font-medium">Current</div>}
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
