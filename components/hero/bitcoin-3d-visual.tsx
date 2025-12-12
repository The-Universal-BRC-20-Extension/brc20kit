"use client"

import { useEffect, useRef } from "react"

export function Bitcoin3DVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let rotation = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener("resize", resize)

    const drawGeometricPattern = (x: number, y: number, size: number, rot: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot)

      // Outer hexagon with neutral gradient
      const gradient = ctx.createLinearGradient(-size, -size, size, size)
      gradient.addColorStop(0, "rgba(30, 41, 59, 0.4)") // Deep slate
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.3)") // Muted purple
      gradient.addColorStop(1, "rgba(30, 41, 59, 0.2)") // Deep slate

      // Draw hexagon
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const px = Math.cos(angle) * size
        const py = Math.sin(angle) * size
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Inner geometric lines (circuit-inspired)
      ctx.strokeStyle = "rgba(139, 92, 246, 0.5)" // Muted purple accent
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-size * 0.5, 0)
      ctx.lineTo(size * 0.5, 0)
      ctx.moveTo(0, -size * 0.5)
      ctx.lineTo(0, size * 0.5)
      ctx.stroke()

      // Corner nodes
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const px = Math.cos(angle) * size * 0.7
        const py = Math.sin(angle) * size * 0.7

        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(139, 92, 246, 0.8)"
        ctx.fill()
      }

      ctx.restore()
    }

    const drawFloatingParticles = (time: number) => {
      const particles = 30
      for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2 + time * 0.0003
        const distance = 80 + Math.sin(time * 0.001 + i) * 40
        const x = canvas.offsetWidth / 2 + Math.cos(angle) * distance
        const y = canvas.offsetHeight / 2 + Math.sin(angle) * distance
        const size = 1.5 + Math.sin(time * 0.002 + i) * 0.5

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        // Alternate between slate and muted purple
        const opacity = 0.2 + Math.sin(time * 0.003 + i) * 0.15
        ctx.fillStyle =
          i % 2 === 0
            ? `rgba(100, 116, 139, ${opacity})` // Cool gray
            : `rgba(139, 92, 246, ${opacity})` // Muted purple
        ctx.fill()
      }
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Draw floating particles
      drawFloatingParticles(time)

      // Draw main geometric pattern with rotation
      rotation += 0.003
      drawGeometricPattern(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 70, rotation)

      // Draw smaller orbiting patterns
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + rotation * 0.5
        const distance = 140
        const x = canvas.offsetWidth / 2 + Math.cos(angle) * distance
        const y = canvas.offsetHeight / 2 + Math.sin(angle) * distance
        drawGeometricPattern(x, y, 25, -rotation * 1.5)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }} />
}
