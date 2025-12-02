# LAUNCHER V8.1 [Production-Ready Protocol]

Deploy TikTok landing page with SimpleSwap crypto checkout. **Optimized, reliable, with fallbacks.**

---

## PHASE -1: PREREQUISITES

```bash
npx playwright --version && gh --version && netlify --version && node --version
```

---

## PHASE 0: CONFIG (Ask & Wait)

### Required Variables

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| 1 | `PRODUCT_NAME` | Product display name | "Secret Jeans" |
| 2 | `PRODUCT_TAGLINE` | Tagline or "auto-generate" | "Comfort Meets Style" |
| 3 | `COMPETITION_URL` | Competitor site for market research | "https://competitor.com/product" |
| 4 | `OUTPUT_FOLDER` | Full path for deployment files | "/Users/name/project" |
| 5 | `SITE_NAME` | Netlify subdomain | "secretjeans-shop" |
| 6 | `IMAGES_FOLDER` | Path with `/product/` and `/testimonials/` subfolders | "/Users/name/images" |
| 7 | `POOL_MODE` | `existing` or `new` | "existing" |

### Pricing Variables (with defaults)

| # | Variable | Default | Description |
|---|----------|---------|-------------|
| 8 | `PRICE_PRIMARY` | 59 | Main product price |
| 9 | `PRICE_ORIGINAL` | 99 | Strike-through original price |
| 10 | `PRICE_SECONDARY` | 19 | Pre-order/reserve price |
| 11 | `PRICE_BUMP` | 10 | Order bump add-on price |

### Tracking & Content

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| 12 | `TIKTOK_PIXEL_ID` | TikTok pixel for tracking | "D3CVHNBC77U2RE92M7O0" |
| 13 | `HERO_BADGE` | Badge text above headline | "As Seen on TikTok" |
| 14 | `ORDER_BUMP_TEXT` | Popup upsell description | "Add matching accessories for just $10 more!" |
| 15 | `HAS_SIZES` | true/false - show size selector | true |
| 16 | `SIZE_LIST` | Comma-separated sizes (if HAS_SIZES=true) | "XS,S,M,L,XL" |

**If new pool:** Merchant wallet, Brightdata creds, pool name.

**Save to:** `$OUTPUT_FOLDER/state/CONFIG.md`

**Validation:**
```bash
if [ -z "$PRODUCT_NAME" ] || [ -z "$OUTPUT_FOLDER" ] || [ -z "$SITE_NAME" ]; then
  echo "ERROR: Missing required variables"
  exit 1
fi

mkdir -p "$OUTPUT_FOLDER/state" "$OUTPUT_FOLDER/images/product" "$OUTPUT_FOLDER/images/testimonials"

# Verify user has provided product images
PRODUCT_COUNT=$(ls -1 "$IMAGES_FOLDER/product/"*.{jpeg,jpg,png,webp} 2>/dev/null | wc -l)
if [ "$PRODUCT_COUNT" -eq 0 ]; then
  echo "ERROR: No product images in $IMAGES_FOLDER/product/"
  echo "Please add product images before running launcher"
  exit 1
fi

echo "Validation passed - Found $PRODUCT_COUNT product images"
```

---

## PHASE 0.5: MARKET RESEARCH

**Runs BEFORE Phase 1 to provide data for Content Generator.**

### AGENT 0.5A: Market Research (RUNS FIRST)

**Subagent Config:** `{subagent_type: "general-purpose"}`

**Why first:** Content Generator (1B) needs this data.

```
WebFetch COMPETITION_URL with 3 retries:

for attempt in 1 2 3; do
  RESULT=$(webfetch "$COMPETITION_URL")
  if [ -n "$RESULT" ]; then
    break
  fi
  sleep 5
done

Extract:
- Pricing strategy (price points, discounts, urgency)
- Value propositions (main selling points)
- Objection handling (returns, quality, shipping)
- Trust signals (reviews, badges, guarantees)
- CTA language (button text, urgency words)

Generate recommendations:
1. 5 headline variations
2. Primary/secondary CTA text
3. Objection-buster copy
4. Urgency hooks
5. Trust builder copy

IF WEBFETCH FAILS after 3 retries:
Use FALLBACK_COPY (see below) and continue.
Do NOT block the pipeline.
```

