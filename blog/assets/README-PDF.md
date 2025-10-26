# Daily Psychology Log PDF Generation

## Files Created

- `daily-psychology-log.svg` - Source SVG template
- `daily-psychology-log.pdf` - **To be generated** (A4/Letter format)
- `daily-psychology-log.png` - **To be generated** (Preview image for article)

## Generation Instructions

### Option 1: Using Inkscape (Recommended)
```bash
# Convert SVG to PDF
inkscape blog/assets/daily-psychology-log.svg --export-type=pdf --export-filename=blog/assets/daily-psychology-log.pdf

# Convert SVG to PNG (for preview)
inkscape blog/assets/daily-psychology-log.svg --export-type=png --export-filename=blog/assets/daily-psychology-log.png -h 1200
```

### Option 2: Using Online Converter
- Upload `daily-psychology-log.svg` to https://svgtopdf.com
- Download and save as `daily-psychology-log.pdf`
- Export PNG preview at 1200px height

### Option 3: Using ImageMagick
```bash
convert blog/assets/daily-psychology-log.svg blog/assets/daily-psychology-log.pdf
convert -density 300 -resize 1200x1200 blog/assets/daily-psychology-log.svg blog/assets/daily-psychology-log.png
```

## PDF Specifications

- Format: A4 (8.27" x 11.69") or US Letter (8.5" x 11")
- Background: Dark theme (#0f101c)
- Text color: Light gray (rgba(233, 234, 240))
- Accent colors:
  - Electric Blue: #00f6ff
  - Violet: #7f5af0
  - Magenta: #ff4ecd

## Content Sections

1. **Pre-Market Intention** - Date, session, energy level, risk parameters
2. **Emotion Tags** - Trade 1-3 with emotion tags, triggers, and counter-actions
3. **Cooldown Events** - Rule breaks, cooldown triggers, reasons
4. **Post-Session Reflection** - What helped, what hurt, tomorrow's rule

## PNG Preview

- Width: 612px (maintains aspect ratio)
- Height: 792px (A4 standard)
- Use for article preview
- Format: PNG with transparent background (optional)

## Usage

The PDF will be linked from the article's "Daily Psychology System" section with a callout box.

