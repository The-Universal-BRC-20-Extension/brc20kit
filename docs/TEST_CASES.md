# Comprehensive Test Cases - BRC-20 Kit

This document contains detailed test cases for manual and automated testing of the BRC-20 Kit Bitcoin DeFi application.

---

## Test Case Format

Each test case follows this structure:
- **ID:** Unique identifier
- **Feature:** Feature being tested
- **Priority:** High / Medium / Low
- **Type:** Manual / Automated / Both
- **Preconditions:** Required setup
- **Steps:** Detailed test steps
- **Expected Result:** What should happen
- **Actual Result:** What actually happened (filled during testing)
- **Status:** Pass / Fail / Blocked / Not Tested

---

## 1. Wallet Connection Tests

### TC-W-001: Connect Wallet Successfully
- **Feature:** Wallet Connection
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Xverse extension installed, user not connected
- **Steps:**
  1. Navigate to any page
  2. Click "Connect Wallet" button
  3. Approve connection in Xverse popup
  4. Wait for connection to complete
- **Expected Result:** 
  - Wallet connects successfully
  - Address displayed in header (truncated format)
  - Green connection indicator visible
  - "Disconnect" button appears
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-W-002: Reject Wallet Connection
- **Feature:** Wallet Connection
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Xverse extension installed, user not connected
- **Steps:**
  1. Click "Connect Wallet" button
  2. Click "Cancel" or "Reject" in Xverse popup
- **Expected Result:**
  - Connection request cancelled
  - Error message: "Connection request was cancelled"
  - User remains disconnected
  - Can retry connection
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-W-003: Persist Wallet Session
- **Feature:** Wallet Connection
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected
- **Steps:**
  1. Connect wallet
  2. Refresh page (F5)
  3. Check wallet state
- **Expected Result:**
  - Wallet remains connected after refresh
  - Address still displayed
  - No reconnection popup
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-W-004: Disconnect Wallet
- **Feature:** Wallet Connection
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected
- **Steps:**
  1. Click "Disconnect" button
  2. Verify state cleared
- **Expected Result:**
  - Wallet disconnects
  - Address removed from header
  - localStorage cleared
  - "Connect Wallet" button appears
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-W-005: Missing Xverse Extension
- **Feature:** Wallet Connection
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Xverse extension NOT installed
- **Steps:**
  1. Click "Connect Wallet" button
  2. Observe error message
- **Expected Result:**
  - Error message: "Xverse wallet not found. Please install the Xverse browser extension."
  - Link to install Xverse (recommended)
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 2. Token Balance Tests

### TC-T-001: View Token Balances
- **Feature:** Token Balances
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected, user has tokens
- **Steps:**
  1. Navigate to /tokens page
  2. Wait for balances to load
- **Expected Result:**
  - Loading spinner appears initially
  - Token balances displayed in table
  - Shows ticker, balance, available, transferable
  - Data fetched from API
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-T-002: Empty Token Balance
- **Feature:** Token Balances
- **Priority:** Medium
- **Type:** Both
- **Preconditions:** Wallet connected, user has no tokens
- **Steps:**
  1. Navigate to /tokens page
  2. Wait for load to complete
- **Expected Result:**
  - Empty state message displayed
  - "No tokens found" or similar
  - Deploy token CTA visible
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-T-003: Token Balance API Error
- **Feature:** Token Balances
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected, API unavailable
- **Steps:**
  1. Stop Simplicity API
  2. Navigate to /tokens page
  3. Observe error handling
- **Expected Result:**
  - Error card displayed
  - Helpful error message
  - Suggestion to check API connection
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 3. Token Deployment Tests

### TC-T-004: Open Deploy Token Dialog
- **Feature:** Token Deployment
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected
- **Steps:**
  1. Navigate to /tokens page
  2. Click "Deploy Token" button
- **Expected Result:**
  - Dialog opens
  - Form fields visible: ticker, max supply, mint limit
  - Submit button disabled until valid
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-T-005: Deploy Token with Valid Data
- **Feature:** Token Deployment
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has BTC for fees
- **Steps:**
  1. Open deploy token dialog
  2. Enter ticker: "TEST"
  3. Enter max supply: "21000000"
  4. Enter mint limit: "1000"
  5. Click "Deploy"
  6. Sign transaction in Xverse
