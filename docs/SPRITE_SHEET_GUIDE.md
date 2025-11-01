# Sprite Sheet Configuration Guide

## Overview

This guide explains how to properly configure sprite sheets to avoid common issues like **frame bleeding** (where parts of adjacent frames show up in your sprites).

## The Problem

When loading sprite sheets, if the frame dimensions or spacing aren't configured correctly, you may see:
- Feet from the sprite above showing in your current sprite
- Edges of adjacent frames bleeding into the current frame
- Misaligned or cut-off sprites

## The Solution

Use the `spriteConfig.ts` utility to ensure all sprite sheets are properly configured.

### Step 1: Gather Sprite Sheet Information

Before configuring, you need to know:
1. **Total dimensions** of the sprite sheet image (e.g., 1024x1536)
2. **Grid layout** - how many columns and rows (e.g., 2 columns × 3 rows)
3. **Frame size** - width and height of each individual frame
4. **Spacing** - pixels between frames (if any)
5. **Margin** - pixels around the edge of the entire sheet (if any)

#### How to Check Dimensions

```bash
# On macOS
sips -g pixelWidth -g pixelHeight /path/to/sprite-sheet.png

# On Linux/Windows with ImageMagick
identify -format "%wx%h" /path/to/sprite-sheet.png
```

### Step 2: Calculate Frame Dimensions

For a sprite sheet with **no spacing or margin**:
```
frameWidth = totalWidth / columns
frameHeight = totalHeight / rows
```

For a sprite sheet **with spacing**:
```
frameWidth = (totalWidth - (spacing × (columns - 1))) / columns
frameHeight = (totalHeight - (spacing × (rows - 1))) / rows
```

For a sprite sheet **with margin and spacing**:
```
frameWidth = (totalWidth - (2 × margin) - (spacing × (columns - 1))) / columns
frameHeight = (totalHeight - (2 × margin) - (spacing × (rows - 1))) / rows
```

### Step 3: Add Configuration

Open `src/utils/spriteConfig.ts` and add your sprite to the `SPRITE_CONFIGS` object:

```typescript
export const SPRITE_CONFIGS = {
  // Existing sprites...

  YOUR_CHARACTER_NAME: createSpriteConfig({
    key: 'your-character-key',
    path: '/assets/your-character-spritesheet.png',
    frameWidth: 510,      // Calculated frame width
    frameHeight: 510,     // Calculated frame height
    spacing: 2,           // Spacing between frames (if any)
    margin: 0,            // Margin around the sheet (if any)
    columns: 2,           // Number of columns
    rows: 3,              // Number of rows
    totalWidth: 1024,     // Total sprite sheet width
    totalHeight: 1536     // Total sprite sheet height
  })
}
```

The configuration will automatically validate your settings and warn you if something looks off!

### Step 4: Use in Your Scene

In your scene's `preload()` method:

```typescript
import { SPRITE_CONFIGS } from '../utils/spriteConfig'

preload() {
  const config = SPRITE_CONFIGS.YOUR_CHARACTER_NAME
  this.load.spritesheet(config.key, config.path, config.config)
}
```

## Common Issues and Fixes

### Issue: Frame Bleeding (seeing parts of adjacent frames)

**Symptoms:** You can see feet from the sprite above, or edges from neighboring frames.

**Solution:**
1. First, try reducing `frameWidth` and `frameHeight` by 1-2 pixels
2. If that doesn't work, add `spacing: 2` to account for spacing between frames
3. For sprite sheets with visible borders/padding, add `margin: 1` or `margin: 2`

**Example Fix:**
```typescript
// Before (bleeding)
frameWidth: 512,
frameHeight: 512

// After (fixed)
frameWidth: 510,
frameHeight: 510,
spacing: 2
```

### Issue: Sprite Cut Off or Misaligned

**Symptoms:** Part of your sprite is missing or appears in the wrong position.

**Solution:**
1. Verify your `columns` and `rows` match the actual sprite sheet layout
2. Check if there's a margin around the entire sprite sheet you're not accounting for
3. Ensure your math matches the actual sprite sheet dimensions

### Issue: Validation Warnings

The sprite config utility will warn you if dimensions don't match. For example:

```
[SpriteConfig] Warnings for 'motivated-monster':
  - Height mismatch: Expected 1530px but sprite sheet is 1536px.
    Check frameHeight (510), rows (3), spacing (2), and margin (0).
```

This tells you there's a 6px discrepancy. Adjust your config to account for it!

## Best Practices

1. **Always use the sprite config utility** - Don't load sprite sheets directly
2. **Include validation parameters** - Always provide `columns`, `rows`, `totalWidth`, `totalHeight`
3. **Start conservative** - If unsure about spacing, start with `frameWidth/frameHeight` 2px smaller
4. **Test immediately** - Load the game and verify no bleeding before moving on
5. **Document your sprite sheets** - Add comments explaining the frame layout

## Example: Motivated Monster

This is the configuration for the Motivated Monster sprite sheet:

```typescript
MOTIVATED_MONSTER: createSpriteConfig({
  key: 'motivated-monster',
  path: '/assets/motivated-monster-spritesheet.png',
  frameWidth: 510,      // Slightly smaller than 512 to prevent bleed
  frameHeight: 510,     // Slightly smaller than 512 to prevent bleed
  spacing: 2,           // 2px spacing between frames
  columns: 2,           // 2 columns
  rows: 3,              // 3 rows
  totalWidth: 1024,     // Actual image width
  totalHeight: 1536     // Actual image height
})
```

**Frame Layout:**
- Row 1: Front idle (0), Front throw (1)
- Row 2: Back idle (2), Back throw (3)
- Row 3: Right idle (4), Right throw (5)

## Quick Reference Card

| Problem | Solution |
|---------|----------|
| Seeing parts of adjacent frames | Reduce frameWidth/frameHeight by 1-2px, add spacing |
| Sprite cut off | Check margin, verify columns/rows |
| Validation warning | Adjust dimensions to match warning suggestion |
| New sprite sheet | Use createSpriteConfig with full validation params |

## Need Help?

If you're still having issues:
1. Check the browser console for validation warnings
2. Verify sprite sheet dimensions with `sips` or `identify`
3. Try reducing frame size by 2-3 pixels as a test
4. Check if the sprite sheet has visible borders/padding

---

*Last updated: 2025-10-27*
