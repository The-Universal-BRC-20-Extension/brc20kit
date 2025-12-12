"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    const drawDotGrid = (time: number) => {
      const dotSize = 1
      const spacing = 40
      const offset = (time * 0.005) % spacing

      ctx.fillStyle = "rgba(100, 116, 139, 0.04)"
      for (let x = -offset; x < canvas.width + spacing; x += spacing) {
        for (let y = -offset; y < canvas.height + spacing; y += spacing) {
          ctx.beginPath()
          ctx.arc(x, y, dotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const orbs: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []
    for (let i = 0; i < 3; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: 150 + Math.random() * 100,
      })
    }

    const drawOrbs = () => {
      orbs.forEach((orb, index) => {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < 0 || orb.x > canvas.width) orb.vx *= -1
        if (orb.y < 0 || orb.y > canvas.height) orb.vy *= -1

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size)

        if (index === 0) {
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.03)")
          gradient.addColorStop(1, "rgba(139, 92, 246, 0)")
        } else if (index === 1) {
          gradient.addColorStop(0, "rgba(20, 184, 166, 0.02)")
          gradient.addColorStop(1, "rgba(20, 184, 166, 0)")
        } else {
          gradient.addColorStop(0, "rgba(100, 116, 139, 0.04)")
          gradient.addColorStop(1, "rgba(100, 116, 139, 0)")
        }

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawDotGrid(time)
      drawOrbs()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }} />
  )
}
