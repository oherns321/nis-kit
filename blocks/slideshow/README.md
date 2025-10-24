# Slideshow Block

A responsive vertical layout block for promotional content, based on the Columbia Gas slideshow design pattern. Each slide is displayed in its own row, creating a vertical stack of promotional content.

## Features

- **Responsive Design**: Adapts to mobile, tablet, and desktop viewports
- **Vertical Layout**: All slides are visible in a vertical stack
- **Accessible Markup**: Proper semantic structure and ARIA labels
- **Universal Editor Support**: Full integration with AEM Universal Editor
- **Multiple Variants**: Compact, dark theme, and other styling options

## Usage

### Basic Slideshow

Create a table with the following structure in your document:

```
| Image | Super Text | Title | Content | CTA Text | CTA URL |
|-------|------------|-------|---------|----------|---------|
| ![image1](path/to/image1.jpg) | RESTORING YOUR PROPERTY | Property Restoration | Our detailed description... | Learn More | /services/restoration |
| ![image2](path/to/image2.jpg) | PAYMENT OPTIONS | Easy Payment Methods | Simple payment options... | Learn more! | /payment-options |
```

### Universal Editor Support

The block supports Universal Editor with the following data attributes:

- `data-aue-prop="image"` - Slide image
- `data-aue-prop="super"` - Super text (small text above title)
- `data-aue-prop="title"` - Main slide title
- `data-aue-prop="copy"` - Main content/description
- `data-aue-prop="ctaText"` - Call-to-action button text
- `data-aue-prop="cta"` - Call-to-action button URL

### Variants

Add CSS classes to the slideshow block for different styles:



#### Compact
```html
<div class="slideshow compact">
```
- Reduced height and padding
- Better for smaller content areas

#### Dark Theme
```html
<div class="slideshow dark">
```
- Dark background with light text
- Inverted color scheme

### Layout

The slideshow displays:

1. **Vertical Stack**: All slides are visible in a vertical layout
2. **Individual Rows**: Each slide appears in its own row
3. **Responsive Content**: Content adapts to different screen sizes
4. **Consistent Spacing**: Proper gaps between each promotional item

### Accessibility

- ARIA labels for all interactive elements
- Hidden heading for screen readers
- Keyboard navigation support
- Focus management
- Proper semantic markup

## Technical Details

### Structure

```html
<section class="slideshow" aria-labelledby="slideshow-label">
  <h3 class="a11y-hide" id="slideshow-label">Promoted Content Inside of a Slideshow</h3>
  <ul>
    <li class="slideshow-slide active">
      <div class="promotion">
        <div class="promotion__image">
          <img src="..." alt="...">
        </div>
        <div class="promotion__content">
          <span class="promotion__super">SUPER TEXT</span>
          <h6 class="promotion__title">Main Title</h6>
          <div class="promotion__copy">
            <p>Content...</p>
          </div>
          <a class="btn btn--small btn--dark" href="...">CTA Text</a>
        </div>
      </div>
    </li>
  </ul>
  <div class="slideshow-controls">
    <button class="slideshow-control slideshow-prev">‹</button>
    <div class="slideshow-dots">
      <button class="slideshow-dot active"></button>
    </div>
    <button class="slideshow-control slideshow-next">›</button>
  </div>
</section>
```

### Image Optimization

- Uses `createOptimizedPicture()` for responsive images
- Default width: 800px for slideshow images
- Proper aspect ratio handling
- Lazy loading support

### Performance

- CSS-only animations for smooth performance
- Minimal JavaScript for functionality
- Optimized images through AEM pipeline
- Hardware acceleration for transforms

## Customization

### CSS Variables

The slideshow uses design system tokens:

- `--spacing-*` for consistent spacing
- `--font-size-*` and `--line-height-*` for typography
- `--color-*` for theming
- `--border-radius-*` for consistent corners
- `--shadow-*` for elevation

### JavaScript Hooks

Extend functionality by listening to custom events:

```javascript
// Slide change event
slideshow.addEventListener('slideChanged', (e) => {
  console.log('New slide:', e.detail.slideIndex);
});
```

## Browser Support

- Modern browsers (Chrome 60+, Firefox 60+, Safari 12+, Edge 79+)
- Progressive enhancement for older browsers
- Graceful degradation without JavaScript