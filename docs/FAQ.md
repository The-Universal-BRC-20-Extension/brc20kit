# Frequently Asked Questions

Common questions and troubleshooting for BRC-20 Kit.

---

## Configuration

### Why do I need a Unisat API token?

The app uses Unisat's API to fetch UTXOs (unspent transaction outputs) and check wallet balances. Without this token, the minting process cannot work.

**What happens without it:**
- You'll see "502 error" or "Failed to fetch UTXOs"
- Minting button won't work
- Wallet connection may work, but minting will fail

### Where do I get a Unisat API token?

1. Go to [https://open-api.unisat.io](https://open-api.unisat.io)
2. Sign up or log in (use your email or GitHub)
3. Navigate to "API Keys" or "Generate Token"
4. Create a new API key
5. Copy the token
6. Add it to Vercel environment variables as `UNISAT_API_TOKEN`

**It's free and takes 2 minutes.**

### What happens if I don't set the Unisat API token?

The app will fail to fetch UTXOs and minting will not work. You'll see a 502 error when trying to mint.

**Fix:** Add `UNISAT_API_TOKEN` to your Vercel environment variables and redeploy.

### Can I change the token ticker or amount?

**No.** The token ticker and amount per mint are hardcoded from environment variables:
- `NEXT_PUBLIC_DEFAULT_TICKER` (defaults to "ANY")
- `NEXT_PUBLIC_DEFAULT_AMOUNT` (defaults to "1")

Users cannot modify these values in the UI. They are set when you deploy.

### How do I customize the token?

Set these environment variables in Vercel:
\`\`\`env
NEXT_PUBLIC_DEFAULT_TICKER=YOURTOKEN
NEXT_PUBLIC_DEFAULT_AMOUNT=1000
\`\`\`

Then redeploy your project.

---

## Troubleshooting

### "Failed to fetch UTXOs" or 502 error

**Cause:** Missing or invalid `UNISAT_API_TOKEN`

**Solution:**
1. Verify token is set in Vercel: Settings → Environment Variables
2. Check token is valid (not expired)
3. Ensure token is applied to all environments (Production, Preview, Development)
4. Redeploy after adding token

**Still not working?**
- Check token format (should start with "Bearer " or be a plain token)
- Verify token hasn't expired
- Try generating a new token

### "No UTXOs available" error

**Cause:** Selected wallet address has no Bitcoin

**Solution:**
1. Check both your payment address (bc1q...) and ordinals address (bc1p...)
2. The app automatically selects the address with the highest balance
3. If both are empty, add Bitcoin to your wallet
4. Wait a few minutes for transactions to confirm

**The app checks both addresses automatically and uses the one with balance.**

### Wallet has balance but app says "No UTXOs"

**Cause:** UTXOs may be locked in pending transactions

**Solution:**
1. Wait for pending transactions to confirm (usually 10-60 minutes)
2. Check [mempool.space](https://mempool.space) for your address
3. Look for unconfirmed transactions
4. Try again after confirmation

**Tip:** The app detects pending UTXOs and warns you, but won't block minting.

### Transaction fee seems too high/low

**Cause:** Fee calculation based on transaction size and network fee rate

**Solution:**
1. Choose different fee tier:
   - **Low** - Slower confirmation (1-6 hours)
   - **Medium** - Standard confirmation (10-60 minutes)
   - **Fast** - Quick confirmation (10-30 minutes)
2. For custom fee, set appropriate sat/vB rate:
   - Low: 1-5 sat/vB
   - Medium: 5-15 sat/vB
   - Fast: 15-50+ sat/vB
3. Higher fees = faster confirmation

**Fee is calculated accurately based on transaction size.**

### Which address does the app use?

The app checks both your payment address (native segwit, bc1q...) and ordinals address (taproot, bc1p...). It automatically selects the one with the highest balance.

**Selection logic:**
- If only one has balance → uses that one
- If both have balance → uses the one with MAX balance
- If both are zero → defaults to payment address (shows error)

**You can see which address is being used in the UI.**

### "Wallet won't connect"

**Cause:** Wallet extension not installed or network mismatch

**Solution:**
1. Ensure wallet is installed (Unisat, Xverse, OKX, etc.)
2. Check wallet is unlocked
3. Verify network matches (mainnet vs testnet)
4. Try refreshing the page
5. Try disconnecting and reconnecting

**Supported wallets:**
- Unisat (recommended)
- Xverse
- OKX
- Phantom
- Magic Eden
- Leather

### "Minting button doesn't work"

**Cause:** Missing required environment variables

**Solution:**
1. Verify all 4 required variables are set:
   - `UNISAT_API_TOKEN` (CRITICAL)
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_DEFAULT_TICKER`
   - `NEXT_PUBLIC_DEFAULT_AMOUNT`
2. Check wallet is connected
3. Ensure wallet has sufficient balance
4. Redeploy after adding variables

### "Transaction failed" or "PSBT validation failed"

**Cause:** Insufficient balance, invalid configuration, or network issue

**Solution:**
1. Check wallet has enough Bitcoin for fees
2. Verify commission address is valid (if using platform fees)
3. Check network congestion (try higher fee rate)
4. Ensure UTXOs aren't locked in pending transactions

**Common issues:**
- Not enough balance for fees + commission
- UTXOs locked in unconfirmed transactions
- Network fee spike (fees increased since calculation)

---

## Platform Fees

### How do platform fees work?

Platform fees (commission) are collected on the **first mint only** of each chain (transaction 1 of 1-25).

**Example:**
- User mints 10 tokens (chain of 10 transactions)
- Commission charged on transaction #1 only
- Transactions #2-10 are commission-free

### How much should I charge?

**Recommended amounts:**
- 330 sats (0.00000330 BTC) - Standard
- 500-1000 sats - Premium features
- 100-200 sats - Basic/budget

**Consider:**
- Your operating costs
- Market rates
- User experience (too high = fewer users)

### Can I disable platform fees?

**Yes.** Simply don't set the commission variables:
- Don't set `COMMISSION_WALLET_ADDRESS`
- Don't set `COMMISSION_AMOUNT_BTC`

The app will work without fees.

---

## Technical Questions

### How does chained minting work?

Chained minting creates 1-25 linked transactions:
1. First transaction uses your UTXOs
2. Each subsequent transaction uses the change output from the previous one
3. All transactions are pre-built before signing
4. You sign them sequentially in your wallet

**Benefits:**
- Efficient (reuses change outputs)
- Lower total fees (fewer UTXO consolidations)
- Faster (all transactions ready at once)

### What's the difference between payment and ordinals address?

- **Payment address (bc1q...):** Native segwit, used for payments
- **Ordinals address (bc1p...):** Taproot, used for ordinals/inscriptions

**The app checks both and uses the one with balance.**

### How accurate is fee calculation?

Fee calculation uses accurate transaction size computation:
- Accounts for input sizes (varies by address type)
- Accounts for output sizes (OP_RETURN, change, commission)
- Includes 5% safety margin
- Updates in real-time with mempool fee rates

**Accuracy:** Within 5% of actual transaction size.

### Can I use this on testnet?

**Yes.** Set:
\`\`\`env
NEXT_PUBLIC_NETWORK=testnet
\`\`\`

Then use a testnet wallet and testnet Bitcoin.

---

## Deployment

### How do I deploy to Vercel?

1. Fork this repository on GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import from GitHub
4. Select your fork
5. Add environment variables
6. Click "Deploy"

**See [Getting Started in 10 Minutes](./GETTING_STARTED_10_MINUTES.md) for detailed steps.**

### Do I need a backend server?

**No.** This is 100% client-side. All PSBT construction happens in the browser.

**You only need:**
- Vercel (for hosting)
- Unisat API token (for UTXO data)
- That's it!

### Can I customize the UI?

**Yes.** The codebase is fully customizable:
- Change colors, fonts, layout
- Add your branding
- Modify components
- See [NEXT_STEPS.md](../NEXT_STEPS.md) for customization guide

---

## Support

### Where can I get help?

1. **Check documentation:**
   - [Getting Started](./GETTING_STARTED_10_MINUTES.md)
   - [Configuration Guide](./CONFIGURATION.md)
   - [README.md](../README.md)

2. **GitHub:**
   - [Open an Issue](https://github.com/The-Universal-BRC-20-Extension/brc20kit/issues)
   - [Discussions](https://github.com/The-Universal-BRC-20-Extension/brc20kit/discussions)

3. **Email:** arkano1dev@proton.me (for commercial support)

### How do I report a bug?

1. Go to [GitHub Issues](https://github.com/The-Universal-BRC-20-Extension/brc20kit/issues)
2. Click "New Issue"
3. Describe the problem:
   - What happened?
   - What did you expect?
   - Steps to reproduce
   - Browser/wallet used
4. Include error messages or screenshots

### Can I contribute?

**Yes!** We welcome contributions:
- Bug fixes
- Feature additions
- Documentation improvements
- UI/UX enhancements

See [Contributing Guide](../CONTRIBUTING.md) for details.

---

## Still Have Questions?

- **Check the docs:** [README.md](../README.md)
- **Open an issue:** [GitHub Issues](https://github.com/The-Universal-BRC-20-Extension/brc20kit/issues)
- **Email support:** arkano1dev@proton.me

---

**Last Updated:** January 2025
