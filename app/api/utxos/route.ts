import { type NextRequest, NextResponse } from "next/server"
import { UnisatUTXOProvider } from "@/lib/utxo-providers/unisat-provider"

// POST /api/utxos - Fetch UTXOs for an address via Unisat API
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      console.error("[SERVER] Missing address in request")
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }

    const apiToken = process.env.UNISAT_API_TOKEN
    const apiUrl = process.env.UNISAT_API_URL || "https://open-api.unisat.io"

    console.log("[SERVER] 🔧 Configuration check:")
    console.log("  - API URL:", apiUrl)
    console.log("  - API Token:", apiToken ? "✅ Set (length: " + apiToken.length + ")" : "❌ Not set")

    if (!apiToken) {
      console.error("[SERVER] ❌ UNISAT_API_TOKEN not configured")
      return NextResponse.json(
        {
          success: false,
          error: "UNISAT_API_TOKEN is required. Get your token from https://open-api.unisat.io",
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] 🌐 Making request to Unisat API:")
    console.log("  - Address:", address)
    console.log("  - Endpoint: /v1/indexer/address/{address}/available-utxo-data")

    try {
      const provider = new UnisatUTXOProvider(apiUrl, apiToken)
      const utxos = await provider.getUTXOs(address)

      console.log("[SERVER] ✅ Successfully fetched", utxos.length, "UTXOs from Unisat API")
      
      return NextResponse.json({
        success: true,
        data: utxos,
        provider: "unisat",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("[SERVER] ❌ Unisat API error:", errorMessage)
      
      return NextResponse.json(
        {
          success: false,
          error: `Unisat API request failed: ${errorMessage}`,
          details: errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    console.error("[SERVER] ❌ Exception in UTXO route:", error)
    if (error instanceof Error) {
      console.error("[SERVER] Error details:", error.message)
      console.error("[SERVER] Stack trace:", error.stack)
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
