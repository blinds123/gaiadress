# Fix Plan: SimpleSwap Exchange Flow

## Problem Statement
The landing page buttons are not correctly leading to SimpleSwap exchanges from the Render pool.

## Investigation Findings

### Pool API Status: WORKING
```
$19 pool: 15 exchanges - Returns valid URL
$29 pool: 15 exchanges - Returns valid URL
$59 pool: 15 exchanges - Returns valid URL
CORS: Properly configured for gaiadress.netlify.app
```

### Issues Identified

1. **PRICE_BUMP is WRONG**
   - Current: `PRICE_BUMP: 69`
   - Should be: `PRICE_BUMP: 29` ($19 + $10 = $29)
   - This sends $69 to the pool which is NOT a valid tier

2. **Pre-order messaging missing**
   - "Reserve Mine" should indicate "Pre-order (Ships in 2 weeks)"
   - Popup text needs updating for pre-order context

3. **Potential CORS/fetch issue on live site**
   - Need Playwright vision testing to verify actual behavior

## Required Fixes

### Fix 1: Update JavaScript CONFIG
```javascript
const CONFIG = {
  POOL_URL: 'https://simpleswap-automation-1.onrender.com',
  PRICE_PRIMARY: 59,    // Full price - direct to $59 exchange
  PRICE_SECONDARY: 19,  // Pre-order base price - $19 exchange
  PRICE_BUMP: 29,       // Pre-order + bump - $29 exchange (NOT 69!)
  HAS_SIZES: true
};
```

### Fix 2: Update Button Text
- Primary: "Get Yours Now - $59" (ships now)
- Secondary: "Pre-Order - $19 (Ships in 2 weeks)"

### Fix 3: Update Popup Text
- Title: "Upgrade Your Pre-Order!"
- Text: "Add matching accessories for just $10 more! Your pre-order will ship in 2 weeks."
- Accept: "Yes, Upgrade to $29"
- Decline: "No thanks, just $19 pre-order"

## Testing Requirements
- Playwright vision mode to click buttons and verify redirect to simpleswap.io
- Test all 3 price flows: $59, $19, $29
- Verify exchange IDs are valid

## Agents to Launch (Parallel)

1. **Agent FIX-A: Code Fixer** - Fix index.html with correct prices and text
2. **Agent FIX-B: Playwright Tester** - Use vision mode to test all flows
3. **Agent FIX-C: Pool Verifier** - Verify all 3 tiers return valid exchanges

## Pool Replenishment Verification
- After using an exchange, verify pool auto-replenishes
- Pool should maintain 45 total exchanges (15 per tier)
- Check /health endpoint before and after transactions

## Agents to Launch (Parallel)

1. **Agent FIX-A: Code Fixer**
   - Fix index.html with correct PRICE_BUMP: 29
   - Update button text for pre-order messaging
   - Update popup text
   - Redeploy to Netlify

2. **Agent FIX-B: Playwright Vision Tester**
   - Use Playwright with vision/screenshot mode
   - Navigate to live site
   - Click Primary CTA → Verify redirect to simpleswap.io with $59
   - Click Secondary CTA → Verify popup appears
   - Click Accept → Verify redirect to simpleswap.io with $29
   - Click Decline → Verify redirect to simpleswap.io with $19
   - Take screenshots at each step

3. **Agent FIX-C: Pool Health Monitor**
   - Check pool health before testing
   - Verify 45 total exchanges available
   - After each test transaction, verify pool replenishes
   - Confirm auto-replenishment is working

## Success Criteria
- Primary CTA → $59 SimpleSwap exchange (verified with screenshot)
- Secondary CTA (decline) → $19 SimpleSwap exchange (verified with screenshot)
- Secondary CTA (accept) → $29 SimpleSwap exchange (verified with screenshot)
- Pool maintains 45 exchanges after use (auto-replenishment working)
- All exchanges verified with HEAD request returning 200