- **Expected Result:**
  - Transaction created
  - Inscription broadcast
  - Success message displayed
  - Token appears in balance after confirmation
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-T-006: Deploy Token with Invalid Ticker
- **Feature:** Token Deployment
- **Priority:** Medium
- **Type:** Both
- **Preconditions:** Wallet connected
- **Steps:**
  1. Open deploy token dialog
  2. Enter ticker: "TOOLONG" (> 4 chars)
  3. Attempt to submit
- **Expected Result:**
  - Validation error displayed
  - "Ticker must be 4 characters or less"
  - Submit button disabled
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-T-007: Deploy Token with Zero Supply
- **Feature:** Token Deployment
- **Priority:** Medium
- **Type:** Both
- **Preconditions:** Wallet connected
- **Steps:**
  1. Open deploy token dialog
  2. Enter ticker: "TEST"
  3. Enter max supply: "0"
  4. Attempt to submit
- **Expected Result:**
  - Validation error displayed
  - "Max supply must be greater than 0"
  - Submit button disabled
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 4. Swap Position Tests

### TC-S-001: View Available Pools
- **Feature:** Swap Pools
- **Priority:** High
- **Type:** Both
- **Preconditions:** None
- **Steps:**
  1. Navigate to /swaps page
  2. View "Pools" tab
- **Expected Result:**
  - Pools displayed in grid
  - Each pool shows: ticker, TVL, active positions, APY
  - Data fetched from API
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-S-002: Create Swap Position
- **Feature:** Swap Positions
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has tokens
- **Steps:**
  1. Navigate to /swaps page
  2. Click "Create Position" button
  3. Select pool
  4. Enter lock amount: "100"
  5. Enter lock duration: "1000" blocks
  6. Enable yToken wrapping
  7. Click "Create Position"
  8. Sign transaction
- **Expected Result:**
  - Position created successfully
  - Appears in "Active Positions" tab
  - yTokens minted if enabled
  - Unlock height calculated correctly
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-S-003: View Active Positions
- **Feature:** Swap Positions
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected, has active positions
- **Steps:**
  1. Navigate to /swaps page
  2. Click "Active Positions" tab
- **Expected Result:**
  - User's active positions displayed
  - Shows: pool, amount, unlock height, status
  - Progress indicator visible
  - Filtered by user address
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-S-004: Close Expired Position
- **Feature:** Swap Positions
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has expired position
- **Steps:**
  1. Navigate to /swaps page
  2. Find expired position
  3. Click "Close Position" button
  4. Confirm action
  5. Sign transaction
- **Expected Result:**
  - Position closed successfully
  - Tokens unlocked and returned
  - Position moves to "Closed Positions" tab
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 5. Vault Tests

### TC-V-001: View Vaults Dashboard
- **Feature:** Vault Display
- **Priority:** High
- **Type:** Both
- **Preconditions:** Wallet connected
- **Steps:**
  1. Navigate to /vaults page
  2. View dashboard metrics
- **Expected Result:**
  - Total locked BTC displayed
  - Total W minted displayed
  - Number of vaults displayed
  - Metrics calculated correctly
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-V-002: Create New Vault
- **Feature:** Vault Creation
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has BTC
- **Steps:**
  1. Navigate to /vaults page
  2. Click "Create Vault" button
  3. Enter BTC amount: "0.01"
  4. Click "Create Vault"
  5. Complete Taproot address generation
  6. Fund vault address
- **Expected Result:**
  - Taproot address generated
  - 3 spending paths created
  - Funding instructions displayed
  - Vault appears after funding confirmed
- **Actual Result:** [To be filled]
- **Status:** Blocked (crypto implementation pending)

### TC-V-003: View Vault Details
- **Feature:** Vault Display
- **Priority:** Medium
- **Type:** Both
- **Preconditions:** Wallet connected, has vaults
- **Steps:**
  1. Navigate to /vaults page
  2. Click on a vault card
