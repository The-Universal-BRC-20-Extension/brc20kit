"use client"

import { useState, useEffect, useRef } from "react"
import { GlassCard } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, AlertCircle, Loader2, Info } from "lucide-react"
import type { ChainedPSBT } from "@/lib/brc20-mint"
import { cn } from "@/lib/utils"

interface ChainVisualizerProps {
  psbts: ChainedPSBT[]
  currentIndex?: number
  signedIndices?: number[]
  failedIndices?: number[]
}

export function EnhancedChainVisualizer({
  psbts,
  currentIndex = -1,
  signedIndices = [],
  failedIndices = [],
}: ChainVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = 100 * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener("resize", resize)

    let animationFrameId: number
    let particles: Array<{ x: number; y: number; vx: number; alpha: number }> = []

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, 100)

      // Draw connection lines
      const nodeSpacing = canvas.offsetWidth / (psbts.length + 1)
      for (let i = 0; i < psbts.length - 1; i++) {
        const x1 = nodeSpacing * (i + 1)
        const x2 = nodeSpacing * (i + 2)
        const y = 50

        const isSigned = signedIndices.includes(i) && signedIndices.includes(i + 1)
        ctx.strokeStyle = isSigned ? "#9333ea" : "rgba(147, 51, 234, 0.2)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y)
        ctx.lineTo(x2, y)
        ctx.stroke()
      }

      // Animate particles along signed connections
      if (currentIndex >= 0) {
        const nodeSpacing = canvas.offsetWidth / (psbts.length + 1)
        const startX = nodeSpacing * (currentIndex + 1)
        const endX = nodeSpacing * (currentIndex + 2)

        if (Math.random() < 0.1 && currentIndex < psbts.length - 1) {
          particles.push({
            x: startX,
            y: 50,
            vx: 2,
            alpha: 1,
          })
        }

        particles = particles.filter((p) => {
          p.x += p.vx
          p.alpha -= 0.01

          if (p.alpha > 0 && p.x < endX) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(147, 51, 234, ${p.alpha})`
            ctx.fill()
            return true
          }
          return false
        })
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [psbts.length, currentIndex, signedIndices])

  const getNodeStatus = (index: number) => {
    if (failedIndices.includes(index)) return "failed"
    if (signedIndices.includes(index)) return "signed"
    if (index === currentIndex) return "current"
    if (index < currentIndex) return "processing"
    return "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "current":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "processing":
        return <Circle className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chain Visualization</h3>
            <Badge variant="secondary">
              {signedIndices.length} / {psbts.length} Complete
            </Badge>
          </div>

          {/* Canvas for animated connections */}
          <div className="relative">
            <canvas ref={canvasRef} className="w-full h-[100px]" />
          </div>

          {/* Node grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {psbts.map((psbt, index) => {
              const status = getNodeStatus(index)
              const isSelected = selectedNode === index

              return (
                <button
                  key={index}
                  onClick={() => setSelectedNode(isSelected ? null : index)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300 text-left hover-lift",
                    status === "signed" && "border-green-500 bg-green-50 dark:bg-green-950",
                    status === "current" && "border-primary bg-primary/10 ring-4 ring-primary/20",
                    status === "failed" && "border-red-500 bg-red-50 dark:bg-red-950",
                    status === "processing" && "border-blue-500 bg-blue-50 dark:bg-blue-950",
                    status === "pending" && "border-border bg-background",
                    isSelected && "scale-105 shadow-lg",
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-sm font-medium truncate">{psbt.mintAmount}</div>
                  <div className="text-xs text-muted-foreground">{psbt.fee} sats</div>
                </button>
              )
            })}
          </div>

          {/* Selected node details */}
          {selectedNode !== null && (
            <div className="p-4 rounded-lg bg-accent/50 border bounce-in">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">Transaction #{selectedNode + 1}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-medium">{psbts[selectedNode].mintAmount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="ml-2 font-medium">{psbts[selectedNode].fee} sats</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium capitalize">{getNodeStatus(selectedNode)}</span>
                    </div>
                    {psbts[selectedNode].dependsOn !== null && (
                      <div>
                        <span className="text-muted-foreground">Depends on:</span>
                        <span className="ml-2 font-medium">#{psbts[selectedNode].dependsOn! + 1}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