**Output:** `state/agent-0.5a.json`
```json
{
  "status": "complete",
  "source": "competitor" | "fallback",
  "headlines": [...],
  "ctas": {...},
  "objection_busters": [...],
  "urgency_hooks": [...]
}
```

**FALLBACK_COPY (if competitor scrape fails):**
```json
{
  "headlines": [
    "The [PRODUCT] Everyone's Talking About",
    "Finally, [PRODUCT] That Actually Delivers",
    "Join 10,000+ Happy Customers",
    "Limited Stock - Don't Miss Out",
    "As Seen on TikTok"
  ],
  "ctas": {
    "primary": "Get Yours Now",
    "secondary": "Reserve Mine"
  },
  "objection_busters": [
    "Free returns within 30 days",
    "Secure checkout - your data is protected",
    "Ships within 24 hours"
  ],
  "urgency_hooks": [
    "Only X left in stock",
    "Sale ends soon",
    "Selling fast"
  ],
  "trust_builders": [
    "Trusted by 10,000+ customers",
    "4.8/5 star rating",
    "100% satisfaction guarantee"
  ]
}
```

---

### PHASE 0.5 GATE

Wait for Market Research to complete.
Verify: `state/agent-0.5a.json` exists with `status: complete`

---

## CRITICAL SPECS

**Button Behavior:**
- `handleAddToCart('primary')` → `processOrder(59)` DIRECT (no popup)
- `handleAddToCart('secondary')` → `showOrderBumpPopup()` → accept=$29, decline=$19

**Images:**
- Products: `images/product/product-01.jpeg`, `product-02.jpeg`, etc.
- Testimonials: `images/testimonials/testimonial-01.png`, etc.

**Testimonial Display:**
- Display as **FULL UNCROPPED IMAGES** alongside reviews
- NOT circular avatars or profile photos

```css
.testimonial-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}
```

**Pool Endpoints:** `GET /health`, `POST /buy-now {amountUSD}`

---

## PHASE 1: PARALLEL FOUNDATION (Launch 5 Agents in ONE Message)

**Note:** Market Research (0.5A) already completed. These agents can use its output.

### AGENT 1A: Image Processor

**Subagent Config:** `{subagent_type: "general-purpose"}`

**Product Images:**
- List files in IMAGES_FOLDER/product/
- Convert to JPEG, rename: product-01.jpeg, product-02.jpeg, etc.
- Copy to OUTPUT_FOLDER/images/product/
- Compress to 800px width, optimize for web

**Testimonial Images:**
- List files in IMAGES_FOLDER/testimonials/
- **Keep images UNCROPPED** - preserve full original
- Rename: testimonial-01.png, testimonial-02.png, etc.
- Copy to OUTPUT_FOLDER/images/testimonials/
- Compress to 400px width, maintain original aspect ratio

**Generate Product Gallery HTML:**
```html
<!-- Generate this for each product image found -->
<img src="images/product/product-01.jpeg" class="gallery-item active" alt="Product view 1">
<img src="images/product/product-02.jpeg" class="gallery-item" alt="Product view 2">
<!-- ... for all product images -->
```

**Generate Size Options HTML (if HAS_SIZES=true):**
```html
<!-- Parse SIZE_LIST and generate -->
<button class="size-btn" data-size="XS">XS</button>
<button class="size-btn" data-size="S">S</button>
<!-- ... for all sizes -->
```

**Output:** `state/agent-1a.json`
```json
{
  "status": "complete",
  "product_count": X,
  "testimonial_count": X,
  "product_gallery_html": "<img src=...>...",
  "size_options_html": "<button class=...>..."
}
```

---

### AGENT 1B: Content Generator

**Subagent Config:** `{subagent_type: "general-purpose"}`

**IMPORTANT:** Read `state/agent-0.5a.json` first for market research data.