- **Expected Result:**
  - Vault details displayed
  - Shows: locked amount, W minted, status
  - Available spending paths listed
  - Timelock progress visible
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-V-004: Unlock Vault (Collaborative Path)
- **Feature:** Vault Spending
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has active vault, operator available
- **Steps:**
  1. Navigate to vault details
  2. Click "Unlock (Collaborative)" button
  3. Confirm action
  4. Sign transaction
  5. Wait for operator co-signature
- **Expected Result:**
  - Transaction created with collaborative path
  - Operator co-signs
  - BTC unlocked immediately
  - W tokens burned
  - Vault status updated to "closed"
- **Actual Result:** [To be filled]
- **Status:** Blocked (spending UI not implemented)

### TC-V-005: Unlock Vault (Sovereign Path)
- **Feature:** Vault Spending
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, vault past timelock
- **Steps:**
  1. Navigate to vault details
  2. Verify timelock expired
  3. Click "Unlock (Sovereign)" button
  4. Confirm action
  5. Sign transaction
- **Expected Result:**
  - Transaction created with sovereign path
  - No operator signature needed
  - BTC unlocked
  - Vault status updated to "closed"
- **Actual Result:** [To be filled]
- **Status:** Blocked (spending UI not implemented)

---

## 6. Marketplace Tests

### TC-M-001: Browse Marketplace Listings
- **Feature:** Marketplace Display
- **Priority:** High
- **Type:** Both
- **Preconditions:** None
- **Steps:**
  1. Navigate to /marketplace page
  2. View "Browse Listings" tab
- **Expected Result:**
  - Active listings displayed
  - Shows: ticker, amount, price, seller
  - Own listings excluded from browse tab
  - Search box functional
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-M-002: Search Listings by Ticker
- **Feature:** Marketplace Search
- **Priority:** Medium
- **Type:** Both
- **Preconditions:** Marketplace has listings
- **Steps:**
  1. Navigate to /marketplace page
  2. Enter ticker in search box: "TEST"
  3. Observe filtered results
- **Expected Result:**
  - Only listings matching "TEST" displayed
  - Case-insensitive search
  - Empty state if no matches
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-M-003: Create Marketplace Listing
- **Feature:** Marketplace Listing
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has tokens
- **Steps:**
  1. Navigate to /marketplace page
  2. Click "Create Listing" button
  3. Select token: "TEST"
  4. Enter amount: "100"
  5. Enter price per token: "0.0001"
  6. Click "Create Listing"
  7. Sign transaction
- **Expected Result:**
  - Listing created successfully
  - Appears in "My Listings" tab
  - Total price calculated: 100 * 0.0001 = 0.01 BTC
  - Tokens locked for listing
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-M-004: Purchase Listing
- **Feature:** Marketplace Purchase
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected, has BTC, listing available
- **Steps:**
  1. Navigate to /marketplace page
  2. Find listing to purchase
  3. Click "Buy" button
  4. Confirm purchase
  5. Sign transaction
- **Expected Result:**
  - Purchase transaction created
  - BTC transferred to seller
  - Tokens transferred to buyer
  - Listing removed from marketplace
  - Success notification displayed
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-M-005: Cancel Own Listing
- **Feature:** Marketplace Listing
- **Priority:** Medium
- **Type:** Manual
- **Preconditions:** Wallet connected, has active listing
- **Steps:**
  1. Navigate to /marketplace page
  2. Go to "My Listings" tab
  3. Click "Cancel" button on listing
  4. Confirm cancellation
- **Expected Result:**
  - Listing cancelled
  - Tokens unlocked and returned
  - Listing removed from marketplace
  - Success notification displayed
- **Actual Result:** [To be filled]
- **Status:** Blocked (cancel button not implemented)

---

## 7. Navigation Tests

### TC-N-001: Navigate Between Pages
- **Feature:** Navigation
- **Priority:** High
- **Type:** Both
- **Preconditions:** None
- **Steps:**
  1. Navigate to home page
  2. Click "Dashboard" in header
  3. Click "Tokens" in header
  4. Click "Vaults" in header
  5. Click "Swaps" in header
  6. Click "Marketplace" in header
