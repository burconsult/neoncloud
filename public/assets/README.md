# Graphics Assets

This directory contains all graphics assets for NeonCloud.

## Structure

```
assets/
├── icons/          # Icon assets (SVG preferred)
│   ├── commands/   # Command icons
│   ├── status/     # Status indicators
│   └── ui/         # UI element icons
├── images/         # Image assets (PNG/SVG)
│   ├── diagrams/   # Educational diagrams
│   ├── missions/   # Mission graphics
│   └── backgrounds/# Background textures
├── badges/         # Achievement badges
└── logo/           # Branding assets
```

## Usage Guidelines

- **Icons**: Use SVG format for scalability
- **Diagrams**: SVG for educational content
- **Optimization**: All assets should be optimized before commit
- **Naming**: Follow naming conventions (see graphics-strategy.md)

## Adding New Assets

1. Place asset in appropriate subdirectory
2. Optimize asset (SVGO for SVG, compression for PNG)
3. Update this README if adding new categories
4. Ensure accessibility (alt text, contrast)

See `docs/graphics-strategy.md` for detailed guidelines.

