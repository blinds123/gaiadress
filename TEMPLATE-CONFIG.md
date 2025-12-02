# Landing Page Template Configuration

## Quick Start

```bash
# 1. Copy this folder for a new product
cp -r "this-folder" "new-product-folder"

# 2. Add your images:
#    - Product images → images/product/
#    - Testimonial images → images/testimonials/

# 3. Run /launcher
```

---

## REQUIRED CONFIGURATION

| Variable | Required | Description |
|----------|----------|-------------|
| `PRODUCT_NAME` | Yes | Product display name |
| `PRODUCT_TAGLINE` | Yes | Tagline or "auto-generate" |
| `COMPETITION_URL` | Yes | Competitor site for market research |
| `OUTPUT_FOLDER` | Yes | Deployment path |
| `SITE_NAME` | Yes | Netlify subdomain |
| `IMAGES_FOLDER` | Yes | Path to images |
| `POOL_MODE` | Yes | "existing" or "new" |
| `TIKTOK_PIXEL_ID` | Yes | TikTok tracking pixel |
| `PRICE_PRIMARY` | Default: 59 | Main price |
| `PRICE_SECONDARY` | Default: 19 | Pre-order price |
| `HAS_SIZES` | Yes | true/false |

---

## DIRECTORY STRUCTURE

```
/
├── index.html              # Generated (from base-template.html)
├── base-template.html      # Base template with placeholders
├── netlify.toml            # Generated config
├── _headers                # Generated cache headers
├── LAUNCHER-V8.md          # Deployment protocol (v8.2)
├── TEMPLATE-CONFIG.md      # This file
├── .gitignore
├── state/                  # Agent outputs
│   ├── agent-0.5a.json     # Market research
│   ├── agent-1a.json       # Image processor
│   ├── agent-1b.json       # Content generator
│   ├── agent-1c.json       # Pool manager
│   ├── agent-1d.json       # Repo setup
│   ├── agent-1e.json       # Brand & design
│   └── test-*.json         # Test results
└── images/
    ├── product/            # YOU add product images here
    └── testimonials/       # YOU add testimonial images here
```

---

## IMAGE SPECIFICATIONS

### Product Images
- **Source:** YOU upload (no scraping)
- Format: JPEG or PNG
- Naming: `product-01.jpeg`, `product-02.jpeg`, etc.
- Agent optimizes to 800px width

### Testimonial Images
- **Source:** YOU upload individual images (no collages)
- Format: PNG or JPEG
- Naming: `testimonial-01.png`, `testimonial-02.png`, etc.
- **Display:** FULL uncropped images (NOT circular avatars)
- Agent preserves aspect ratio, compresses to 400px width

---

## EXECUTION PHASES

| Phase | What Happens |
|-------|--------------|
| 0.5 | Market Research (has fallback if fails) |
| 1A | Image optimization + gallery HTML |
| 1B | Content generation (uses market research) |
| 1C | Pool verification |
| 1D | GitHub/Netlify setup |
| 1E | Color palette & SVG icons |
| 2 | Build page from base-template.html |
| 3 | Deploy |
| 4 | Run 3 tests |

---

## V8.2 FEATURES

| Feature | Description |
|---------|-------------|
| User provides ALL images | No scraping - you add product + testimonial images |
| Market research | Competitor analysis for better copy |
| Retry logic | All external APIs have 3 retries |
| Fallback copy | If market research fails, uses generic copy |
| Base template | Included in folder (no external repo needed) |
| HEAD validation | Exchange URLs verified with HEAD request only |
| Full testimonials | Images display as full photos, not avatars |

---

## BUTTON BEHAVIOR

| Button | Action | Price |
|--------|--------|-------|
| Primary CTA | Direct checkout | $59 (configurable) |
| Secondary CTA | Popup → Accept=$29+bump, Decline=$19 | $19 (configurable) |

---

## CHECKLIST

- [ ] Copy template folder
- [ ] Add product images to `images/product/`
- [ ] Add testimonial images to `images/testimonials/`
- [ ] Have competitor URL ready for market research
- [ ] Run `/launcher`
- [ ] Answer config questions
- [ ] Wait ~15 min
- [ ] Verify DEPLOYMENT-REPORT.md generated
- [ ] Test live site purchase flows
