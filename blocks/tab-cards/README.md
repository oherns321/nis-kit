# Tab Cards Block

A responsive block component that displays content in a 2-column card layout, perfect for "Before/After" comparisons or feature showcases.

## Purpose & Features

- **Responsive Design**: 2-column layout on desktop, single column on mobile
- **Flexible Content**: Supports images, headings, and body text
- **Universal Editor Compatible**: Full authoring support with add/remove functionality
- **Design System Integration**: Uses EY theme variables for consistent styling

## Variants

- **Default**: Standard 2-column card layout
- **Dark/Light**: Theme variants (add "dark" or "light" as configuration)
- **Compact**: Reduced spacing variant (add "compact" as configuration)
- **Centered**: Centered alignment variant (add "centered" as configuration)

## Content Structure

### Container Level
- **Main Heading** (optional): Display heading above cards

### Card Level (repeatable items)
- **Card Image**: 4:3 aspect ratio image
- **Card Image Alt**: Accessibility text for image
- **Card Heading**: 18px Roboto Condensed semibold
- **Card Body**: 14px Roboto regular text

## Authoring Guidance

1. **Adding Cards**: Use the Universal Editor to add new "Tab Card" items
2. **Image Guidelines**: Upload images with 4:3 aspect ratio for best results
3. **Content Length**: Keep headings concise (1-2 lines), body text under 3 sentences
4. **Accessibility**: Always provide alt text for images

## Technical Specifications

- **Container Max Width**: 1200px with 120px margins
- **Card Gap**: 24px between cards
- **Minimum Card Width**: 282px
- **Typography**: 
  - Headings: 18px Roboto Condensed SemiBold (line-height: 22px)
  - Body: 14px Roboto Regular (line-height: 21px)

## Example HTML Structure

```html
<div class="tab-cards block">
  <div class="tab-cards-container">
    <div class="tab-cards-header">
      <h2>Compare Options</h2>
    </div>
    <div class="tab-cards-content">
      <div class="tab-card">
        <div class="tab-card-image">
          <img src="before.jpg" alt="Before state">
        </div>
        <div class="tab-card-text">
          <h3>Before</h3>
          <p>Neutral, code-aligned starting point</p>
        </div>
      </div>
      <div class="tab-card">
        <div class="tab-card-image">
          <img src="after.jpg" alt="After state">
        </div>
        <div class="tab-card-text">
          <h3>After</h3>
          <p>Branded, production-ready system</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Accessibility Features

- **Semantic HTML**: Uses proper heading hierarchy (h2, h3)
- **Alt Text Support**: Required alt text fields for all images
- **Keyboard Navigation**: Fully keyboard accessible
- **Screen Reader Support**: Proper markup for assistive technologies
- **Color Contrast**: Meets WCAG 2.1 AA standards using design system colors

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement (works without JavaScript)

## Known Limitations

- **Fixed Aspect Ratio**: Images are cropped to 4:3 aspect ratio
- **Two Column Max**: Layout limited to 2 cards per row on desktop
- **Image Optimization**: Large images may impact performance

## Changelog

- **v1.0.0**: Initial implementation with Universal Editor support
  - 2-column responsive grid layout
  - Full authoring model with container and item definitions
  - Design system integration with EY theme variables
  - Accessibility and performance optimized
