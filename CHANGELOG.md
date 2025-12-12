# Changelog

All notable changes to the BRC-20 Mint Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

See [ROADMAP.md](docs/ROADMAP.md) for complete 
## [1.0.0] - 2025-11-28

### Added

#### Core Functionality
- **Chained PSBT Minting**: Mint 1-25 BRC-20 tokens in a single optimized flow
- **Universal Wallet Support**: 6+ Bitcoin wallets via LaserEyes SDK
  - Unisat Wallet
  - Xverse Wallet (Taproot-native)
  - OKX Wallet
  - Phantom Wallet
  - Magic Eden Wallet
  - Leather Wallet
- **Platform Fee System**: Configurable commission collected on first mint only
  - Support for P2WPKH, P2SH, P2PKH, and P2TR addresses
  - Environment variable configuration
  - Flexible public and server-side variable support
- **Dynamic Fee Estimation**: Real-time fee rates from mempool.space
  - Three speed tiers: Slow, Medium, Fast
  - Custom fee rate support
  - Network congestion indicators
- **UTXO Validation**: Comprehensive balance and transaction checking
  - Pending transaction detection
  - Available vs locked UTXO categorization
  - Balance verification including commission

#### Configuration System
- **Centralized Configuration**: Single source of truth in `config/token.config.ts`
- **Environment-Based Setup**: Full configuration via `.env` files
- **Token Defaults**: Pre-fill ticker, amount, fee rate, number of mints
- **Branding Support**: Custom logo and project name
- **Network Selection**: Easy mainnet/testnet switching
- **Type-Safe Configuration**: Fully typed with TypeScript

#### User Interface
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Mode**: Full dark mode with system preference detection
- **Step Wizard**: Clear step-by-step minting process
- **Progress Tracking**: Real-time progress for multi-mint chains
- **Toast Notifications**: User-friendly error and success messages
- **Onboarding Tutorial**: First-time user guidance
- **Success Celebration**: Confetti animation on completion
- **Token Preview Card**: Visual preview of mint parameters
- **Enhanced Controls**: Slider for mint count, fee tier selector

#### Documentation
- **User Guides**:
  - `.env.example` - Complete environment variable template
  - `GETTING_STARTED.md` - Accessible setup guide
  - `docs/QUICK_START.md` - 5-minute deployment guide
  - `docs/CONFIGURATION_GUIDE.md` - Complete configuration reference
- **Developer Guides**:
  - `NEXT_STEPS.md` - Advanced customization guide
  - `docs/DEVELOPER_GUIDE.md` - Development workflow
  - `docs/BRC20_PSBT_FLOW.md` - Technical PSBT details
- **Reference Documentation**:
  - `docs/PROJECT_STATUS.md` - Complete project status
  - `docs/wallet-compatibility.md` - Wallet integration details
  - `docs/ROADMAP.md` - Future development plans
- **Standard Open Source Files**:
  - `LICENSE` - MIT License
  - `CONTRIBUTING.md` - Contribution guidelines
  - `CODE_OF_CONDUCT.md` - Code of conduct
  - `SECURITY.md` - Security policy
  - `CHANGELOG.md` - This file

#### Technical Implementation
- **Client-Side PSBT Construction**: All PSBT building in browser using bitcoinjs-lib
- **LaserEyes Integration**: Universal wallet adapter for consistent API
- **Type Safety**: Strict TypeScript with proper typing for PSBT operations
- **Error Recovery**: State persistence for interrupted mint chains
- **Mempool Monitoring**: Real-time UTXO and fee tracking
- **Address Validation**: Support for all Bitcoin address types

### Fixed

- **PSBT Chain Update Logic**: Corrected `updateChainedPSBT` to properly use change output from previous transaction
- **Commission Configuration**: Fixed environment variable fallback logic for reliable platform fee application
- **UTXO scriptPubKey Preservation**: Ensured scriptPk persists through entire UTXO flow for all address types
- **Type Safety in PSBT Construction**: Enforced `Uint8Array` for scripts and `BigInt` for satoshi values

### Changed

- **Architecture**: Transitioned from experimental dust-based system to production commission-based architecture
- **Configuration Management**: Centralized all configuration in `config/token.config.ts`
- **Wallet Integration**: Migrated to LaserEyes SDK for universal wallet compatibility
- **Documentation Structure**: Organized internal development docs into `/docs/internal/`

### Security

- ✅ Client-side only (no server-side private key handling)
- ✅ PSBT validation before signing
- ✅ Fee sanity checks (prevents excessive fees)
- ✅ Dust threshold enforcement (330 sats minimum)
- ✅ Commission address validation
- ✅ Transaction chain consistency validation
- ✅ Input validation and sanitization

### Performance

- Page load: ~1-2s on 4G
- PSBT construction: <100ms per PSBT
- Chain build (25 mints): <3s
- Bundle size: ~150KB (gzipped)
- Lighthouse score: 95+

---

## Version History

### [1.0.0] - 2025-11-28
**Status**: Production Ready  
**Focus**: Initial production release with full feature set
---
## Deprecation Notice

No deprecations in this release.

---

## Breaking Changes

### 1.0.0

No breaking changes (first release).

---

## Contributors

Thank you to all contributors who made this release possible!

See the [GitHub Contributors](https://github.com/yourorg/yourrepo/graphs/contributors) page for a complete list.

---

## Support

For questions about changes:
- **Documentation**: Check the `/docs` folder
- **GitHub Issues**: Report bugs or request features
- **Email**: arkano1dev@proton.me

---

**Last Updated**: November 2025  
**Latest Version**: 1.0.0
