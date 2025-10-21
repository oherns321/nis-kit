# Figma Grid Variables - Responsive Breakpoints

## Current Grid Variables from Figma

Based on the Figma design system, here are the grid variables I was able to extract:

### Desktop Grid (Current - 1440px width)
```css
/* From Figma Variables */
--grid-width: 1440px;
--grid-columns: 12;
--grid-gutter: 24px;
--grid-margin: 120px;
--grid-max-width-content: 1200px;
```

## Responsive Grid System Implementation

Based on Adobe EDS best practices and the Figma variables, here's how to implement a responsive grid system:

### CSS Custom Properties for Grid System

```css
:root {
  /* Desktop (1440px+) - From Figma */
  --grid-width-desktop: 1440px;
  --grid-columns-desktop: 12;
  --grid-gutter-desktop: 24px;
  --grid-margin-desktop: 120px;
  --grid-max-width-desktop: 1200px;
  
  /* Tablet (768px - 1439px) - Recommended responsive values */
  --grid-width-tablet: 768px;
  --grid-columns-tablet: 12;
  --grid-gutter-tablet: 16px;
  --grid-margin-tablet: 32px;
  --grid-max-width-tablet: 704px; /* 768 - (32 * 2) */
  
  /* Mobile (320px - 767px) - Recommended responsive values */
  --grid-width-mobile: 375px;
  --grid-columns-mobile: 4;
  --grid-gutter-mobile: 16px;
  --grid-margin-mobile: 16px;
  --grid-max-width-mobile: 343px; /* 375 - (16 * 2) */
  
  /* Current active grid (defaults to mobile-first) */
  --grid-columns: var(--grid-columns-mobile);
  --grid-gutter: var(--grid-gutter-mobile);
  --grid-margin: var(--grid-margin-mobile);
  --grid-max-width: var(--grid-max-width-mobile);
}

/* Tablet breakpoint */
@media (min-width: 768px) {
  :root {
    --grid-columns: var(--grid-columns-tablet);
    --grid-gutter: var(--grid-gutter-tablet);
    --grid-margin: var(--grid-margin-tablet);
    --grid-max-width: var(--grid-max-width-tablet);
  }
}

/* Desktop breakpoint */
@media (min-width: 900px) {
  :root {
    --grid-columns: var(--grid-columns-desktop);
    --grid-gutter: var(--grid-gutter-desktop);
    --grid-margin: var(--grid-margin-desktop);
    --grid-max-width: var(--grid-max-width-desktop);
  }
}
```

## Implementation in Adobe EDS

### 1. Update your root.css
Add the responsive grid variables to your existing `styles/root.css`.

### 2. Grid Utility Classes
```css
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}

.grid-container {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}

/* Column span utilities */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
```

## Missing Variables (Need to Check Other Figma Nodes)

To get more complete grid information, you might want to check these potential locations in your Figma file:

1. **Foundation/Grid** components
2. **Design System** pages  
3. **Breakpoint** specific artboards
4. **Layout** or **Grid System** components

## Next Steps

1. **Check for Grid Components**: Look for dedicated grid system components in Figma
2. **Validate Responsive Values**: The tablet/mobile values I provided are recommendations based on common practices
3. **Test Implementation**: Apply these grid variables to your existing components

## Current Figma File Structure

From what I can see, you currently have:
- Hero components at different breakpoints
- Typography system defined
- Color system defined
- Spacing system (8px base)

Would you like me to:
1. Look for specific grid components by node ID if you have them?
2. Implement these grid variables in your existing CSS files?
3. Create a complete grid system based on the current Figma variables?
