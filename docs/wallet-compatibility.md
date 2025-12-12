# Wallet Compatibility Matrix

This document outlines the compatibility of various Bitcoin wallets with the Universal BRC-20 Mint Portal.

## Supported Wallets

### ✅ Fully Supported

#### Unisat Wallet
- **Status**: Fully Supported
- **PSBT Support**: v0
- **Taproot**: Yes (bc1p...)
- **BRC-20**: Native support
- **Chained Mints**: Fully supported (1-25)
- **Notes**: Best overall experience for BRC-20 operations
- **Download**: https://unisat.io

#### Xverse Wallet
- **Status**: Fully Supported
- **PSBT Support**: v0 (via sats-connect)
- **Taproot**: Yes (bc1p...)
- **BRC-20**: Full support
- **Chained Mints**: Fully supported (1-25)
- **Notes**: Excellent for Stacks integration
- **Download**: https://xverse.app

#### OKX Wallet
- **Status**: Fully Supported
- **PSBT Support**: v0
- **Taproot**: Yes (bc1p...)
- **BRC-20**: Full support
- **Chained Mints**: Fully supported (1-25)
- **Notes**: Good for users already on OKX exchange
- **Download**: https://okx.com/web3

### 🚧 Partial Support

#### Phantom Wallet
- **Status**: In Development
- **PSBT Support**: Limited
- **Taproot**: Yes
- **BRC-20**: Basic support
- **Chained Mints**: Not yet tested
- **Notes**: Primarily Solana-focused, Bitcoin support improving
- **Download**: https://phantom.app

#### Magic Eden Wallet
- **Status**: In Development
- **PSBT Support**: Limited
- **Taproot**: Yes
- **BRC-20**: Ordinals-focused
- **Chained Mints**: Not yet tested
- **Notes**: Best for NFT/Ordinals collectors
- **Download**: https://magiceden.io/wallet

#### Leather Wallet
- **Status**: In Development
- **PSBT Support**: v0
- **Taproot**: Yes
- **BRC-20**: Basic support
- **Chained Mints**: Not yet tested
- **Notes**: Open source, good for Stacks users
- **Download**: https://leather.io

## Feature Comparison

| Feature | Unisat | Xverse | OKX | Phantom | Magic Eden | Leather |
|---------|--------|--------|-----|---------|------------|---------|
| Single Mint | ✅ | ✅ | ✅ | 🚧 | 🚧 | 🚧 |
| Chained Mints (1-25) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Taproot (bc1p...) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PSBT Signing | ✅ | ✅ | ✅ | 🚧 | 🚧 | 🚧 |
| Broadcast | ✅ | ❌* | ✅ | 🚧 | 🚧 | 🚧 |
| Balance Display | ✅ | ❌* | ✅ | 🚧 | 🚧 | 🚧 |

*Xverse requires external broadcast service (handled by our app)

## Known Issues & Workarounds

### Xverse
- **Issue**: No native broadcast method
- **Workaround**: App uses Mempool.space API for broadcasting
- **Impact**: None for users

### OKX
- **Issue**: Occasional timeout on large chains (>15 mints)
- **Workaround**: Break into smaller chains or increase timeout
- **Impact**: Minor delay

### Phantom
- **Issue**: Bitcoin support still maturing
- **Workaround**: Use Unisat or Xverse for now
- **Impact**: Not recommended for production use yet

## Testing Checklist

For each wallet, we test:

- [ ] Connection flow
- [ ] Address format (Taproot bc1p...)
- [ ] Single mint PSBT signing
- [ ] 5-mint chain signing
- [ ] 25-mint chain signing
- [ ] Fee customization
- [ ] Transaction broadcasting
- [ ] Error handling
- [ ] Disconnect flow

## Recommendations

### For Best Experience
1. **Unisat** - Most reliable for all operations
2. **Xverse** - Great alternative, especially for Stacks users
3. **OKX** - Good for exchange users

### For Development/Testing
- Use **Unisat** on testnet for fastest iteration
- Test with **Xverse** to ensure sats-connect compatibility
- Verify **OKX** for exchange integration scenarios

## Future Support

We plan to add support for:
- Ledger hardware wallet
- Trezor hardware wallet
- Sparrow Wallet (desktop)
- Bitcoin Core (advanced users)

## Reporting Issues

If you encounter wallet compatibility issues:
1. Note the wallet name and version
2. Describe the operation (single mint, chain, etc.)
3. Include error messages
4. Report via GitHub Issues or Discord

Last Updated: 2024-01-15