**Generate Testimonials:**
- 20-30 testimonials (40% TikTok, 25% IG, 15% FB, 10% Trustpilot, 10% Google)
- Include: 2-3 typos, mixed ratings (70% 5-star, 20% 4-star, 10% 3-star), specific details
- **Use tone and style from agent-0.5a.json market research**

**Generate Testimonials HTML (match to testimonial images):**
```html
<div class="testimonial-card">
  <img src="images/testimonials/testimonial-01.png" class="testimonial-image" alt="Customer testimonial">
  <div class="testimonial-content">
    <div class="testimonial-rating">★★★★★</div>
    <p class="testimonial-text">"[Generated review text]"</p>
    <span class="testimonial-author">@[username]</span>
    <span class="testimonial-platform">[Platform]</span>
    <span class="testimonial-date">[X days ago]</span>
  </div>
</div>
<!-- Repeat for each testimonial image -->
```

**Generate Accordion Content:**
1. **PRODUCT_DESCRIPTION** - 3-4 sentences about product benefits, quality, features
2. **SIZE_GUIDE** - Standard size chart table (XS-XL with measurements)
3. **SHIPPING_INFO** - Free shipping over $50, 3-5 business days, tracked delivery
4. **RETURNS_POLICY** - 30-day returns, free returns, satisfaction guarantee

**Use Headlines/CTAs from agent-0.5a.json:**
- `HEADLINE_1` - Main hero headline
- `PRIMARY_CTA` - Primary button text
- `SECONDARY_CTA` - Secondary button text

**Output:** `state/agent-1b.json`
```json
{
  "status": "complete",
  "testimonials_html": "<div class='testimonial-card'>...</div>...",
  "product_description": "...",
  "size_guide": "<table>...</table>",
  "shipping_info": "...",
  "returns_policy": "...",
  "headline_1": "...",
  "primary_cta": "...",
  "secondary_cta": "..."
}
```

---

### AGENT 1C: Pool Manager

**Subagent Config:** `{subagent_type: "general-purpose"}`

**With retry logic:**
```bash
POOL_URL="https://simpleswap-automation-1.onrender.com"

for attempt in 1 2 3; do
  HEALTH=$(curl -s --max-time 10 "$POOL_URL/health")
  if [ -n "$HEALTH" ]; then
    break
  fi
  echo "Pool check attempt $attempt failed, retrying..."
  sleep 10
done

if [ -z "$HEALTH" ]; then
  echo "ERROR: Pool unreachable after 3 attempts"
  exit 1
fi
```

**If existing pool:**
- Check pools >= 5 each tier ($19, $29, $59)
- If low, init more exchanges with retry

**If new pool:** Deploy to Render with disk persistence at `/data/exchange-pool.json`

**Output:** `state/agent-1c.json` → `{"status": "complete", "pool_url": "...", "pool_19": X, "pool_29": X, "pool_59": X}`

---

### AGENT 1D: Repository Setup

**Subagent Config:** `{subagent_type: "general-purpose"}`

**With retry logic:**
```bash
# Git init (local, no retry needed)
mkdir -p $OUTPUT_FOLDER/state && cd $OUTPUT_FOLDER && git init

# GitHub repo creation with retry
for attempt in 1 2 3; do
  gh repo create $SITE_NAME --public --source=. --remote=origin && break
  echo "GitHub attempt $attempt failed, retrying..."
  sleep 5
done

# Netlify setup with retry
for attempt in 1 2 3; do
  netlify sites:create --name $SITE_NAME && netlify link && break
  echo "Netlify attempt $attempt failed, retrying..."
  sleep 5
done
```

**Output:** `state/agent-1d.json` → `{"status": "complete", "github_url": "...", "netlify_url": "..."}`

---

### AGENT 1E: Brand & Design

**Subagent Config:** `{subagent_type: "general-purpose"}`