- **Expected Result:**
  - All navigation links work
  - Pages load without errors
  - Active page highlighted in nav
  - Smooth transitions
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-N-002: Mobile Navigation
- **Feature:** Navigation
- **Priority:** Medium
- **Type:** Manual
- **Preconditions:** Mobile device or responsive mode
- **Steps:**
  1. Open app on mobile
  2. Check navigation visibility
  3. Test all nav links
- **Expected Result:**
  - Navigation accessible on mobile
  - Hamburger menu if needed
  - All links functional
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 8. Error Handling Tests

### TC-E-001: API Timeout
- **Feature:** Error Handling
- **Priority:** High
- **Type:** Both
- **Preconditions:** Slow or unresponsive API
- **Steps:**
  1. Simulate slow API response
  2. Navigate to any data-fetching page
  3. Observe behavior
- **Expected Result:**
  - Loading state shown
  - Timeout after reasonable duration
  - Error message displayed
  - Retry option available
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-E-002: Network Disconnection
- **Feature:** Error Handling
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Connected to network
- **Steps:**
  1. Load app
  2. Disconnect network
  3. Attempt to fetch data
- **Expected Result:**
  - Network error detected
  - Offline message displayed
  - Cached data shown if available
  - Retry when online
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-E-003: Transaction Failure
- **Feature:** Error Handling
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Wallet connected
- **Steps:**
  1. Initiate any transaction
  2. Reject in wallet or cause failure
  3. Observe error handling
- **Expected Result:**
  - Transaction failure detected
  - Clear error message
  - State rolled back
  - Can retry transaction
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 9. Performance Tests

### TC-P-001: Page Load Time
- **Feature:** Performance
- **Priority:** Medium
- **Type:** Automated
- **Preconditions:** None
- **Steps:**
  1. Clear cache
  2. Navigate to home page
  3. Measure load time
- **Expected Result:**
  - Page loads in < 2 seconds
  - First contentful paint < 1 second
  - Time to interactive < 3 seconds
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-P-002: Data Fetching Performance
- **Feature:** Performance
- **Priority:** Medium
- **Type:** Automated
- **Preconditions:** API running
- **Steps:**
  1. Navigate to data-heavy page (marketplace)
  2. Measure API response time
  3. Measure render time
- **Expected Result:**
  - API responds in < 500ms
  - Data renders in < 200ms
  - No UI blocking
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## 10. Accessibility Tests

### TC-A-001: Keyboard Navigation
- **Feature:** Accessibility
- **Priority:** High
- **Type:** Manual
- **Preconditions:** None
- **Steps:**
  1. Navigate app using only keyboard
  2. Tab through all interactive elements
  3. Test Enter/Space on buttons
  4. Test Escape on dialogs
- **Expected Result:**
  - All elements reachable via keyboard
  - Focus indicators visible
  - Logical tab order
  - Dialogs trap focus
- **Actual Result:** [To be filled]
- **Status:** Not Tested

### TC-A-002: Screen Reader Compatibility
- **Feature:** Accessibility
- **Priority:** High
- **Type:** Manual
- **Preconditions:** Screen reader installed (NVDA, JAWS, VoiceOver)
- **Steps:**
  1. Enable screen reader
  2. Navigate through app
  3. Test all major features
- **Expected Result:**
  - All content announced
  - Buttons have labels
  - Form fields have labels
  - Errors announced
- **Actual Result:** [To be filled]
- **Status:** Not Tested

---

## Test Execution Summary

**Total Test Cases:** 50+  
**Executed:** 0  
**Passed:** 0  
**Failed:** 0  
**Blocked:** 3  
**Not Tested:** 47+  

**Blocked Test Cases:**
- TC-V-002: Vault creation (crypto implementation pending)
- TC-V-004: Collaborative unlock (UI not implemented)
- TC-V-005: Sovereign unlock (UI not implemented)
- TC-M-005: Cancel listing (UI not implemented)

**Priority Breakdown:**
- High Priority: 35 test cases
- Medium Priority: 12 test cases
- Low Priority: 3 test cases

---

## Next Steps

1. Set up automated testing framework (Jest, Playwright)
2. Implement blocked features
3. Execute manual tests with Xverse wallet
4. Write automated tests for critical paths
5. Conduct performance testing
6. Perform accessibility audit
7. Execute cross-browser testing
8. Document all test results
