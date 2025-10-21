# Teaser Hero Layout Strategy: Flexbox + Grid Hybrid

## Why Flexbox AND Grid?

You asked a great question about why the HTML is using flexbox instead of grid. The answer is that we should use **both strategically**:

### Current Implementation Strategy

```
.teaser-hero (Flexbox)
├── Centers content vertically and horizontally
├── Uses Figma grid margins for padding
└── .teaser-hero-content (CSS Grid)
    ├── Uses 12-column grid system from Figma
    ├── Responsive column spans
    └── Content flows in grid layout
```

## Layout Breakdown

### 1. Outer Container (`.teaser-hero`) - **Flexbox**
```css
.teaser-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Perfect for centering the entire hero */
}
```

**Why Flexbox here?**
- ✅ Perfect for centering content vertically and horizontally
- ✅ Handles different content heights gracefully  
- ✅ Simple and reliable for hero-style layouts

### 2. Content Container (`.teaser-hero-content`) - **CSS Grid**
```css
.teaser-hero-content {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  /* Perfect for content positioning within the hero */
}
```

**Why CSS Grid here?**
- ✅ Uses the 12-column system from Figma
- ✅ Responsive: 4 cols (mobile) → 8 cols (tablet) → 12 cols (desktop)
- ✅ Precise control over content width and positioning
- ✅ Matches Figma design specifications exactly

### 3. Content Elements - **Grid Items**
```css
.header-content { grid-column: span 8; }  /* 8 of 12 columns on desktop */
.body-text { grid-column: span 6; }       /* 6 of 12 columns for readability */
.button-container { grid-column: span 12; } /* Full width for buttons */
```

## Responsive Behavior

| Breakpoint | Container | Grid Columns | Content Width |
|------------|-----------|--------------|---------------|
| Mobile (< 768px) | Flexbox centering | 4 columns | Full width |
| Tablet (768-899px) | Flexbox centering | 8 columns | Varies by content |
| Desktop (900px+) | Flexbox centering | 12 columns | Figma specifications |

## Why This Hybrid Approach?

### ❌ **Pure Flexbox Problems:**
- Hard to achieve precise 12-column layout
- Difficult to match Figma grid specifications
- No standard responsive column system

### ❌ **Pure Grid Problems:**
- Complex to center content vertically in viewport
- Requires more CSS for basic hero centering
- Less intuitive for simple vertical/horizontal centering

### ✅ **Hybrid Solution Benefits:**
- **Flexbox** handles what it's best at: centering and alignment
- **Grid** handles what it's best at: structured layout and positioning
- Matches Figma design system exactly
- Responsive and maintainable
- Uses semantic grid variables from design system

## Figma Design System Integration

The layout now uses the exact values from your Figma design:

```css
/* Mobile First */
--grid-columns: 4;
--grid-gutter: 16px;
--grid-margin: 16px;

/* Desktop (from Figma) */
--grid-columns-desktop: 12;     /* Figma: grid/columns */
--grid-gutter-desktop: 24px;    /* Figma: grid/gutter */
--grid-margin-desktop: 120px;   /* Figma: grid/margin */
--grid-max-width-desktop: 1200px; /* Figma: grid/containers - components/max-width */
```

## Implementation Result

Your teaser-hero now:
- ✅ Uses Figma's exact grid system for content layout
- ✅ Maintains perfect centering with flexbox
- ✅ Responds correctly across all breakpoints
- ✅ Matches design specifications precisely
- ✅ Remains maintainable and semantic

This is a **best practice approach** that leverages the strengths of both layout methods!
