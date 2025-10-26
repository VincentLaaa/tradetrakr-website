#!/bin/bash
# Convert all SVG illustrations to PNG (since WebP export isn't available in this Inkscape version)

# Set working directory
cd "$(dirname "$0")"

# Hero illustrations
echo "Converting hero illustration..."
inkscape blog/images/psychology/mastering-trading-psychology-hero-illustration.svg \
  --export-filename=blog/images/psychology/mastering-trading-psychology-hero-illustration-1280x720.png \
  --export-width=1280

inkscape blog/images/psychology/mastering-trading-psychology-hero-illustration.svg \
  --export-filename=blog/images/psychology/mastering-trading-psychology-hero-illustration-800x450.png \
  --export-width=800

# OG image (1200x630)
inkscape blog/images/psychology/mastering-trading-psychology-hero-illustration.svg \
  --export-filename=assets/og/mastering-trading-psychology-hero.png \
  --export-width=1200

# Daily Log
echo "Converting daily log figure..."
inkscape blog/images/psychology/trading-psychology-consistent-trades-daily-log.svg \
  --export-filename=blog/images/psychology/trading-psychology-consistent-trades-daily-log.png \
  --export-width=1100

# Pre-Trade Checklist
echo "Converting pre-trade checklist figure..."
inkscape blog/images/psychology/trading-psychology-consistent-trades-pre-trade-checklist.svg \
  --export-filename=blog/images/psychology/trading-psychology-consistent-trades-pre-trade-checklist.png \
  --export-width=1100

# Emotion Tags
echo "Converting emotion tags figure..."
inkscape blog/images/psychology/trading-psychology-consistent-trades-emotion-tags.svg \
  --export-filename=blog/images/psychology/trading-psychology-consistent-trades-emotion-tags.png \
  --export-width=1100

# Cooldowns
echo "Converting cooldowns figure..."
inkscape blog/images/psychology/trading-psychology-consistent-trades-cooldowns.svg \
  --export-filename=blog/images/psychology/trading-psychology-consistent-trades-cooldowns.png \
  --export-width=1100

# Weekly Review
echo "Converting weekly review figure..."
inkscape blog/images/psychology/trading-psychology-consistent-trades-weekly-review.svg \
  --export-filename=blog/images/psychology/trading-psychology-consistent-trades-weekly-review.png \
  --export-width=1100

# Daily Psychology Log PDF
echo "Converting Daily Psychology Log to PDF..."
inkscape blog/assets/daily-psychology-log.svg --export-filename=blog/assets/daily-psychology-log.pdf

echo "✅ All images converted!"
