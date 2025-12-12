# Quick Start - 5 Minutes to Production

Deploy your BRC-20 minting portal in under 5 minutes with zero configuration required.

## Prerequisites

- GitHub account (for deployment)
- Bitcoin wallet address (for collecting fees - optional)

## Step 1: Deploy to Vercel (2 min)

Click the button below to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/The-Universal-BRC-20-Extension/brc20kit)

Or manually:

\`\`\`bash
# Clone and deploy
git clone https://github.com/The-Universal-BRC-20-Extension/brc20kit.git
cd brc20kit
vercel
\`\`\`

## Step 2: Configure Environment Variables (2 min)

In your Vercel dashboard (Settings > Environment Variables):

### Required

\`\`\`env
NEXT_PUBLIC_NETWORK=mainnet
\`\`\`

### Optional - Platform Fees

\`\`\`env
NEXT_PUBLIC_COMMISSION_WALLET_ADDRESS=your_btc_address_here
NEXT_PUBLIC_COMMISSION_AMOUNT_BTC=0.00000330
\`\`\`

### Optional - Branding

\`\`\`env
NEXT_PUBLIC_PROJECT_NAME=MyMintPortal
NEXT_PUBLIC_DEFAULT_TICKER=SATS
\`\`\`

## Step 3: Deploy

Click "Save" in Vercel. Your site will automatically redeploy.

## You're Done!

Your minting portal is live at: `https://your-project.vercel.app`

- Users can connect wallets (Phantom, Unisat, Xverse, OKX)
- Create 1-25 chained mints
- Platform fees are automatically collected on the first mint

## Next Steps

- [GETTING_STARTED.md](../GETTING_STARTED.md) - Detailed setup guide
- [NEXT_STEPS.md](../NEXT_STEPS.md) - Advanced customization
- [README.md](../README.md) - Full documentation

## Troubleshooting

**Q: Mints failing?**
- Check your Simplicity API credentials in environment variables
- Ensure `NEXT_PUBLIC_NETWORK` matches your Bitcoin network

**Q: Fees not appearing?**
- Verify `COMMISSION_WALLET_ADDRESS` is a valid Bitcoin address
- Confirm `COMMISSION_AMOUNT_BTC` is properly formatted (e.g., 0.00000330)

**Q: Need help?**
- Check [GETTING_STARTED.md](../GETTING_STARTED.md) for detailed troubleshooting
- Review [wallet-compatibility.md](./wallet-compatibility.md) for wallet-specific issues

## Support

For issues or questions:
1. Check existing documentation
2. Review error messages in browser console
3. Open an issue on GitHub
