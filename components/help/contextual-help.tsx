"use client"

import { useState } from "react"
import { HelpCircle, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HelpContent {
  title: string
  description: string
  tips: string[]
  learnMoreUrl?: string
}

interface ContextualHelpProps {
  content: HelpContent
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left"
}

export function ContextualHelp({ content, position = "bottom-right" }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4",
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed z-40 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform bg-transparent"
        style={{
          [position.includes("top") ? "top" : "bottom"]: "1rem",
          [position.includes("right") ? "right" : "left"]: "1rem",
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle help"
      >
        {isOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <Card
          className={`fixed z-30 w-80 shadow-2xl animate-in slide-in-from-bottom-4 fade-in-0 ${positionClasses[position]}`}
          style={{
            [position.includes("top") ? "top" : "bottom"]: "4.5rem",
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg">{content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Quick Tips:</h4>
              <ul className="space-y-1.5">
                {content.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            {content.learnMoreUrl && (
              <a
                href={content.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Learn more
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
