#!/bin/bash

# Asset optimization script for NeonCloud
# Optimizes SVG and PNG assets before commit

set -e

echo "🔧 Optimizing assets..."

# Check if SVGO is installed
if ! command -v svgo &> /dev/null; then
    echo "⚠️  SVGO not found. Install with: npm install -g svgo"
    echo "   Skipping SVG optimization..."
else
    echo "✓ Optimizing SVG files..."
    find public/assets -name "*.svg" -type f -exec svgo {} \;
fi

# Check if imageoptim-cli is installed (macOS)
if command -v imageoptim &> /dev/null; then
    echo "✓ Optimizing PNG files..."
    find public/assets -name "*.png" -type f -exec imageoptim {} \;
elif command -v pngquant &> /dev/null; then
    echo "✓ Optimizing PNG files with pngquant..."
    find public/assets -name "*.png" -type f -exec pngquant --ext .png --force {} \;
else
    echo "⚠️  No PNG optimizer found. Consider installing imageoptim-cli or pngquant"
fi

echo "✅ Asset optimization complete!"