**Color Palette Extraction:**
- Use Read tool to visually analyze product-01.jpeg
- Extract DOMINANT color from the product
- Generate full palette derived from dominant color:
  - `COLOR_PRIMARY`: Dominant product color
  - `COLOR_SECONDARY`: Complementary shade (10% lighter/darker)
  - `COLOR_ACCENT`: Highlight variation
  - `COLOR_BG`: Neutral background (#f9f9f9 or similar)
  - `COLOR_TEXT`: WCAG AA compliant text color (#333 or similar)

**SVG Icons (ultrathink each - premium quality):**
Generate these SVGs with organic curves, varied stroke weights, anti-AI aesthetic:

| Icon | Usage | Requirements |
|------|-------|--------------|
| `SVG_SHIPPING` | Trust badge | Delivery truck/box, 24x24px |
| `SVG_RETURNS` | Trust badge | Circular arrow, 24x24px |
| `SVG_SECURE` | Trust badge | Lock/shield, 24x24px |
| `SVG_ACCORDION_ARROW` | Expand/collapse | Chevron down, 20x20px |
| `SVG_STAR` | Ratings | Filled star, 16x16px |
| `SVG_CHECKMARK` | Features list | Check mark, 20x20px |

**Output:** `state/agent-1e.json`
```json
{
  "status": "complete",
  "color_primary": "#5C5346",
  "color_secondary": "#7A7062",
  "color_accent": "#8B5A2B",
  "color_bg": "#f9f9f9",
  "color_text": "#333333",
  "svg_shipping": "<svg>...</svg>",
  "svg_returns": "<svg>...</svg>",
  "svg_secure": "<svg>...</svg>",
  "svg_accordion_arrow": "<svg>...</svg>",
  "svg_star": "<svg>...</svg>",
  "svg_checkmark": "<svg>...</svg>"
}
```

---

### PHASE 1 GATE

Wait for all 5 agents. Verify all `status: complete`.

---

## PHASE 2: BUILD

### AGENT 2A: Page Builder

**Subagent Config:** `{subagent_type: "general-purpose"}`

**IMPORTANT:** Use the BASE TEMPLATE from `base-template.html` in this folder.
Do NOT clone from external repo.

1. Read `base-template.html` from template folder
2. Copy to OUTPUT_FOLDER as `index.html`

**Apply from Phase 0.5 + Phase 1 outputs:**
- Headlines/CTAs from `agent-0.5a.json` (market research)
- CSS variables from `agent-1e.json` (color palette)
- Custom SVG icons from `agent-1e.json`
- Testimonials from `agent-1b.json`
- Product copy from `agent-1b.json`
- Image paths from `agent-1a.json`

**Replace ALL placeholders in base-template.html:**

| Placeholder | Source | Value |
|-------------|--------|-------|
| `{{PRODUCT_NAME}}` | Phase 0 Config | Product name |
| `{{PRODUCT_TAGLINE}}` | Phase 0 Config | Product tagline |
| `{{HERO_BADGE}}` | Phase 0 Config | Badge text |
| `{{HEADLINE_1}}` | agent-1b.json | Main headline |
| `{{PRIMARY_CTA}}` | agent-1b.json | Primary button text |
| `{{SECONDARY_CTA}}` | agent-1b.json | Secondary button text |
| `{{PRICE}}` | Phase 0 Config | PRICE_PRIMARY |
| `{{ORIGINAL_PRICE}}` | Phase 0 Config | PRICE_ORIGINAL |
| `{{PREORDER_PRICE}}` | Phase 0 Config | PRICE_SECONDARY |
| `{{BUMP_PRICE}}` | Phase 0 Config | PRICE_BUMP |
| `{{TIKTOK_PIXEL_ID}}` | Phase 0 Config | TikTok pixel ID |
| `{{ORDER_BUMP_TEXT}}` | Phase 0 Config | Upsell popup text |
| `{{COLOR_PRIMARY}}` | agent-1e.json | Extracted primary color |
| `{{COLOR_SECONDARY}}` | agent-1e.json | Secondary color |
| `{{COLOR_ACCENT}}` | agent-1e.json | Accent color |
| `{{COLOR_BG}}` | agent-1e.json | Background color |
| `{{COLOR_TEXT}}` | agent-1e.json | Text color |
| `{{PRODUCT_GALLERY}}` | agent-1a.json | Gallery HTML |
| `{{SIZE_OPTIONS}}` | agent-1a.json | Size buttons HTML |
| `{{TESTIMONIALS}}` | agent-1b.json | Testimonials HTML |
| `{{PRODUCT_DESCRIPTION}}` | agent-1b.json | Description text |
| `{{SIZE_GUIDE}}` | agent-1b.json | Size guide HTML |
| `{{SHIPPING_INFO}}` | agent-1b.json | Shipping text |
| `{{RETURNS_POLICY}}` | agent-1b.json | Returns text |
| `{{SVG_SHIPPING}}` | agent-1e.json | Shipping icon SVG |
| `{{SVG_RETURNS}}` | agent-1e.json | Returns icon SVG |
| `{{SVG_SECURE}}` | agent-1e.json | Secure icon SVG |
| `{{SVG_ACCORDION_ARROW}}` | agent-1e.json | Arrow icon SVG |
| `{{POOL_URL}}` | agent-1c.json | Pool endpoint URL |
| `{{HAS_SIZES}}` | Phase 0 Config | true/false for size selector |

**Testimonial Section:**
```html
<section class="testimonials">
  <div class="testimonial-card">
    <img src="images/testimonials/testimonial-01.png" class="testimonial-image" alt="Customer testimonial">
    <div class="testimonial-content">
      <div class="testimonial-rating">★★★★★</div>
      <p class="testimonial-text">"Amazing product..."</p>
      <span class="testimonial-author">@username</span>
      <span class="testimonial-platform">TikTok</span>
    </div>
  </div>
</section>
```

**Testimonial CSS:**
```css
.testimonial-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.testimonial-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain; /* FULL image, no crop */
}

@media (min-width: 768px) {
  .testimonial-card { flex-direction: row; }
  .testimonial-image { max-width: 200px; }
}
```

**Button Behavior:**
- `#primaryCTA` → `handleAddToCart('primary')` → `processOrder(59)` DIRECT
- `#secondaryCTA` → `handleAddToCart('secondary')` → `showOrderBumpPopup()`

**Layout Rules:**
- `overflow-x: hidden` on body
- Product details in accordion format
- Mobile-first, 44px touch targets

**Create Configs:**
- `_headers`, `netlify.toml`, `netlify/functions/buy-now.js`, `sw.js`

---

## PHASE 3: DEPLOY

```bash
cd $OUTPUT_FOLDER

# Git operations with retry
for attempt in 1 2 3; do
  git add -A && git commit -m "Initial deployment" && git push -u origin main && break
  echo "Git push attempt $attempt failed, retrying..."
  sleep 5
done

# Netlify deploy with retry
for attempt in 1 2 3; do
  netlify deploy --prod --dir=. && break
  echo "Netlify deploy attempt $attempt failed, retrying..."
  sleep 10
done
```

Wait 120s for CDN propagation.

---

## PHASE 4: TESTING (Launch 3 Agents in ONE Message)

### TEST 1: Purchase Flows

**Subagent Config:** `{subagent_type: "general-purpose"}`

**$59 Direct Flow:**
- Click #primaryCTA
- ASSERT: No popup, redirects to simpleswap.io

**$19 Popup Flow:**
- Click #secondaryCTA
- ASSERT: Popup appears
- Click decline
- ASSERT: Redirects to simpleswap.io

**Exchange Validation (HEAD request with retry):**
```bash
# Get exchange URL from pool (with retry)
for attempt in 1 2 3; do
  RESPONSE=$(curl -s --max-time 10 -X POST $POOL_URL/buy-now \
    -H "Content-Type: application/json" \
    -d '{"amountUSD": 59}')
  EXCHANGE_URL=$(echo $RESPONSE | jq -r '.exchangeUrl')
  if [ -n "$EXCHANGE_URL" ] && [ "$EXCHANGE_URL" != "null" ]; then
    break
  fi
  sleep 3
done

# Verify URL structure
echo $EXCHANGE_URL | grep -q "simpleswap.io/exchange?id=" || exit 1

# HEAD request confirms exchange exists (5s timeout)
curl -I --max-time 5 "$EXCHANGE_URL" 2>/dev/null | grep -q "200" || exit 1
```

**Output:** `state/test-1.json` → `{"passed": true/false, "exchange_valid": true/false}`

---

### TEST 2: UI & Testimonials

**Subagent Config:** `{subagent_type: "general-purpose"}`

- All images load (`naturalHeight > 0`)
- **Testimonial images display as FULL images** (not circular avatars)
- Testimonial image width > 100px (not tiny)
- No horizontal scroll on mobile (390px) or desktop (1440px)
- Accordions work

**Output:** `state/test-2.json` → `{"passed": true/false, "testimonials_full_size": true/false}`

---

### TEST 3: Pool Health

**Subagent Config:** `{subagent_type: "general-purpose"}`

```bash
# With retry
for attempt in 1 2 3; do
  HEALTH=$(curl -s --max-time 10 $POOL_URL/health)
  if [ -n "$HEALTH" ]; then
    break
  fi
  sleep 5
done
```

- ASSERT: $19 pool >= 5
- ASSERT: $29 pool >= 5
- ASSERT: $59 pool >= 5

**Output:** `state/test-3.json` → `{"passed": true/false, "pool_19": X, "pool_29": X, "pool_59": X}`

---

### PHASE 4 GATE

IF all 3 tests pass → Final Report. ELSE → Auto-Fix (max 2 iterations).

---

## AUTO-FIX (Max 2 Iterations)

1. Identify failed test
2. Fix:
   - Images broken → fix paths
   - Pool low → init more exchanges (with retry)
   - Testimonials as avatars → fix CSS class
   - Overflow → add containment
   - Exchange validation failed → check pool health first
3. Redeploy with retry and re-test

---

## PHASE 5: FINAL REPORT

Generate `DEPLOYMENT-REPORT.md`:

```markdown
# Deployment Report: [PRODUCT_NAME]

## URLs
- **Live Site:** https://[SITE_NAME].netlify.app
- **GitHub:** https://github.com/[user]/[SITE_NAME]
- **Pool:** https://[pool-url].onrender.com

## Pool Status
| Tier | Count |
|------|-------|
| $19  | XX    |
| $29  | XX    |
| $59  | XX    |

## Test Results
| Test | Status |
|------|--------|
| Purchase Flows | ✅/❌ |
| UI & Testimonials | ✅/❌ |
| Pool Health | ✅/❌ |

## Market Research
- Source: competitor | fallback
- Headlines applied: [list]
- CTAs: Primary "[text]", Secondary "[text]"
```

---

## EXECUTION SUMMARY

| Phase | Agents | Est. Time |
|-------|--------|-----------|
| -1 | Prerequisites | 10s |
| 0 | Config | User input |
| 0.5 | Market Research + Product Scraper (sequential) | 2-3 min |
| 1 | **5 parallel** (1A-1E) | 3-4 min |
| 2 | Build | 2 min |
| 3 | Deploy | 2 min + 120s wait |
| 4 | **3 parallel tests** | 1-2 min |
| 5 | Auto-fix if needed | 0-5 min |
| 6 | Report | 30s |

**Target: 12-18 minutes, ~30,000 tokens**

---

## V8.1 IMPROVEMENTS

| Fixed | How |
|-------|-----|
| Agent dependency | Market Research (0.5A) runs BEFORE Content Generator (1B) |
| External API failures | All curl/gh/netlify commands have 3 retries |
| Market research fails | Fallback copy auto-used, pipeline continues |
| No base template | `base-template.html` included in folder |
| Pool unreachable | Retry with exponential backoff |

| Removed | Reason |
|---------|--------|
| Collage Splitter | User uploads ready testimonial images |
| External repo clone | Base template in folder |
| Tests D, E, F | Consolidated to 3 tests |
| Full SimpleSwap page load | HEAD request only |
