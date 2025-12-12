/**
 * FAQ Data - Centralized file for easy content management
 * 
 * This file contains all FAQ questions and answers organized by category.
 * To modify FAQs, simply edit this file - no code changes needed!
 */

import type React from "react"

export interface FAQItem {
  question: string
  answer: string | React.ReactNode
  category: string
}

export interface FAQCategory {
  id: string
  title: string
  description?: string
  icon?: string
}

export const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Basic setup and configuration questions",
  },
  {
    id: "configuration",
    title: "Configuration",
    description: "Environment variables and customization",
  },
  {
    id: "wallet-support",
    title: "Wallet Support",
    description: "Questions about wallet integration",
  },
  {
    id: "minting",
    title: "Minting Process",
    description: "How minting works and chained transactions",
  },
  {
    id: "fees",
    title: "Fees & Costs",
    description: "Platform fees, network fees, and pricing",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and solutions",
  },
  {
    id: "technical",
    title: "Technical Details",
    description: "Advanced technical questions",
  },
  {
    id: "deployment",
    title: "Deployment",
    description: "Hosting and deployment questions",
  },
  {
    id: "security",
    title: "Security",
    description: "Security features and best practices",
  },
  {
    id: "support",
    title: "Support",
    description: "Getting help and reporting issues",
  },
]

