import * as z from "zod"

// BRC-20 Token Validation
export const deployTokenSchema = z.object({
  ticker: z
    .string()
    .min(1, "Ticker is required")
    .min(5, "Ticker must be more than 4 characters (minimum 5)")
    .transform((val) => val.toUpperCase()),
  maxSupply: z
    .string()
    .min(1, "Max supply is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Max supply must be a positive number",
    })
    .refine((val) => Number.parseFloat(val) <= 21000000000, {
      message: "Max supply cannot exceed 21 billion",
    }),
  mintLimit: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0), {
      message: "Mint limit must be a positive number",
    }),
})

// Token Transfer Validation
export const transferTokenSchema = z.object({
  ticker: z
    .string()
    .min(1, "Token is required")
    .min(5, "Ticker must be more than 4 characters (minimum 5)")
    .transform((val) => val.toUpperCase()),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  recipient: z
    .string()
    .min(1, "Recipient address is required")
    .regex(/^(bc1|tb1|bcrt1)[a-zA-HJ-NP-Z0-9]{39,87}$/, "Invalid Bitcoin address format"),
})

export type DeployTokenFormData = z.infer<typeof deployTokenSchema>
export type TransferTokenFormData = z.infer<typeof transferTokenSchema>
