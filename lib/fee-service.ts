// Fee Service - Fetches dynamic fee rates from mempool.space API

import { config } from "./config"

export interface MempoolFeeRates {
  fastestFee: number // ~10 min
  halfHourFee: number // ~30 min
  hourFee: number // ~60 min
  economyFee: number // ~4+ hours
  minimumFee: number
}

export interface FeeRecommendation {
  rate: number
  priority: "economy" | "low" | "medium" | "high" | "fastest"
  estimatedTime: string
  source: "mempool" | "fallback"
}

export class FeeService {
  private static cachedFees: MempoolFeeRates | null = null
  private static lastFetch = 0
  private static readonly CACHE_DURATION = 60000 // 1 minute

  /**
   * Fetch current fee rates from mempool.space API
   * Throws error if fetch fails - no fallback
   */
  static async fetchFeeRates(): Promise<MempoolFeeRates> {
    try {
      const baseUrl =
        config.network === "mainnet" ? "https://mempool.space/api/v1" : "https://mempool.space/testnet/api/v1"

      const response = await fetch(`${baseUrl}/fees/recommended`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Mempool API returned ${response.status}`)
      }

      const fees: MempoolFeeRates = await response.json()

      // Cache the fees
      this.cachedFees = fees
      this.lastFetch = Date.now()

      return fees
    } catch (error) {
      console.error("Failed to fetch mempool fees:", error)
      throw new Error("Failed to fetch fee rates from mempool. Please try again.")
    }
  }

  /**
   * Get cached fee rates or fetch fresh if cache expired
   */
  static async getFeeRates(forceRefresh = false): Promise<MempoolFeeRates> {
    const now = Date.now()
    const cacheValid = this.cachedFees && now - this.lastFetch < this.CACHE_DURATION

    if (!forceRefresh && cacheValid && this.cachedFees) {
      return this.cachedFees
    }

    return await this.fetchFeeRates()
  }

  /**
   * Get fee recommendation based on priority level
   */
  static async getRecommendation(
    priority: "economy" | "low" | "medium" | "high" | "fastest",
  ): Promise<FeeRecommendation> {
    const fees = await this.getFeeRates()

    const recommendations = {
      economy: {
        rate: fees.economyFee,
        estimatedTime: "~2-4 hours",
      },
      low: {
        rate: fees.hourFee,
        estimatedTime: "~1 hour",
      },
      medium: {
        rate: fees.halfHourFee,
        estimatedTime: "~30 minutes",
      },
      high: {
        rate: Math.ceil((fees.halfHourFee + fees.fastestFee) / 2),
        estimatedTime: "~15 minutes",
      },
      fastest: {
        rate: fees.fastestFee,
        estimatedTime: "~10 minutes",
      },
    }

    const rec = recommendations[priority]

    return {
      rate: rec.rate,
      priority,
      estimatedTime: rec.estimatedTime,
      source: this.cachedFees ? "mempool" : "fallback",
    }
  }

  /**
   * Get all fee recommendations at once
   */
  static async getAllRecommendations(): Promise<Record<string, FeeRecommendation>> {
    const fees = await this.getFeeRates()

    return {
      economy: {
        rate: fees.economyFee,
        priority: "economy",
        estimatedTime: "~2-4 hours",
        source: this.cachedFees ? "mempool" : "fallback",
      },
      low: {
        rate: fees.hourFee,
        priority: "low",
        estimatedTime: "~1 hour",
        source: this.cachedFees ? "mempool" : "fallback",
      },
      medium: {
        rate: fees.halfHourFee,
        priority: "medium",
        estimatedTime: "~30 minutes",
        source: this.cachedFees ? "mempool" : "fallback",
      },
      fastest: {
        rate: fees.fastestFee,
        priority: "fastest",
        estimatedTime: "~10 minutes",
        source: this.cachedFees ? "mempool" : "fallback",
      },
    }
  }

  /**
   * Estimate confirmation time based on fee rate
   */
  static estimateConfirmationTime(feeRate: number, currentFees: MempoolFeeRates): string {
    if (feeRate >= currentFees.fastestFee) {
      return "~10 minutes"
    } else if (feeRate >= currentFees.halfHourFee) {
      return "~30 minutes"
    } else if (feeRate >= currentFees.hourFee) {
      return "~1 hour"
    } else if (feeRate >= currentFees.economyFee) {
      return "~2-4 hours"
    } else {
      return "~4+ hours (very slow)"
    }
  }

  /**
   * Get mempool congestion level
   */
  static getCongestionLevel(fees: MempoolFeeRates): {
    level: "low" | "medium" | "high" | "extreme"
    description: string
  } {
    const fastestFee = fees.fastestFee

    if (fastestFee < 10) {
      return {
        level: "low",
        description: "Network is calm, fees are low",
      }
    } else if (fastestFee < 50) {
      return {
        level: "medium",
        description: "Normal network activity",
      }
    } else if (fastestFee < 100) {
      return {
        level: "high",
        description: "Network is busy, higher fees",
      }
    } else {
      return {
        level: "extreme",
        description: "Network congestion, very high fees",
      }
    }
  }

  /**
   * Clear cached fees (useful for force refresh)
   */
  static clearCache(): void {
    this.cachedFees = null
    this.lastFetch = 0
  }

  /**
   * Get all fee tiers with labels
   */
  static getFeeOptions(fees: MempoolFeeRates): Array<{
    id: string
    label: string
    rate: number
    estimatedTime: string
    description: string
  }> {
    return [
      {
        id: "slow",
        label: "Slow",
        rate: fees.hourFee,
        estimatedTime: "~1 hour",
        description: "Low cost with reasonable wait",
      },
      {
        id: "medium",
        label: "Medium",
        rate: fees.halfHourFee,
        estimatedTime: "~30 minutes",
        description: "Balanced cost and speed",
      },
      {
        id: "fast",
        label: "Fast",
        rate: fees.fastestFee,
        estimatedTime: "~10 minutes",
        description: "Fastest confirmation, higher cost",
      },
    ]
  }
}
