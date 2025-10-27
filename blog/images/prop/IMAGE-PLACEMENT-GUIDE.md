# Image Placement Guide for Prop Firm Article

## Current Situation
The SVG illustrations created may not display properly. Here's what stock photos/content you need to add:

## Directory Structure

**Location:** `/blog/images/prop/` and `/public/blog/images/prop/`

## Required Images

### 1. Hero Image (Primary - Above H1)
**File:** `best-trading-journal-for-prop-firm-traders-hero-1280x720.webp`
**Also create:** `best-trading-journal-for-prop-firm-traders-hero-800x450.webp`

**What to use:**
- A clean, modern workspace desk showing:
  - Trading monitor/laptop
  - Daily loss buffer gauge visible on screen (mockup overlay OK)
  - Trailing drawdown chart visible
  - Rule ledger/checklist visible
  - Dark theme, professional trading setup
  
**Stock photo keywords:** "trading desk setup", "professional trader workspace", "day trading station"

**Alternative:** Create a screenshot/mockup showing:
  - Desktop with multiple displays
  - Trading journal dashboard visible
  - Charts and analytics open
  - Clean, minimal, dark theme

---

### 2. Requirements Diagram
**File:** `best-trading-journal-for-prop-firm-traders-requirements.webp`

**What to use:**
- Infographic-style image showing:
  - Four main categories: Rule Adherence, Drawdown Tracking, Psychology Log, Export & Proof
  - Clear icons or cards for each category
  - Professional diagram/layout

**Stock photo keywords:** "trading requirements infographic", "prop trading essentials", "trading checklist"

**Alternative:** Create a simple 2×2 grid infographic with icons

---

### 3. Comparison Summary
**File:** `best-trading-journal-for-prop-firm-traders-comparison.webp`

**What to use:**
- Side-by-side comparison card layout
- Five journal logos or cards: TraderSync, Edgewonk, TradeZella, Trademetria, TradeTrakR
- Visual "score bars" or checkmarks
- Clean, professional layout

**Stock photo keywords:** "product comparison table", "software comparison", "app comparison"

**Alternative:** Create a comparison grid/screenshot with journal logos

---

### 4. Drawdown Visualization
**File:** `best-trading-journal-for-prop-firm-traders-drawdown-visual.webp`

**What to use:**
- Graph showing equity curve with drawdown zones
- Trailing vs Static drawdown visualization
- Daily loss buffer meter/gauge
- Professional trading chart/monitor mockup

**Stock photo keywords:** "trading drawdown chart", "equity curve graph", "trading risk visualization"

**Alternative:** Screenshot of actual chart software showing equity curve and drawdown

---

### 5. Workflow Diagram
**File:** `best-trading-journal-for-prop-firm-traders-workflow.webp`

**What to use:**
- Flowchart showing the 6-step process:
  - Pre-trade checklist → Real-time monitoring → Post-trade debrief
  - Weekly audit → Cooldown triggers → Evidence archive
- Clean flowchart style
- Arrows/connections between steps

**Stock photo keywords:** "workflow diagram", "process flowchart", "trading workflow"

**Alternative:** Create a simple flowchart with boxes and arrows

---

### 6. Decision Guide
**File:** `best-trading-journal-for-prop-firm-traders-decision-guide.webp`

**What to use:**
- Split view showing:
  - Left: Evaluation Phase (TraderSync, TradeZella)
  - Right: Funded Phase (Edgewonk, TradeTrakR)
- Decision tree or split layout
- Journal logos/cards side by side

**Stock photo keywords:** "decision guide", "product selection guide", "choosing software"

**Alternative:** Create a visual decision tree or split-screen layout

---

## OG Image (Social Media)

**File:** `/assets/og/best-trading-journal-for-prop-firm-traders.webp`
**Size:** 1200×630

**What to use:**
- Professional hero-style image
- Text overlay: "Best Trading Journal for Prop Firm Traders"
- Show trading desk + journaling tools
- Clean, shareable design
- Brand colors (cyan/blue gradient)

**Stock photo keywords:** "trading desk", "professional trader", "day trading setup"

**Alternative:** Create a promotional banner with text overlay

---

## Where Images Are Used

```html
<!-- Hero (before H1) -->
<picture>
  <source type="image/webp" srcset="../images/prop/best-trading-journal-for-prop-firm-traders-hero-800x450.webp 800w, ../images/prop/best-trading-journal-for-prop-firm-traders-hero-1280x720.webp 1280w" sizes="(max-width: 840px) 100vw, 1100px" />
  <img src="../images/prop/best-trading-journal-for-prop-firm-traders-hero.svg" ... />
</picture>

<!-- After "What Prop Firm Traders Need" section -->
<picture>
  <img src="../images/prop/best-trading-journal-for-prop-firm-traders-requirements.svg" ... />
</picture>

<!-- After "Drawdown & Rule Tracking" section -->
<picture>
  <img src="../images/prop/best-trading-journal-for-prop-firm-traders-drawdown-visual.svg" ... />
</picture>

<!-- Before comparison table -->
<picture>
  <img src="../images/prop/best-trading-journal-for-prop-firm-traders-comparison.svg" ... />
</picture>

<!-- In "Prop Firm Trading Journal Workflow" section -->
<picture>
  <img src="../images/prop/best-trading-journal-for-prop-firm-traders-workflow.svg" ... />
</picture>

<!-- In "Choose the Right Journal" section -->
<picture>
  <img src="../images/prop/best-trading-journal-for-prop-firm-traders-decision-guide.svg" ... />
</picture>
```

## How to Add Images

1. **Download stock photos** from Unsplash, Pexels, or create mockups
2. **Save as WebP** format (convert with ImageMagick, Squoosh.app, or online tool)
3. **Place in both directories:**
   - `/blog/images/prop/`
   - `/public/blog/images/prop/`
4. **Replace the SVG references** in the HTML (or keep SVG as fallback)

## Quick Fix: Use Screenshots

If stock photos take time, you can:
1. Use screenshot mockups from actual trading journal software
2. Create simple Canva/Figma designs for each diagram
3. Export as WebP with correct dimensions

## Priority Images

**High Priority (most visible):**
1. Hero image (main visual above H1)
2. Comparison summary (before table)
3. Workflow diagram (in workflow section)

**Lower Priority:**
4. Requirements diagram
5. Drawdown visualization
6. Decision guide
7. OG social image

