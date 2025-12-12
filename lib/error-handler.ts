export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
    public details?: any,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class WalletError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "WALLET_ERROR", 400, details)
    this.name = "WalletError"
  }
}

export class TransactionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "TRANSACTION_ERROR", 400, details)
    this.name = "TransactionError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details)
    this.name = "ValidationError"
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "NETWORK_ERROR", 503, details)
    this.name = "NetworkError"
  }
}

export function handleError(error: unknown): { message: string; code: string; details?: any } {
  console.error("[brc20kit] Error occurred:", error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    // Handle specific error patterns
    if (error.message.includes("not installed") || error.message.includes("not found")) {
      return {
        message: "Wallet extension not found. Please install Xverse wallet.",
        code: "WALLET_NOT_FOUND",
      }
    }

    if (error.message.includes("rejected") || error.message.includes("cancelled")) {
      return {
        message: "Transaction was cancelled by user.",
        code: "USER_CANCELLED",
      }
    }

    if (error.message.includes("insufficient")) {
      return {
        message: "Insufficient balance to complete transaction.",
        code: "INSUFFICIENT_BALANCE",
      }
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return {
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      }
    }

    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
    }
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
  }
}

export function getErrorMessage(error: unknown): string {
  return handleError(error).message
}
