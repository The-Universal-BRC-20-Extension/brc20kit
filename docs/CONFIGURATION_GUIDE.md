# Configuration Guide

Complete reference for all environment variables and configuration options.

## Table of Contents

- [Network Configuration](#network-configuration)
- [Token Defaults](#token-defaults)
- [Platform Fees](#platform-fees)
- [Branding](#branding)
- [API Configuration](#api-configuration)
- [Advanced Options](#advanced-options)

## Network Configuration

### `NEXT_PUBLIC_NETWORK`

**Required** | Default: `mainnet`

Bitcoin network to use.

```env
NEXT_PUBLIC_NETWORK=mainnet  # or testnet
```

**Values:**
- `mainnet` - Production Bitcoin network
- `testnet` - Bitcoin testnet (for development)

## Token Defaults

Pre-fill the mint form with default values. Users can still change these.

### `NEXT_PUBLIC_DEFAULT_TICKER`

Token ticker that appears by default.

```env
NEXT_PUBLIC_DEFAULT_TICKER=SATS
```

**Note:** 4-character tickers are reserved for standard BRC-20 tokens.

### `NEXT_PUBLIC_DEFAULT_AMOUNT`

Default mint amount per transaction.

```env
NEXT_PUBLIC_DEFAULT_AMOUNT=1000
```

### `NEXT_PUBLIC_DEFAULT_FEE_RATE`

Default fee rate in sat/vB (will be overridden by live mempool data).

```env
NEXT_PUBLIC_DEFAULT_FEE_RATE=10
```

### `NEXT_PUBLIC_DEFAULT_NUM_MINTS`

Default number of mints (1-25).

```env
NEXT_PUBLIC_DEFAULT_NUM_MINTS=1
```

## Platform Fees

Configure platform fees collected on the **first mint only** of each chain.

### `NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS` or `COMMISSION_WALLET_ADDRESS`

Your Bitcoin address for collecting fees.

```env
NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS=bc1q...
```

**Supported address types:**
- P2WPKH (bc1q...) - **Recommended**
- P2SH (3...)
- P2PKH (1...)
- P2TR (bc1p...) - Requires `COMMISSION_SCRIPT_PUBKEY`

**Public vs Private:**
- `NEXT_PUBLIC_*` - Visible in browser (use for transparency)
- No prefix - Server-side only (more private)

### `NEXT_PUBLIC_COMMISSION_AMOUNT_BTC` or `COMMISSION_AMOUNT_BTC`

Commission amount in BTC.

```env
NEXT_PUBLIC_COMMISSION_AMOUNT_BTC=0.00000330  # 330 sats
```

**Recommended amounts:**
- 330 sats (0.00000330 BTC) - Standard
- 500-1000 sats - Premium features
- 100-200 sats - Basic/budget

**Important:** Both address and amount must be set for fees to work.

### `COMMISSION_SCRIPT_PUBKEY` (Optional)

ScriptPubKey in hex format. **Required for Taproot (bc1p...) addresses only.**

```env
COMMISSION_SCRIPT_PUBKEY=512014a3b2c1...
```

Get this from:
- Block explorer (decode your address)
- Bitcoin Core: `bitcoin-cli getaddressinfo bc1p...`

## Branding

Customize your portal's appearance.

### `NEXT_PUBLIC_PROJECT_NAME`

Project name displayed in header and metadata.

```env
NEXT_PUBLIC_PROJECT_NAME=MyMintPortal
```

Default: `BRC-20 Kit`

### `NEXT_PUBLIC_LOGO_URL`

URL to your logo (light mode).

```env
NEXT_PUBLIC_LOGO_URL=https://yoursite.com/logo.svg
```

Supports: SVG, PNG, JPG

### `NEXT_PUBLIC_LOGO_DARK_URL`

URL to your logo for dark mode (optional - uses `LOGO_URL` if not set).

```env
NEXT_PUBLIC_LOGO_DARK_URL=https://yoursite.com/logo-dark.svg
```

## API Configuration

### `NEXT_PUBLIC_SIMPLICITY_API_URL`

Simplicity API endpoint for UTXO fetching.

```env
NEXT_PUBLIC_SIMPLICITY_API_URL=https://api.simplicity.network
```

Default: `https://api.simplicity.network`

### `SIMPLICITY_API_SECRET`

API secret for Simplicity (server-side only).

```env
SIMPLICITY_API_SECRET=your_secret_here
```

### `BITCOIN_RPC_URL` (Optional)

Bitcoin RPC URL for advanced features.

```env
BITCOIN_RPC_URL=https://your-rpc-node.com
```

## Configuration Examples

### Example 1: Basic Setup (No Fees)

```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_PROJECT_NAME=MyBRC20Portal
```

### Example 2: With Platform Fees

```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_PROJECT_NAME=PremiumMints

# Platform fees
NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
NEXT_PUBLIC_COMMISSION_AMOUNT_BTC=0.00000500

# Token defaults
NEXT_PUBLIC_DEFAULT_TICKER=PREMIUM
NEXT_PUBLIC_DEFAULT_AMOUNT=5000
NEXT_PUBLIC_DEFAULT_NUM_MINTS=5
```

### Example 3: Full Customization

```env
# Network
NEXT_PUBLIC_NETWORK=mainnet

# Branding
NEXT_PUBLIC_PROJECT_NAME=EliteMints
NEXT_PUBLIC_LOGO_URL=https://mycdn.com/logo.svg
NEXT_PUBLIC_LOGO_DARK_URL=https://mycdn.com/logo-dark.svg

# Platform fees
COMMISSION_WALLET_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
COMMISSION_AMOUNT_BTC=0.00001000

# Token defaults
NEXT_PUBLIC_DEFAULT_TICKER=ELITE
NEXT_PUBLIC_DEFAULT_AMOUNT=10000
NEXT_PUBLIC_DEFAULT_FEE_RATE=15
NEXT_PUBLIC_DEFAULT_NUM_MINTS=10

# API
NEXT_PUBLIC_SIMPLICITY_API_URL=https://api.simplicity.network
SIMPLICITY_API_SECRET=your_secret_here
```

## Validation & Debugging

The configuration system includes automatic validation:

```typescript
// In lib/config.ts
export const tokenConfig = loadTokenConfig()
export function isPlatformFeesEnabled(): boolean
export function getPlatformFeesInfo(): { enabled, address, amountSats, amountBTC }
```

**Development Mode:**

In development, configuration details are logged to the console:

```
[TokenConfig] Configuration loaded:
  - Network: mainnet
  - Fees address: bc1q... (330 sats)
  - Default ticker: SATS
  - ...
```

**Common Warnings:**

- `feesAddress is set but feesAmountBTC is missing` - Both must be set
- `defaultNumMints out of range` - Must be 1-25
- `4-character tickers are reserved` - Avoid standard BRC-20 tickers

## Accessing Configuration in Code

```typescript
import { tokenConfig, isPlatformFeesEnabled, getPlatformFeesInfo } from '@/lib/config'

// Access defaults
console.log(tokenConfig.defaultTicker)
console.log(tokenConfig.defaultAmount)

// Check fees
if (isPlatformFeesEnabled()) {
  const fees = getPlatformFeesInfo()
  console.log(`Fees: ${fees.amountSats} sats to ${fees.address}`)
}
```

## Security Best Practices

1. **Use server-side variables for sensitive data:**
   ```env
   SIMPLICITY_API_SECRET=secret  # No NEXT_PUBLIC_ prefix
   BITCOIN_RPC_URL=https://...   # No NEXT_PUBLIC_ prefix
   ```

2. **Public transparency (optional):**
   ```env
   NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS=bc1q...  # Visible to users
   ```

3. **Private fees (alternative):**
   ```env
   COMMISSION_WALLET_ADDRESS=bc1q...  # Hidden from browser
   ```

## Troubleshooting

**Fees not working?**
- Verify both address and amount are set
- Check address format is valid
- Ensure amount is in BTC format (0.00000330)
- For Taproot, add `COMMISSION_SCRIPT_PUBKEY`

**Defaults not showing?**
- Check variable names have `NEXT_PUBLIC_` prefix if needed
- Verify `.env.local` file exists (local dev)
- Confirm Vercel environment variables are saved
- Redeploy after changing environment variables

**Logo not loading?**
- Verify URL is accessible
- Check CORS settings on your CDN
- Use absolute URLs (https://...)
- Supported formats: SVG, PNG, JPG

## Related Documentation

- [QUICK_START.md](./QUICK_START.md) - 5-minute deployment
- [GETTING_STARTED.md](../GETTING_STARTED.md) - Detailed setup
- [.env.example](../.env.example) - Template with all variables
