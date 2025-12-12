# Developer Guide - Working with AI Agent
## Complete Implementation Guide for Public Release

**Target**: Ship-ready SDK in 2-4 hours with AI agent assistance  
**Date**: January 2025

---

## 🎯 Quick Start for Developer + AI Agent

### Step 1: Read This Guide + Roadmap

**Developer Actions**:
1. Read `docs/PUBLIC_RELEASE_ROADMAP.md` - Complete roadmap
2. Read `docs/ARCHITECTURE_VERIFICATION_REPORT.md` - Current status
3. Read this guide - Implementation steps

**AI Agent Context**:
- The agent should read `.cursorrules` for coding guidelines
- The agent should read `docs/PUBLIC_RELEASE_ROADMAP.md` for requirements
- The agent should read `docs/ARCHITECTURE_VERIFICATION_REPORT.md` for current state

---

## 📋 Implementation Checklist (2-4 Hours Total)

### Phase 1: Configuration System (1-2 hours)

#### Task 1.1: Create `.env.example` (5 min)

**Developer Prompt for AI Agent**:
\`\`\`
Create a .env.example file at the root of the project with all required environment variables.

Required variables:
- NEXT_PUBLIC_DEFAULT_TICKER (token ticker, e.g., "MYTOKEN")
- NEXT_PUBLIC_DEFAULT_AMOUNT (amount per mint, e.g., "1000")
- NEXT_PUBLIC_DEFAULT_FEE_RATE (default fee rate, e.g., 10)
- COMMISSION_WALLET_ADDRESS (platform fees address, e.g., "bc1...")
- COMMISSION_AMOUNT_BTC (commission amount in BTC, e.g., "0.0001")
- SIMPLICITY_API_SECRET (API secret for UTXO provider)

Optional variables:
- NEXT_PUBLIC_NETWORK (mainnet or testnet, default: mainnet)
- NEXT_PUBLIC_SIMPLICITY_API_URL (default: https://sdk.txspam.lol)

Add clear comments explaining each variable. Follow the format from existing .env files in Next.js projects.
\`\`\`

**Expected Output**:
\`\`\`bash
# ============================================
# Universal BRC-20 Mint Portal Configuration
# ============================================

# Token Configuration (REQUIRED)
NEXT_PUBLIC_DEFAULT_TICKER=MYTOKEN
NEXT_PUBLIC_DEFAULT_AMOUNT=1000
NEXT_PUBLIC_DEFAULT_FEE_RATE=10

# Platform Fees Configuration (REQUIRED)
COMMISSION_WALLET_ADDRESS=bc1your_bitcoin_address_here
COMMISSION_AMOUNT_BTC=0.0001  # 10,000 sats per first mint

# API Configuration (REQUIRED)
SIMPLICITY_API_SECRET=your-api-secret-here

# Network Configuration (OPTIONAL)
NEXT_PUBLIC_NETWORK=mainnet  # Options: mainnet | testnet

# API URL (OPTIONAL - uses default if not set)
NEXT_PUBLIC_SIMPLICITY_API_URL=https://sdk.txspam.lol
\`\`\`

**Verification**:
- [ ] File created at root
- [ ] All required variables included
- [ ] Comments are clear
- [ ] Format matches Next.js conventions

---

#### Task 1.2: Create `config/token.config.ts` (10 min)

**Developer Prompt for AI Agent**:
\`\`\`
Create a new file config/token.config.ts that centralizes token configuration from environment variables.

Requirements:
1. Define a TokenConfig interface with:
   - defaultTicker: string
   - defaultAmount: string
   - defaultNumMints: number (default: 1)
   - defaultFeeRate: number (default: 10)
   - feesAddress: string | undefined (from COMMISSION_WALLET_ADDRESS)
   - feesAmountSats: number (from COMMISSION_AMOUNT_BTC, convert to sats)
   - projectName: string (optional, default: "BRC-20 Mint Portal")
   - projectDescription: string (optional)
   - network: 'mainnet' | 'testnet'

2. Export a tokenConfig object that reads from process.env
3. Handle conversion of COMMISSION_AMOUNT_BTC to satoshis (multiply by 100000000)
4. Add validation for required fields
5. Use proper TypeScript types

Follow the pattern from lib/config.ts but extend it for token-specific config.
\`\`\`

**Expected Output**:
\`\`\`typescript
/**
 * Token Configuration
 * 
 * Centralizes token configuration from environment variables.
 * Users can customize their token by setting these variables in Vercel or .env.local
 */

export interface TokenConfig {
  // Token defaults (from env vars)
  defaultTicker: string
  defaultAmount: string
  defaultNumMints: number
  defaultFeeRate: number
  
  // Platform fees
  feesAddress?: string
  feesAmountSats: number
  
  // Branding
  projectName: string
  projectDescription: string
  
  // Network
  network: 'mainnet' | 'testnet'
}

export const tokenConfig: TokenConfig = {
  defaultTicker: process.env.NEXT_PUBLIC_DEFAULT_TICKER || '',
  defaultAmount: process.env.NEXT_PUBLIC_DEFAULT_AMOUNT || '',
  defaultNumMints: Number(process.env.NEXT_PUBLIC_DEFAULT_NUM_MINTS) || 1,
  defaultFeeRate: Number(process.env.NEXT_PUBLIC_DEFAULT_FEE_RATE) || 10,
  
  feesAddress: process.env.COMMISSION_WALLET_ADDRESS,
  feesAmountSats: process.env.COMMISSION_AMOUNT_BTC
    ? Math.floor(Number.parseFloat(process.env.COMMISSION_AMOUNT_BTC) * 100000000)
    : 0,
  
  projectName: process.env.NEXT_PUBLIC_PROJECT_NAME || 'BRC-20 Mint Portal',
  projectDescription: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION || 'Mint Universal BRC-20 tokens easily',
  
  network: (process.env.NEXT_PUBLIC_NETWORK || 'mainnet') as 'mainnet' | 'testnet'
}

// Validation
if (!tokenConfig.defaultTicker && process.env.NODE_ENV === 'production') {
  console.warn('[brc20kit] ⚠️ NEXT_PUBLIC_DEFAULT_TICKER not set - users will need to enter ticker manually')
}

if (!tokenConfig.feesAddress && process.env.NODE_ENV === 'production') {
  console.warn('[brc20kit] ⚠️ COMMISSION_WALLET_ADDRESS not set - platform fees disabled')
}
\`\`\`

**Verification**:
- [ ] File created in `config/` directory
- [ ] Interface defined correctly
- [ ] Environment variables read properly
- [ ] BTC to sats conversion correct
- [ ] TypeScript types are correct
- [ ] Validation warnings added

---

#### Task 1.3: Update `app/mint/page.tsx` (15 min)

**Developer Prompt for AI Agent**:
\`\`\`
Update app/mint/page.tsx to use tokenConfig defaults instead of empty strings.

Current state (lines 37-40):
- ticker: useState("") -> should use tokenConfig.defaultTicker
- amount: useState("") -> should use tokenConfig.defaultAmount
- numMints: useState(1) -> should use tokenConfig.defaultNumMints
- selectedFeeRate: useState(10) -> should use tokenConfig.defaultFeeRate

Requirements:
1. Import tokenConfig from '@/config/token.config'
2. Replace empty string defaults with tokenConfig values
3. Keep the ability for users to modify values via UI
4. Ensure TypeScript types are correct
5. Don't break existing functionality

Follow the .cursorrules guidelines for React and TypeScript.
\`\`\`

**Expected Changes**:
\`\`\`typescript
// Add import at top
import { tokenConfig } from '@/config/token.config'

// Update useState calls (around line 37-40)
const [ticker, setTicker] = useState(tokenConfig.defaultTicker)
const [amount, setAmount] = useState(tokenConfig.defaultAmount)
const [numMints, setNumMints] = useState(tokenConfig.defaultNumMints)
const [selectedFeeRate, setSelectedFeeRate] = useState<number>(tokenConfig.defaultFeeRate)
\`\`\`

**Verification**:
- [ ] Import added correctly
- [ ] All useState calls updated
- [ ] No TypeScript errors
- [ ] UI still allows user modification
- [ ] Defaults appear when page loads

---

#### Task 1.4: Verify Platform Fees (Already Done)

**Status**: ✅ **Already Implemented**

The platform fees system is already fully functional using:
- `COMMISSION_WALLET_ADDRESS` (env var)
- `COMMISSION_AMOUNT_BTC` (env var)
- Implemented in `lib/brc20-mint.ts` and `lib/brc20-psbt-builder.ts`

**No changes needed** - the system works correctly.

---

### Phase 2: Documentation (1 hour)

#### Task 2.1: Create `docs/GETTING_STARTED.md` (15 min)

**Developer Prompt for AI Agent**:
\`\`\`
Create docs/GETTING_STARTED.md - a 5-minute quick start guide for developers who want to deploy this SDK.

Structure:
1. Overview (what this SDK is)
2. Prerequisites (Node.js, GitHub account, Vercel account)
3. Quick Start (5 steps):
   - Fork repository
   - Clone locally
   - Configure environment variables
   - Deploy on Vercel
   - Customize with Cursor
4. Next Steps (link to QUICK_START.md and other docs)

Keep it concise, visual, and focused on getting started quickly. Use clear headings and code blocks.
Reference the Universal Protocol docs and Blacknode docs for advanced topics.
\`\`\`

**Expected Content**:
- Clear step-by-step instructions
- Code examples for configuration
- Links to external resources
- Visual flow diagram (optional)

**Verification**:
- [ ] File created
- [ ] All steps are clear
- [ ] Code examples work
- [ ] Links are correct

---

#### Task 2.2: Create `docs/QUICK_START.md` (10 min)

**Developer Prompt for AI Agent**:
\`\`\`
Create docs/QUICK_START.md - a minimal setup guide for the absolute fastest path to deployment.

Focus on:
1. Fork → Vercel → Configure → Deploy (4 steps)
2. Minimal configuration (only required env vars)
3. Common issues and quick fixes
4. Link to GETTING_STARTED.md for details

Keep it under 2 pages. Make it scannable with bullet points.
\`\`\`

**Verification**:
- [ ] File created
- [ ] Under 2 pages
- [ ] Scannable format
- [ ] Links to other docs

---

#### Task 2.3: Update `README.md` (10 min)

**Developer Prompt for AI Agent**:
\`\`\`
Update README.md to add a prominent "Quick Start" section at the top, right after the "Key Features" section.

Add:
1. Quick Start section with link to docs/GETTING_STARTED.md
2. Link to docs/QUICK_START.md for minimal setup
3. Update installation section to reference .env.example
4. Add note about AI agent workflow (optional)

Keep existing content but reorganize for better flow.
\`\`\`

**Verification**:
- [ ] Quick Start section added
- [ ] Links work correctly
- [ ] Installation updated
- [ ] Existing content preserved

---

### Phase 3: Testing & Verification (30 min)

#### Task 3.1: Test Configuration (15 min)

**Developer Actions**:
1. Copy `.env.example` to `.env.local`
2. Fill in test values
3. Start dev server: `npm run dev`
4. Verify defaults appear in mint page
5. Test wallet connection
6. Test minting flow

**AI Agent Can Help**:
- Create test script to validate config
- Check for TypeScript errors
- Verify environment variable reading

---

#### Task 3.2: Test Documentation (15 min)

**Developer Actions**:
1. Follow `GETTING_STARTED.md` from scratch
2. Verify all steps work
3. Check all links
4. Test on fresh clone

**AI Agent Can Help**:
- Validate markdown syntax
- Check all links
- Verify code examples

---

## 🤖 AI Agent Workflow

### For the Developer

**When working with AI agent, provide this context**:

\`\`\`
I'm implementing the public release roadmap for this BRC-20 mint portal SDK.

Current status:
- Platform fees system: ✅ Already implemented (uses COMMISSION_WALLET_ADDRESS)
- Wallet integration: ✅ Complete (Phantom works via LaserEyes)
- Chained minting: ✅ Complete
- Configuration system: ❌ Missing (needs .env.example + config/token.config.ts)
- Documentation: ⚠️ Partial (needs GETTING_STARTED.md + QUICK_START.md)

Please help me implement the missing pieces following the roadmap in docs/PUBLIC_RELEASE_ROADMAP.md.

Read .cursorrules for coding guidelines.
Read docs/ARCHITECTURE_VERIFICATION_REPORT.md for current implementation details.
\`\`\`

### For the AI Agent

**Agent should**:
1. Read `.cursorrules` first (coding guidelines)
2. Read `docs/PUBLIC_RELEASE_ROADMAP.md` (requirements)
3. Read `docs/ARCHITECTURE_VERIFICATION_REPORT.md` (current state)
4. Read this guide (implementation steps)
5. Follow tasks in order
6. Verify each task before moving to next
7. Ask for clarification if needed

**Agent Guidelines**:
- ✅ Follow TypeScript strict mode
- ✅ Use existing patterns from codebase
- ✅ Preserve functionality while adding features
- ✅ Add proper error handling
- ✅ Include validation where needed
- ✅ Write clear comments
- ✅ Test changes before completing

---

## 📝 Task Completion Checklist

### Phase 1: Configuration (1-2 hours)
- [ ] `.env.example` created with all variables
- [ ] `config/token.config.ts` created and working
- [ ] `app/mint/page.tsx` updated to use config
- [ ] No TypeScript errors
- [ ] Defaults appear in UI

### Phase 2: Documentation (1 hour)
- [ ] `docs/GETTING_STARTED.md` created
- [ ] `docs/QUICK_START.md` created
- [ ] `README.md` updated with Quick Start
- [ ] All links work
- [ ] Code examples are correct

### Phase 3: Testing (30 min)
- [ ] Configuration tested locally
- [ ] Documentation tested from scratch
- [ ] All features still work
- [ ] Ready for deployment

---

## 🚀 Deployment Checklist

### Before Pushing to GitHub

- [ ] All tasks completed
- [ ] Tests pass locally
- [ ] Documentation reviewed
- [ ] No console errors
- [ ] TypeScript compiles without errors

### After Deployment on Vercel

- [ ] Environment variables configured in Vercel
- [ ] Site deploys successfully
- [ ] Defaults appear correctly
- [ ] Wallet connection works
- [ ] Minting flow works

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Defaults not appearing
- **Check**: Environment variables set in Vercel
- **Check**: Variables prefixed with `NEXT_PUBLIC_` for client-side
- **Fix**: Restart dev server after changing .env.local

**Issue**: TypeScript errors
- **Check**: `config/token.config.ts` types are correct
- **Check**: Import paths use `@/` alias
- **Fix**: Run `npm run build` to see all errors

**Issue**: Commission not working
- **Check**: `COMMISSION_WALLET_ADDRESS` is set
- **Check**: `COMMISSION_AMOUNT_BTC` is valid number
- **Fix**: Verify address format (bc1 for mainnet, tb1 for testnet)

---

## 📚 Additional Resources

- **Roadmap**: `docs/PUBLIC_RELEASE_ROADMAP.md`
- **Architecture**: `docs/ARCHITECTURE_VERIFICATION_REPORT.md`
- **Coding Rules**: `.cursorrules`
- **Project Status**: `docs/PROJECT_STATUS.md`
- **Universal Protocol**: [Link to Universal docs]
- **Blacknode Docs**: https://www.blacknode.co/docs

---

## ✅ Success Criteria

**Project is release-ready when**:
1. ✅ Configuration system works (defaults appear)
2. ✅ Documentation is complete (Quick Start guides exist)
3. ✅ All tests pass (manual testing done)
4. ✅ No critical errors
5. ✅ Deployment works on Vercel

**Estimated Time**: 2-4 hours with AI agent assistance

---

**Last Updated**: January 2025  
**Version**: 1.0