export const faqItems: FAQItem[] = [
  // ==================== GETTING STARTED ====================
  {
    category: "getting-started",
    question: "What is BRC-20 Kit?",
    answer:
      "BRC-20 Kit is a Bitcoin-native application for minting BRC-20 tokens using advanced chained PSBT (Partially Signed Bitcoin Transaction) technology. It's 100% client-side, requires no backend, and supports 6+ Bitcoin wallets. You can mint 1-25 tokens in a single optimized flow with configurable platform fees.",
  },
  {
    category: "getting-started",
    question: "How quickly can I get started?",
    answer:
      "You can deploy your own BRC-20 minting portal in just 10 minutes! The process involves: (1) Getting a free Unisat API token (2 minutes), (2) Forking and deploying to Vercel (3 minutes), (3) Adding environment variables (3 minutes), and (4) Testing (2 minutes). See our Getting Started guide for detailed steps.",
  },
  {
    category: "getting-started",
    question: "Do I need coding knowledge to use this?",
    answer:
      "No! The application is designed to work out of the box. You only need to set environment variables (simple copy-paste) and deploy. No coding required. However, if you want to customize the UI or add features, basic knowledge of React/Next.js would be helpful.",
  },
  {
    category: "getting-started",
    question: "What do I need to get started?",
    answer:
      "You need three things: (1) A GitHub account (free), (2) A Vercel account (free, sign up with GitHub), and (3) A Unisat API token (free, takes 2 minutes to get from open-api.unisat.io). That's it! No backend servers, no database setup, nothing else required.",
  },

  // ==================== CONFIGURATION ====================
  {
    category: "configuration",
    question: "Why do I need a Unisat API token?",
    answer:
      "The app uses Unisat's API to fetch UTXOs (unspent transaction outputs) and check wallet balances. Without this token, the minting process cannot work. You'll see '502 error' or 'Failed to fetch UTXOs' errors, and the minting button won't function. Wallet connection may work, but minting will fail.",
  },
  {
    category: "configuration",
    question: "Where do I get a Unisat API token?",
    answer:
      "Getting a token is free and takes just 2 minutes: (1) Visit https://open-api.unisat.io, (2) Sign up or log in (use your email or GitHub), (3) Navigate to 'API Keys' or 'Generate Token', (4) Create a new API key, (5) Copy the token, (6) Add it to Vercel environment variables as UNISAT_API_TOKEN.",
  },
  {
    category: "configuration",
    question: "What happens if I don't set the Unisat API token?",
    answer:
      "The app will fail to fetch UTXOs and minting will not work. You'll see a 502 error when trying to mint. To fix this, add UNISAT_API_TOKEN to your Vercel environment variables and redeploy your project.",
  },
  {
    category: "configuration",
    question: "Can users change the token ticker or amount?",
    answer:
      "No. The token ticker and amount per mint are hardcoded from environment variables (NEXT_PUBLIC_DEFAULT_TICKER and NEXT_PUBLIC_DEFAULT_AMOUNT). Users cannot modify these values in the UI. They are set when you deploy the application.",
  },
  {
    category: "configuration",
    question: "How do I customize the token?",
    answer:
      "Set these environment variables in Vercel: NEXT_PUBLIC_DEFAULT_TICKER=YOURTOKEN and NEXT_PUBLIC_DEFAULT_AMOUNT=1000. Then redeploy your project. The ticker and amount will appear as read-only values in the UI for all users.",
  },
  {
    category: "configuration",
    question: "Can I customize the branding?",
    answer:
      "Yes! You can customize your portal's appearance using environment variables: NEXT_PUBLIC_PROJECT_NAME (your project name), NEXT_PUBLIC_LOGO_URL (logo for light mode), and NEXT_PUBLIC_LOGO_DARK_URL (logo for dark mode). See the Configuration Guide for all branding options.",
  },
  {
    category: "configuration",
    question: "What environment variables are required?",
    answer:
      "Four variables are required: (1) UNISAT_API_TOKEN - API token from Unisat (CRITICAL), (2) NEXT_PUBLIC_NETWORK - Bitcoin network (mainnet or testnet), (3) NEXT_PUBLIC_DEFAULT_TICKER - Token symbol to mint, (4) NEXT_PUBLIC_DEFAULT_AMOUNT - Amount per mint. See the Configuration Guide for optional variables like platform fees and branding.",
  },

  // ==================== WALLET SUPPORT ====================
  {
    category: "wallet-support",
    question: "Which wallets are supported?",
    answer:
      "The application supports 6+ Bitcoin wallets via the LaserEyes SDK: Unisat Wallet (recommended), Xverse Wallet (Taproot-native), OKX Wallet, Phantom Wallet, Magic Eden Wallet, and Leather Wallet. All wallets support BRC-20 operations and chained minting (1-25 transactions).",
  },
  {
    category: "wallet-support",
    question: "Which wallet should I use?",
    answer:
      "For the best experience, we recommend Unisat Wallet - it's the most reliable for all BRC-20 operations. Xverse is a great alternative, especially for Stacks users. OKX is good if you're already using the OKX exchange. For development/testing, use Unisat on testnet for fastest iteration.",
  },
  {
    category: "wallet-support",
    question: "Which address does the app use?",
    answer:
      "The app checks both your payment address (native segwit, bc1q...) and ordinals address (taproot, bc1p...). It automatically selects the one with the highest balance. If only one has balance, it uses that one. If both have balance, it uses the one with MAX balance. If both are zero, it defaults to payment address and shows an error.",
  },
  {
    category: "wallet-support",
    question: "What's the difference between payment and ordinals address?",
    answer:
      "Payment address (bc1q...) is native segwit, used for payments and has lower fees. Ordinals address (bc1p...) is Taproot, used for ordinals/inscriptions and BRC-20 tokens. The app checks both automatically and uses the one with balance, so you don't need to worry about which one to use.",
  },
  {
    category: "wallet-support",
    question: "My wallet won't connect",
    answer:
      "Try these solutions: (1) Ensure wallet extension is installed, (2) Check wallet is unlocked, (3) Verify network matches (mainnet vs testnet), (4) Try refreshing the page, (5) Try disconnecting and reconnecting. If issues persist, check that your wallet supports Bitcoin/BRC-20 operations.",
  },
  {
    category: "wallet-support",
    question: "Can I use hardware wallets?",
    answer:
      "Hardware wallet support is planned for future releases. Currently, the app works with browser extension wallets. For enhanced security, we recommend using hardware wallets for large amounts once support is added. Keep an eye on our changelog for updates.",
  },

  // ==================== MINTING ====================
  {
    category: "minting",
    question: "How does chained minting work?",
    answer:
      "Chained minting creates 1-25 linked transactions: (1) First transaction uses your UTXOs, (2) Each subsequent transaction uses the change output from the previous one, (3) All transactions are pre-built before signing, (4) You sign them sequentially in your wallet. Benefits include efficiency (reuses change outputs), lower total fees (fewer UTXO consolidations), and faster execution (all transactions ready at once).",
  },
  {
    category: "minting",
    question: "How many tokens can I mint at once?",
    answer:
      "You can mint 1-25 tokens in a single chained flow. Each 'mint' is a separate transaction. If you mint 10 tokens, that creates 10 linked transactions that will execute sequentially. The first transaction uses your UTXOs, and subsequent ones use change outputs from previous transactions.",
  },
  {
    category: "minting",
    question: "Can I cancel a minting process?",
    answer:
      "You can cancel before signing any transactions. Once you start signing, each transaction is broadcast immediately after signing. You cannot cancel individual transactions in a chain after they're signed, but you can stop before signing the next transaction. Always review transaction details before signing.",
  },
  {
    category: "minting",
    question: "How long does minting take?",
    answer:
      "Minting time depends on network congestion and your chosen fee rate: Slow (1-6 hours confirmation), Medium (10-60 minutes), Fast (10-30 minutes). The actual signing process takes seconds - it's the Bitcoin network confirmation that takes time. Higher fees = faster confirmation.",
  },
  {
    category: "minting",
    question: "What if a transaction fails in the chain?",
    answer:
      "If a transaction fails or gets rejected, subsequent transactions in the chain cannot proceed (they depend on the previous one's change output). You'll need to start a new mint chain. The app tracks chain state and can help you resume from the last confirmed transaction if needed.",
  },
  {
    category: "minting",
    question: "Do I need to wait for confirmations between transactions?",
    answer:
      "No! The app pre-builds all transactions using estimated change outputs. You sign them sequentially, and they're broadcast immediately. However, if a transaction fails to confirm, subsequent transactions may also fail. The app handles this gracefully and shows you progress.",
  },

  // ==================== FEES ====================
  {
    category: "fees",
    question: "How do platform fees work?",
    answer:
      "Platform fees (commission) are collected on the first mint only of each chain (transaction 1 of 1-25). For example, if a user mints 10 tokens (chain of 10 transactions), commission is charged on transaction #1 only. Transactions #2-10 are commission-free for users.",
  },
  {
    category: "fees",
    question: "How much should I charge for platform fees?",
    answer:
      "Recommended amounts: 330 sats (0.00000330 BTC) - Standard, 500-1000 sats - Premium features, 100-200 sats - Basic/budget. Consider your operating costs, market rates, and user experience (too high = fewer users). Fees are optional - you can disable them entirely.",
  },
  {
    category: "fees",
    question: "Can I disable platform fees?",
    answer:
      "Yes! Simply don't set the commission variables: Don't set COMMISSION_WALLET_ADDRESS or COMMISSION_AMOUNT_BTC (or their NEXT_PUBLIC_ variants). The app will work without fees. Users will only pay Bitcoin network fees, not platform fees.",
  },
  {
    category: "fees",
    question: "How are network fees calculated?",
    answer:
      "Network fees are calculated accurately based on transaction size: Accounts for input sizes (varies by address type), accounts for output sizes (OP_RETURN, change, commission), includes 5% safety margin, and updates in real-time with mempool fee rates. Accuracy is within 5% of actual transaction size.",
  },
  {
    category: "fees",
    question: "What fee rate should I choose?",
    answer:
      "Choose based on your confirmation speed preference: Low (1-5 sat/vB) - Slower confirmation (1-6 hours), Medium (5-15 sat/vB) - Standard confirmation (10-60 minutes), Fast (15-50+ sat/vB) - Quick confirmation (10-30 minutes). Higher fees = faster confirmation. The app fetches current rates from mempool.space.",
  },
  {
    category: "fees",
    question: "Why is the fee estimate so high/low?",
    answer:
      "Fee estimates are based on transaction size and current network conditions. Large chains (many mints) will have higher total fees. Network congestion can cause fee spikes. The app shows you fee estimates before minting so you can adjust the number of mints or fee rate accordingly.",
  },

  // ==================== TROUBLESHOOTING ====================
  {
    category: "troubleshooting",
    question: "Failed to fetch UTXOs or 502 error",
    answer:
      "This usually means missing or invalid UNISAT_API_TOKEN. Solution: (1) Verify token is set in Vercel: Settings → Environment Variables, (2) Check token is valid (not expired), (3) Ensure token is applied to all environments (Production, Preview, Development), (4) Redeploy after adding token. Check token format (should start with 'Bearer ' or be a plain token).",
  },
  {
    category: "troubleshooting",
    question: "No UTXOs available error",
    answer:
      "This means your selected wallet address has no Bitcoin. Solution: (1) Check both your payment address (bc1q...) and ordinals address (bc1p...), (2) The app automatically selects the address with the highest balance, (3) If both are empty, add Bitcoin to your wallet, (4) Wait a few minutes for transactions to confirm (10-60 minutes).",
  },
  {
    category: "troubleshooting",
    question: "Wallet has balance but app says 'No UTXOs'",
    answer:
      "UTXOs may be locked in pending transactions. Solution: (1) Wait for pending transactions to confirm (usually 10-60 minutes), (2) Check mempool.space for your address, (3) Look for unconfirmed transactions, (4) Try again after confirmation. The app detects pending UTXOs and warns you, but won't block minting if sufficient balance exists.",
  },
  {
    category: "troubleshooting",
    question: "Transaction fee seems too high/low",
    answer:
      "Fee calculation is based on transaction size and network fee rate. Try: (1) Choose different fee tier (Low/Medium/Fast), (2) For custom fee, set appropriate sat/vB rate, (3) Higher fees = faster confirmation. The fee is calculated accurately based on transaction size. Network congestion can cause fee spikes.",
  },
  {
    category: "troubleshooting",
    question: "Minting button doesn't work",
    answer:
      "This usually means missing required environment variables. Solution: (1) Verify all 4 required variables are set: UNISAT_API_TOKEN (CRITICAL), NEXT_PUBLIC_NETWORK, NEXT_PUBLIC_DEFAULT_TICKER, NEXT_PUBLIC_DEFAULT_AMOUNT, (2) Check wallet is connected, (3) Ensure wallet has sufficient balance, (4) Redeploy after adding variables.",
  },
  {
    category: "troubleshooting",
    question: "Transaction failed or PSBT validation failed",
    answer:
      "Possible causes: (1) Insufficient balance - check wallet has enough Bitcoin for fees, (2) Invalid configuration - verify commission address is valid (if using platform fees), (3) Network congestion - try higher fee rate, (4) Locked UTXOs - ensure UTXOs aren't locked in pending transactions. Common issues include not enough balance for fees + commission, UTXOs locked in unconfirmed transactions, or network fee spikes.",
  },
  {
    category: "troubleshooting",
    question: "I get 'Insufficient funds' but my wallet shows balance",
    answer:
      "This can happen if: (1) Your balance includes pending transactions that aren't confirmed yet, (2) UTXOs are locked in other pending transactions, (3) The balance doesn't account for required fees + commission, (4) You're looking at a different address than the one selected. Check mempool.space for your address to see pending transactions.",
  },

  // ==================== TECHNICAL ====================
  {
    category: "technical",
    question: "What is a PSBT?",
    answer:
      "PSBT (Partially Signed Bitcoin Transaction) is a standard format for Bitcoin transactions that can be passed between different parties for signing. It contains transaction data (inputs, outputs), signing data (witnessUtxo, scripts), and metadata. This allows the app to build transactions client-side and have your wallet sign them securely.",
  },
  {
    category: "technical",
    question: "How accurate is fee calculation?",
    answer:
      "Fee calculation uses accurate transaction size computation: Accounts for input sizes (varies by address type), accounts for output sizes (OP_RETURN, change, commission), includes 5% safety margin, and updates in real-time with mempool fee rates. Accuracy is within 5% of actual transaction size.",
  },
  {
    category: "technical",
    question: "Can I use this on testnet?",
    answer:
      "Yes! Set NEXT_PUBLIC_NETWORK=testnet in your environment variables, then use a testnet wallet with testnet Bitcoin. This is recommended for testing before deploying to mainnet. Testnet Bitcoin is free and can be obtained from testnet faucets.",
  },
  {
    category: "technical",
    question: "Is my private key safe?",
    answer:
      "Yes! This application is 100% client-side and your private keys never leave your wallet. The app only builds PSBTs (unsigned transactions) and sends them to your wallet for signing. Your wallet extension signs them locally. We never see, store, or transmit your private keys.",
  },
  {
    category: "technical",
    question: "How does the app work without a backend?",
    answer:
      "The app is 100% client-side: All PSBT construction happens in your browser using bitcoinjs-lib, UTXO data comes from public APIs (Unisat API), transaction signing happens in your wallet extension, and broadcasting uses public APIs (mempool.space). You only need Vercel for hosting static files - no backend server required!",
  },
  {
    category: "technical",
    question: "What blockchain does this use?",
    answer:
      "This application uses the Bitcoin blockchain. BRC-20 tokens are tokens on Bitcoin using the Ordinals protocol. Transactions are regular Bitcoin transactions with OP_RETURN outputs containing BRC-20 operation data. All transactions are on the Bitcoin mainnet (or testnet for testing).",
  },

  // ==================== DEPLOYMENT ====================
  {
    category: "deployment",
    question: "How do I deploy to Vercel?",
    answer:
      "Deploy in 5 steps: (1) Fork this repository on GitHub, (2) Go to vercel.com, (3) Click 'New Project' → Import from GitHub, (4) Select your fork, (5) Add environment variables and click 'Deploy'. See the Getting Started in 10 Minutes guide for detailed step-by-step instructions.",
  },
  {
    category: "deployment",
    question: "Do I need a backend server?",
    answer:
      "No! This is 100% client-side. All PSBT construction happens in the browser. You only need: Vercel (for hosting static files), Unisat API token (for UTXO data). That's it! No backend, no database, no server-side code required.",
  },
  {
    category: "deployment",
    question: "Can I host this on other platforms?",
    answer:
      "Yes! Since it's a Next.js static application, you can deploy to any platform that hosts static sites: Netlify, Cloudflare Pages, GitHub Pages, AWS S3, or any VPS. The key requirement is that it serves static files - no server-side rendering needed.",
  },
  {
    category: "deployment",
    question: "Can I customize the UI?",
    answer:
      "Yes! The codebase is fully customizable: Change colors, fonts, layout, add your branding, modify components. See the Configuration Guide for branding options via environment variables, or modify the React components directly for deeper customization. The code is open source and well-documented.",
  },
  {
    category: "deployment",
    question: "What happens when I redeploy?",
    answer:
      "When you redeploy: (1) Vercel builds a new version of your site, (2) Environment variables are applied from your Vercel settings, (3) The new version goes live (usually takes 1-2 minutes), (4) Existing users see the new version on their next visit. Your old deployments are preserved in Vercel's deployment history.",
  },

  // ==================== SECURITY ====================
  {
    category: "security",
    question: "Is this application secure?",
    answer:
      "Yes! Security features include: Client-side only (no server-side private key handling), PSBT validation before signing, fee sanity checks (prevents excessive fees), dust threshold enforcement (330 sats minimum), commission address validation, transaction chain consistency validation, and input validation/sanitization.",
  },
  {
    category: "security",
    question: "What are the security best practices?",
    answer:
      "Best practices: (1) Always verify transaction details before signing, (2) Use hardware wallets for large amounts (when supported), (3) Double-check commission address in configuration, (4) Keep private keys secure - never share or store unencrypted, (5) Test on testnet before mainnet, (6) Only use official wallet extensions from trusted sources.",
  },
  {
    category: "security",
    question: "Can I audit the code?",
    answer:
      "Yes! The entire codebase is open source on GitHub. You can review all code, check how PSBTs are built, verify fee calculations, and see exactly what the application does. We encourage security audits and welcome feedback. Report security vulnerabilities to arkano1dev@proton.me (don't open public issues).",
  },
  {
    category: "security",
    question: "What if I find a security vulnerability?",
    answer:
      "Do NOT open public GitHub issues for security vulnerabilities. Instead, email arkano1dev@proton.me with details. We will respond promptly and work with you to address the issue. We take security seriously and appreciate responsible disclosure.",
  },

  // ==================== SUPPORT ====================
  {
    category: "support",
    question: "Where can I get help?",
    answer:
      "Multiple ways to get help: (1) Check documentation - Getting Started Guide, Configuration Guide, FAQ, (2) GitHub - Open an Issue or join Discussions, (3) Email support - arkano1dev@proton.me (for commercial support). Start with the documentation - most questions are answered there!",
  },
  {
    category: "support",
    question: "How do I report a bug?",
    answer:
      "Report bugs on GitHub: (1) Go to github.com/The-Universal-BRC-20-Extension/brc20kit/issues, (2) Click 'New Issue', (3) Describe the problem: What happened? What did you expect? Steps to reproduce, Browser/wallet used, (4) Include error messages or screenshots. The more details, the faster we can fix it!",
  },
  {
    category: "support",
    question: "Can I contribute to the project?",
    answer:
      "Yes! We welcome contributions: Bug fixes, feature additions, documentation improvements, UI/UX enhancements. How to contribute: (1) Fork the repository, (2) Create a feature branch, (3) Make your changes, (4) Commit and push, (5) Open a Pull Request. See CONTRIBUTING.md for detailed guidelines.",
  },
  {
    category: "support",
    question: "Is commercial support available?",
    answer:
      "Yes! For white-label deployments, custom integrations, or priority support, contact arkano1dev@proton.me. We offer custom development, deployment assistance, and ongoing support packages. The open-source version is free, but commercial support is available for businesses.",
  },
]

// Helper function to get FAQs by category
export function getFAQsByCategory(categoryId: string): FAQItem[] {
  return faqItems.filter((item) => item.category === categoryId)
}

// Helper function to search FAQs
export function searchFAQs(query: string): FAQItem[] {
  const lowerQuery = query.toLowerCase()
  return faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(lowerQuery) ||
      (typeof item.answer === "string" && item.answer.toLowerCase().includes(lowerQuery)),
  )
}
