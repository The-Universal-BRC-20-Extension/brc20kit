import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

// Map friendly slugs to actual file names (without .md extension)
const DOC_MAP: Record<string, string> = {
  "getting-started": "GETTING_STARTED_10_MINUTES",
  "quick-start": "QUICK_START",
  "configuration": "CONFIGURATION_GUIDE",
  "faq": "FAQ",
  "wallet-integration": "wallet-integration-guide",
  "wallet-compatibility": "wallet-compatibility",
  "psbt-builder": "PSBT_BUILDER",
  "psbt-guide": "psbt-guide", // Special case - this is a page, not a markdown file
}

// Allowed user-facing documentation files (exclude internal/sprint docs)
const ALLOWED_FILES = [
  "GETTING_STARTED_10_MINUTES.md",
  "QUICK_START.md",
  "CONFIGURATION_GUIDE.md",
  "CONFIGURATION.md",
  "FAQ.md",
  "wallet-integration-guide.md",
  "wallet-compatibility.md",
  "PSBT_BUILDER.md",
]

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    
    // Special case: psbt-guide is a page, not a markdown file
    if (slug === "psbt-guide") {
      return NextResponse.json({ error: "Use /docs/psbt-guide page" }, { status: 404 })
    }

    // Get the file name from the map
    const fileName = DOC_MAP[slug]
    if (!fileName) {
      return NextResponse.json({ error: "Documentation not found" }, { status: 404 })
    }

    // Security: Only allow user-facing docs
    const filePath = join(process.cwd(), "docs", `${fileName}.md`)
    const fileNameWithExt = `${fileName}.md`
    
    if (!ALLOWED_FILES.includes(fileNameWithExt)) {
      return NextResponse.json({ error: "Documentation not found" }, { status: 404 })
    }

    // Read the file
    let content: string
    try {
      content = await readFile(filePath, "utf-8")
    } catch (error) {
      console.error(`[Docs API] File not found: ${filePath}`, error)
      return NextResponse.json({ error: "Documentation file not found" }, { status: 404 })
    }

    return NextResponse.json({ content, fileName })
  } catch (error) {
    console.error("[Docs API] Error:", error)
    return NextResponse.json({ error: "Failed to load documentation" }, { status: 500 })
  }
}
