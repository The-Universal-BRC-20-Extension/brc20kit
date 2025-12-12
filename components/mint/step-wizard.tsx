"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  title: string
  description: string
}

interface StepWizardProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
}

export function StepWizard({ steps, currentStep, completedSteps }: StepWizardProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${(completedSteps.length / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
              {/* Step circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground scale-110",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110",
                  isUpcoming && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="h-5 w-5 bounce-in" /> : <span>{step.id}</span>}
              </div>

              {/* Step label */}
              <div className="text-center max-w-[120px]">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    (isCompleted || isCurrent) && "text-foreground",
                    isUpcoming && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{step.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
