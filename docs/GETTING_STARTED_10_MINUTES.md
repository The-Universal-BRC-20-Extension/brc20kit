# Getting Started in 10 Minutes

Deploy your own BRC-20 minting portal in just 10 minutes. No technical knowledge required.

---

## What You'll Need

- A GitHub account (free)
- A Vercel account (free, sign up with GitHub)
- A Unisat API token (free, takes 2 minutes to get)

That's it! No coding required.

---

## Step 1: Get Your Unisat API Token (2 minutes)

**Why you need this:** The app uses Unisat's API to check wallet balances and fetch transaction data. Without this token, minting won't work.

### How to Get Your Token:

1. **Visit** [https://open-api.unisat.io](https://open-api.unisat.io)
2. **Sign up** or log in (use your email or GitHub)
3. **Click** "Create API Key" or "Generate Token"
4. **Copy** the token (it looks like: `Bearer abc123xyz...`)
5. **Save it** - you'll need it in Step 3

> 💡 **Tip:** Keep this token secure. Don't share it publicly.

---

## Step 2: Fork and Deploy (3 minutes)

### Option A: One-Click Deploy (Easiest)

1. **Click this button:**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/The-Universal-BRC-20-Extension/brc20kit)

2. **Sign in** to Vercel (use your GitHub account)
3. **Click** "Deploy" (Vercel will automatically fork the repo)
4. **Wait** 1-2 minutes for deployment

### Option B: Manual Fork

1. **Fork** this repository on GitHub:
   - Go to [https://github.com/The-Universal-BRC-20-Extension/brc20kit](https://github.com/The-Universal-BRC-20-Extension/brc20kit)
   - Click the "Fork" button (top right)
   - Choose your account

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your forked repository
   - Click "Deploy"

3. **Wait** for deployment to complete

---

## Step 3: Configure Your Portal (3 minutes)

After deployment, you need to add environment variables:

1. **Go to Vercel Dashboard:**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

2. **Add Required Variables:**

   Click "Add New" for each of these:

   **Variable 1: Unisat API Token (REQUIRED)**
   \`\`\`
   Key: UNISAT_API_TOKEN
   Value: [paste your token from Step 1]
   \`\`\`
   > ⚠️ **Important:** This is required! Without it, minting won't work.

   **Variable 2: Network (REQUIRED)**
   \`\`\`
   Key: NEXT_PUBLIC_NETWORK
   Value: mainnet
   \`\`\`

   **Variable 3: Token Ticker (REQUIRED)**
   \`\`\`
   Key: NEXT_PUBLIC_DEFAULT_TICKER
   Value: ANY
   \`\`\`

   **Variable 4: Amount Per Mint (REQUIRED)**
   \`\`\`
   Key: NEXT_PUBLIC_DEFAULT_AMOUNT
   Value: 1
   \`\`\`

3. **Apply to All Environments:**
   - Check: Production, Preview, Development
   - Click "Save"

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click "..." on the latest deployment
   - Click "Redeploy"
   - Wait for it to finish

---

## Step 4: Test Your Portal (2 minutes)

1. **Visit your site:**
   - URL will be: `https://your-project.vercel.app`
   - Or find it in Vercel dashboard → Deployments

2. **Connect a wallet:**
   - Click "Connect Wallet"
   - Choose your Bitcoin wallet (Unisat, Xverse, OKX, etc.)
   - Approve the connection

3. **Try minting:**
   - You should see "Token: ANY" and "Amount: 1" (read-only)
   - Adjust number of mints (1-25)
   - Choose fee rate
   - Click "Mint ANY Tokens"
   - Sign in your wallet

4. **Verify it works:**
   - Transaction should appear in your wallet
   - Check on [mempool.space](https://mempool.space) after a few minutes

---

## ✅ You're Done!

Your BRC-20 minting portal is now live and ready to use!

**What users can do:**
- Connect their Bitcoin wallets
- Mint "ANY" tokens (amount: 1 per mint)
- Create 1-25 mints in a single flow
- Pay only Bitcoin network fees

---

## Optional: Customize Your Portal

Want to change the token or add branding? See [Configuration Guide](./CONFIGURATION.md) for all options.

**Common customizations:**
- Change project name
- Add your logo
- Set up platform fees (optional)

---

## Troubleshooting

### "Failed to fetch UTXOs" or 502 error

**Problem:** Missing or invalid Unisat API token

**Solution:**
1. Verify `UNISAT_API_TOKEN` is set in Vercel
2. Check token is valid (not expired)
3. Redeploy after adding token

### "No UTXOs available"

**Problem:** Wallet address has no Bitcoin

**Solution:**
1. Make sure your wallet has Bitcoin
2. The app automatically selects the address with balance
3. Check both payment and ordinals addresses

### Minting button doesn't work

**Problem:** Missing required environment variables

**Solution:**
1. Verify all 4 required variables are set:
   - `UNISAT_API_TOKEN`
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_DEFAULT_TICKER`
   - `NEXT_PUBLIC_DEFAULT_AMOUNT`
2. Redeploy after adding variables

---

## Need More Help?

- **Full Documentation:** [README.md](../README.md)
- **Configuration Options:** [CONFIGURATION.md](./CONFIGURATION.md)
- **FAQ:** [FAQ.md](./FAQ.md)
- **GitHub Issues:** [Report an Issue](https://github.com/The-Universal-BRC-20-Extension/brc20kit/issues)

---

**Ready to launch?** Share your portal URL and start minting! 🚀
