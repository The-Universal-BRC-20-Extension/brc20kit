# Getting Started

Welcome to the Universal BRC-20 Mint Portal. This guide will help you deploy your own customizable BRC-20 minting portal in 5 minutes.

---

## Quick Deployment (Vercel)

### 1. Fork Repository

Fork this repository to your GitHub account.

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select your forked repository
4. Add environment variables (see below)
5. Click "Deploy"
6. Wait 1-2 minutes
7. Visit your deployed URL

### 3. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

**Required**:
\`\`\`
NEXT_PUBLIC_NETWORK=mainnet
SIMPLICITY_API_SECRET=your_api_secret
\`\`\`

**Optional - Platform Fees**:
\`\`\`
NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS=bc1q_your_address
NEXT_PUBLIC_COMMISSION_AMOUNT_BTC=0.00000330
\`\`\`

**Optional - Branding**:
\`\`\`
NEXT_PUBLIC_PROJECT_NAME=YourProject
NEXT_PUBLIC_LOGO_URL=https://yourdomain.com/logo.svg
\`\`\`

**Optional - Defaults**:
\`\`\`
NEXT_PUBLIC_DEFAULT_TICKER=MYTOKEN
NEXT_PUBLIC_DEFAULT_AMOUNT=1000
\`\`\`

---

## Local Development

### 1. Clone Repository

\`\`\`bash
git clone <your-fork-url>
cd v0-so-vault-app
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment

\`\`\`bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your editor
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

---

## Configuration Guide

### Required Settings

**Network Configuration**:
\`\`\`env
NEXT_PUBLIC_NETWORK=mainnet  # or testnet
\`\`\`

**API Configuration**:
\`\`\`env
NEXT_PUBLIC_SIMPLICITY_API_URL=https://api.simplicity.network
SIMPLICITY_API_SECRET=your_secret_here
\`\`\`

### Platform Fees (Optional)

Add these to collect fees on the first mint:

\`\`\`env
# Your Bitcoin address (any type: bc1q, bc1p, 1, 3)
NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS=bc1q5mcc25rmqrwnqv9jp9wudc2mh6hx7u2273vzyk

# Commission amount in BTC (330 sats = 0.00000330 BTC)
NEXT_PUBLIC_COMMISSION_AMOUNT_BTC=0.00000330

# Only needed for Taproot (bc1p...) addresses
COMMISSION_SCRIPT_PUBKEY=512014a3b2c1...
\`\`\`

**Note**: Commission is only charged on the FIRST mint. Subsequent mints (2-25) are free for users.

### Token Defaults (Optional)

Pre-fill the mint form with your token details:

\`\`\`env
NEXT_PUBLIC_DEFAULT_TICKER=MYTOKEN
NEXT_PUBLIC_DEFAULT_AMOUNT=1000
NEXT_PUBLIC_DEFAULT_NUM_MINTS=1
NEXT_PUBLIC_DEFAULT_FEE_RATE=10
\`\`\`

Users can still modify these values.

### Branding (Optional)

Customize the look and feel:

\`\`\`env
# Your project name (shown in header and hero)
NEXT_PUBLIC_PROJECT_NAME=MyMintPortal

# Logo URL (SVG or PNG, 200x200px recommended)
NEXT_PUBLIC_LOGO_URL=/logo.svg

# Dark mode logo (optional, uses LOGO_URL if not set)
NEXT_PUBLIC_LOGO_DARK_URL=/logo-dark.svg
\`\`\`

---

## Customization with AI

Use Cursor AI or similar tools for advanced customization:

### Example Prompts

**Change Colors**:
\`\`\`
"Change the primary color to blue (#3B82F6) and accent to orange (#F97316)"
\`\`\`

**Update Branding**:
\`\`\`
"Update the hero section to say 'Mint DOGE Tokens' and change button text to 'Start Minting DOGE'"
\`\`\`

**Modify Layout**:
\`\`\`
"Make the mint form full width on desktop and add a token info sidebar"
\`\`\`

The `.cursorrules` file guides AI assistants to follow project conventions.

---

## Architecture Overview

### Client-Side Only

All PSBT construction happens in your browser:
1. Connect wallet (Unisat, Xverse, OKX, Phantom, etc.)
2. Configure mint parameters
3. System builds chained PSBTs locally
4. Sign each PSBT with your wallet
5. Transactions broadcast automatically

**No backend server** - your keys never leave your wallet.

### Configuration Flow

\`\`\`
.env.local → config/token.config.ts → React Components
\`\`\`

All settings are centralized in `config/token.config.ts` for type safety and validation.

---

## Supported Wallets

Via LaserEyes SDK:
- Unisat Wallet
- Xverse Wallet
- OKX Wallet
- Phantom Wallet
- Magic Eden Wallet
- Leather Wallet

All wallets support the full minting flow (1-25 chained mints).

---

## Transaction Structure

### First Mint (with platform fees)
\`\`\`
Input: Your UTXO(s)
Outputs:
  1. OP_RETURN (0 sats) - BRC-20 mint data
  2. Commission (330 sats) - Platform fee
  3. Change (remaining) - Back to you
\`\`\`

### Subsequent Mints (2-25)
\`\`\`
Input: Previous mint output
Outputs:
  1. OP_RETURN (0 sats) - BRC-20 mint data
  2. Change (remaining) - Back to you
\`\`\`

**No commission on chained mints** - users only pay Bitcoin network fees.

---

## Troubleshooting

### Build Errors

**"Environment variables not found"**:
- Ensure `.env.local` exists (not `.env`)
- Restart dev server after changing environment variables
- Check variable names match exactly (case-sensitive)

**"PSBT validation failed"**:
- Verify `COMMISSION_WALLET_ADDRESS` is a valid Bitcoin address
- For Taproot addresses (bc1p...), add `COMMISSION_SCRIPT_PUBKEY`
- Check sufficient balance for fees + commission

### Deployment Issues

**"Commission not appearing"**:
- Verify environment variables are set in Vercel dashboard
- Check both `COMMISSION_WALLET_ADDRESS` and `COMMISSION_AMOUNT_BTC` are set
- Redeploy after adding variables

**"Wallet won't connect"**:
- Ensure wallet is installed and unlocked
- Check network matches (mainnet vs testnet)
- Try refreshing the page

---

## Next Steps

- **Customize branding** - Update colors, logo, and project name
- **Test minting flow** - Connect wallet and try a test mint
- **Review documentation** - See `NEXT_STEPS.md` for advanced configuration
- **Check transaction** - Verify mints on [mempool.space](https://mempool.space)

---

## Support

- **Documentation**: [NEXT_STEPS.md](NEXT_STEPS.md) for advanced setup
- **Configuration Reference**: [.env.example](.env.example) for all variables
- **Technical Guide**: `docs/BRC20_PSBT_FLOW.md` for PSBT details
- **Issues**: GitHub Issues for bugs and feature requests

---

**Ready to mint?** Visit your deployed URL and connect your wallet!
