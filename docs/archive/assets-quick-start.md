# Graphics Assets - Quick Start Guide

## Immediate Next Steps

### 1. Create Initial Icon Set (Priority: High)

**Tools Needed**: 
- Figma (free, web-based) or Inkscape (free, desktop)
- Or use icon library: [Heroicons](https://heroicons.com/) or [Feather Icons](https://feathericons.com/)

**Icons to Create** (Start with 10-15):
- `help` - Question mark or info icon
- `echo` - Sound/speech bubble
- `clear` - X or trash icon
- `ls` - List/files icon
- `cd` - Folder/directory icon
- `cat` - File/document icon
- `ping` - Network/signal icon
- `whoami` - User/person icon
- `pwd` - Location/path icon
- Status: success (checkmark), error (X), warning (triangle)

**Process**:
1. Start with icon library (Heroicons recommended)
2. Customize color to neon green (#00ff41)
3. Export as SVG
4. Optimize with SVGO: `svgo icon-name.svg`
5. Save to `public/assets/icons/commands/` or `public/assets/icons/status/`
6. Name: `icon-[name]-24.svg` (24px size)

**Example Workflow**:
```bash
# Install SVGO globally
npm install -g svgo

# Optimize an icon
svgo icon-help-24.svg

# Or optimize all icons
svgo -f public/assets/icons/
```

### 2. Create Simple Favicon (Done ✅)

Already created: `public/favicon.svg`
- Simple terminal-style design
- Neon green on dark background
- Ready to use

### 3. First Educational Diagram (Priority: Medium)

**First Diagram**: DNS Resolution Flow

**Tools**: Figma or Inkscape

**Steps**:
1. Create simple flow diagram showing:
   - User types domain name
   - Query goes to DNS server
   - Response with IP address
2. Use simple shapes and arrows
3. Color: Neon green for active elements, grey for passive
4. Export as SVG
5. Save to `public/assets/images/diagrams/dns-resolution.svg`

**Style Guide**:
- Simple line art
- Minimal text (use labels)
- Terminal aesthetic
- High contrast

### 4. Asset Creation Checklist

**Before Creating**:
- [ ] Review `docs/graphics-strategy.md` for style guidelines
- [ ] Check existing assets to maintain consistency
- [ ] Ensure accessibility (contrast, alt text)

**During Creation**:
- [ ] Use SVG format (preferred) or optimized PNG
- [ ] Follow naming conventions
- [ ] Test at different sizes (if applicable)
- [ ] Verify contrast ratios (WCAG AA: 4.5:1)

**After Creation**:
- [ ] Optimize asset (SVGO for SVG, compression for PNG)
- [ ] Add to appropriate directory
- [ ] Update component if needed
- [ ] Test in application
- [ ] Document usage if needed

## Quick Reference

### File Paths
- Icons: `public/assets/icons/[category]/icon-[name]-[size].svg`
- Diagrams: `public/assets/images/diagrams/[name].svg`
- Badges: `public/assets/badges/[name].svg`
- Missions: `public/assets/images/missions/[name].svg`

### Using Assets in Code

**Icons**:
```tsx
import { Icon } from '@/components/ui/Icon';

<Icon name="help" size={24} aria-label="Help command" />
```

**Diagrams**:
```tsx
import { Diagram } from '@/components/ui/Diagram';

<Diagram 
  name="dns-resolution"
  title="DNS Resolution Process"
  description="How DNS queries work"
/>
```

**Direct Path**:
```tsx
import { getIconPath } from '@/utils/assetLoader';

const iconPath = getIconPath('help', 24);
```

### Optimization Commands

```bash
# Optimize all assets
npm run optimize-assets

# Or manually with SVGO
svgo -f public/assets/icons/
```

## Recommended Tools

### Free Options
- **Figma**: Web-based, collaborative design tool
- **Inkscape**: Free vector graphics editor
- **GIMP**: Free image editor
- **Heroicons**: Free icon library (MIT license)
- **Feather Icons**: Free icon library (MIT license)

### Paid Options (If Needed)
- **Adobe Illustrator**: Professional vector graphics
- **Adobe Photoshop**: Professional image editing

## Icon Library Resources

### Starting Points
1. **Heroicons** (https://heroicons.com/)
   - MIT licensed
   - Clean, simple icons
   - Available as SVG
   - Easy to customize

2. **Feather Icons** (https://feathericons.com/)
   - MIT licensed
   - Minimalist style
   - Perfect for terminal aesthetic

3. **Tabler Icons** (https://tabler.io/icons)
   - Free, extensive collection
   - Good for technical/command icons

### Customization Process
1. Download SVG from library
2. Open in Figma/Inkscape
3. Change color to #00ff41 (neon green)
4. Simplify if needed (remove unnecessary details)
5. Export optimized SVG
6. Save with proper naming

## Color Reference

```css
/* From CSS variables */
--color-accent-primary: #00ff41;  /* Neon green - primary */
--color-accent-secondary: #00ffff; /* Cyan - secondary */
--color-accent-warning: #ffaa00;    /* Orange - warnings */
--color-accent-error: #ff0044;     /* Red - errors */
--color-text-primary: #ffffff;     /* White - text */
--color-text-secondary: #b0b0b0;   /* Grey - secondary text */
--color-bg-primary: #0a0a0a;       /* Dark background */
--color-bg-secondary: #1a1a1a;     /* Slightly lighter */
```

## Next Actions

1. **This Week**: Create 10-15 basic command icons
2. **Next Week**: Create first educational diagram (DNS)
3. **Sprint 3**: Add mission graphics and badges
4. **Ongoing**: Expand asset library as features are added

## Questions?

- See `docs/graphics-strategy.md` for detailed strategy
- Check `public/assets/README.md` for structure
- Review existing components for usage examples

