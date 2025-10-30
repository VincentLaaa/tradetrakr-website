# Quick Fix: Replace Blank SVG Images

## The Problem
The SVG illustrations I created are showing as blank. You need to add actual image files.

## What You Need

### Create 7 Image Files:

1. **best-trading-journal-for-prop-firm-traders-hero-1280x720.webp** (also create 800x450 version)
   - **Where:** Trading desk setup, laptop showing journal dashboard
   - **Size:** 1280×720 (desktop), 800×450 (mobile)

2. **best-trading-journal-for-prop-firm-traders-hero-800x450.webp**
   - Mobile version of hero

3. **best-trading-journal-for-prop-firm-traders-requirements.webp**
   - 4-box infographic: Rules, Drawdown, Psychology, Exports
   - Size: 1100×520

4. **best-trading-journal-for-prop-firm-traders-comparison.webp**
   - Side-by-side journal comparison layout
   - Size: 1100×620

5. **best-trading-journal-for-prop-firm-traders-drawdown-visual.webp**
   - Equity curve graph with drawdown zones
   - Size: 1100×520

6. **best-trading-journal-for-prop-firm-traders-workflow.webp**
   - 6-step flowchart diagram
   - Size: 1100×520

7. **best-trading-journal-for-prop-firm-traders-decision-guide.webp**
   - Split-screen layout: Evaluation vs Funded phase
   - Size: 1100×520

### Plus OG Image:

8. **best-trading-journal-for-prop-firm-traders.webp** (in `/assets/og/`)
   - Social media preview
   - Size: 1200×630

## Where to Get Images

### Option 1: Stock Photos (Free)
- **Unsplash:** Search "trading desk", "day trading", "professional trader"
- **Pexels:** Search "trading station", "trading monitor"
- **Pixabay:** Search "trading room", "trading workspace"

### Option 2: Create Mockups
- Use **Canva** or **Figma** to create:
  - Desktop dashboard mockups
  - Comparison tables
  - Flowchart diagrams
- Export as WebP

### Option 3: Screenshots
- Take screenshots from actual trading journal software
- Add overlays/diagrams in Photoshop/Canva
- Convert to WebP

## File Locations

**Save to:**
- `/blog/images/prop/` 
- `/public/blog/images/prop/`

**OG image:**
- `/assets/og/`
- `/public/assets/og/`

## Convert to WebP

Use one of these:
- **Online:** [Squoosh.app](https://squoosh.app)
- **Command:** `cwebp input.jpg -q 80 -o output.webp`
- **ImageMagick:** `convert input.jpg output.webp`

## The Article Is Already Wired

The HTML already references these files, so once you add the images with the correct filenames, they'll automatically display!

Image code is already in the article with:
- Proper alt text
- Dimensions set
- Loading attributes
- Responsive sources

Just add the files and they'll work! 🎯

