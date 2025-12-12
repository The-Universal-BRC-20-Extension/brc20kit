/**
 * API Route Tests for UTXO Endpoint
 * 
 * Tests for POST /api/utxos with real mainnet addresses
 */

import { describe, it, expect, beforeEach } from "@jest/globals"
import { POST } from "@/app/api/utxos/route"
import { NextRequest } from "next/server"

describe("POST /api/utxos", () => {
  const realAddress = "bc1p2p6d0pzwhz5g0u002em0uj303hmhkh3gqs2nh6hxuw90rwkzg5nsatsphn"
  const realTxid = "3c26a48530f99a8a3517ed8459b1fb1ffd413e691cfa0a9164d3193387b7de1b"

  beforeEach(() => {
    process.env.UNISAT_API_TOKEN = "test-token"
    process.env.UNISAT_API_URL = "https://open-api.unisat.io"
  })

  it("should return UTXOs successfully for real P2TR address", async () => {
    ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        msg: "OK",
        data: {
          cursor: 0,
          total: 1,
          utxo: [
            {
              txid: realTxid,
              vout: 2,
              satoshi: 100000,
              scriptPk: "51" + "0".repeat(64), // P2TR scriptPubKey (33 bytes: OP_1 + 32 bytes)
              address: realAddress,
            },
          ],
        },
      }),
    })

    const request = new NextRequest("http://localhost/api/utxos", {
      method: "POST",
      body: JSON.stringify({ address: realAddress }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].txid).toBe(realTxid)
    expect(data.data[0].vout).toBe(2)
    expect(data.provider).toBe("unisat")
  })

  it("should return error when token is missing", async () => {
    delete process.env.UNISAT_API_TOKEN

    const request = new NextRequest("http://localhost/api/utxos", {
      method: "POST",
      body: JSON.stringify({ address: realAddress }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain("UNISAT_API_TOKEN")
  })

  it("should return error when address is missing", async () => {
    const request = new NextRequest("http://localhost/api/utxos", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain("Address is required")
  })
})
