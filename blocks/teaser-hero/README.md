# Teaser Hero Block

A full-width hero component with background image, overlay, headline, subheader, body text, and call-to-action buttons. Based on the Figma design system for Adobe Edge Delivery Services.

## Purpose & Variants

The Teaser Hero block creates impactful landing page headers with:

- **Dark Theme (default)**: White text on dark background with semi-transparent overlay
- **Light Theme**: Dark text on light background with semi-transparent overlay
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewports
- **Flexible Content**: Optional subheader and buttons

## Features

- Full-width background image with cover positioning
- Semi-transparent overlay for text readability
- Large headline with condensed font family
- Optional subheader
- Body text with optimal line length
- Primary and secondary call-to-action buttons
- Mobile-responsive layout
- Keyboard navigation support
- Screen reader accessible

## Authoring Guidance

### Content Structure

The block expects content in this order:

1. **Background Image**: First row, first cell - Add an image that will be used as the background
2. **Headlines**: Second row, first cell - Main headline on first line, optional subheader on second line
3. **Body Text**: Third row, first cell - Descriptive paragraph text
4. **Buttons**: Fourth row - First cell for primary button, second cell for secondary button

### Example HTML Structure

```html
<div class="teaser-hero dark">
  <div>
    <div><img src="/path/to/background-image.jpg" alt="Background"></div>
  </div>
  <div>
    <div>
      Header<br>
      Subheader
    </div>
  </div>
  <div>
    <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
  </div>
  <div>
    <div><a href="#primary">Primary Button</a></div>
    <div><a href="#secondary">Secondary Button</a></div>
  </div>
</div>
```

### Block Variants

Add CSS classes to the block element:

- `.dark` - Dark theme with white text (default)
- `.light` - Light theme with dark text  
- `.no-overlay` - Removes the semi-transparent overlay

### Button Styling

- **Primary Button**: White background, dark text, solid fill
- **Secondary Button**: Transparent background, white border, outline style
- Both buttons include hover states and are fully accessible

## Responsive Behavior

- **Mobile (< 768px)**: Single column layout, smaller text, stacked buttons
- **Tablet (768px - 899px)**: Increased text sizes, maintained layout
- **Desktop (≥ 900px)**: Full design with maximum text sizes, side-by-side buttons

## Typography

- **Headline**: Roboto Condensed, 600 weight, responsive sizing (48px → 126px)
- **Subheader**: Roboto Condensed, 600 weight, responsive sizing (20px → 32px)  
- **Body**: Roboto, 400 weight, responsive sizing (18px → 20px)
- **Buttons**: Roboto, 500 weight, 20px, uppercase with letter spacing

## Accessibility Features

- Semantic HTML structure with proper headings
- High contrast text and button combinations
- Keyboard navigation support
- Screen reader compatible
- WCAG 2.1 AA compliant color contrast ratios
- Focus indicators for interactive elements

## Performance

- CSS-only animations and effects
- No JavaScript dependencies for core functionality  
- Optimized background image handling
- Minimal CSS bundle size
- Progressive enhancement approach

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Mobile browser optimized

## Known Limitations

- Background image should be high resolution (minimum 1920px wide)
- Overlay opacity is fixed at 50% (customizable via CSS variables)
- Maximum content width is 1200px on desktop
- Buttons are limited to two per hero instance

## Changelog

### v1.0.0 (2025-09-15)
- Initial implementation based on Figma design system
- Dark and light theme variants
- Responsive design for all breakpoints  
- Accessibility compliance
- Universal Editor integration
