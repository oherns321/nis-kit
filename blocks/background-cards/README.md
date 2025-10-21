# Background Cards Block

A clean, image-focused card component that displays cards with large images and accompanying text. Perfect for Before/After comparisons, feature showcases, or any content that benefits from visual emphasis.

## Features

- **Image-Focused Design**: Large images with 3:2 aspect ratio for visual impact
- **Clean Layout**: Simple, modern design with proper spacing and typography
- **Responsive Grid**: Adapts from single column on mobile to two columns on larger screens
- **Background Images**: Optional background image support with overlay controls
- **Universal Editor**: Full support for drag-and-drop editing and content management
- **Performance Optimized**: Uses `createOptimizedPicture` for responsive image delivery

## Usage

The background-cards block displays a container of image cards, each featuring:

- Large responsive image (3:2 aspect ratio)
- Heading text
- Optional description text

Perfect for:
- Before/After comparisons
- Product showcases  
- Feature highlights
- Portfolio displays
- Case studies

## Content Structure

### Container Level
- **Background Image**: Optional background image for the entire section
- **No Overlay**: Option to remove background image overlay

### Card Level  
- **Card Image**: Main image for the card (required)
- **Card Image Alt Text**: Alt text for accessibility (required)
- **Card Heading**: Heading displayed below the image (required)
- **Card Description**: Optional description text below the heading

## Styling

The block uses:
- **Colors**: Black background with white text for high contrast and visual impact
- **Images**: 3:2 aspect ratio (1200x800px equivalent) with object-fit cover
- **Typography**: Responsive heading and body text using design system variables
- **Spacing**: Consistent 12px gap between image and text, 4px gap between heading and description
- **Grid**: 12-column responsive grid with proper gutters and margins

## Responsive Behavior

- **Mobile (< 768px)**: Cards stack vertically, spanning full width
- **Tablet (768px+)**: Cards display in a 2-column layout  
- **Desktop (1200px+)**: Maintains 2-column layout for optimal image display

## Universal Editor Integration

This block is fully compatible with Adobe's Universal Editor:
- Drag-and-drop content editing
- In-place text editing
- Image upload and management with alt text
- Component-level configuration
- Multi-item management for adding/removing cards

## Example HTML Structure

```html
<div class="background-cards">
  <div>
    <div><img src="/path/to/background-image.jpg" alt="Background"></div>
  </div>
  <div data-aue-filter="background-card">
    <div><img src="/path/to/before-image.jpg" alt="Before solution"></div>
    <div>Before</div>
    <div>Traditional approach with complex setup</div>
  </div>
  <div data-aue-filter="background-card">
    <div><img src="/path/to/after-image.jpg" alt="After solution"></div>
    <div>After</div>
    <div>Streamlined solution with better results</div>
  </div>
</div>
```

## Technical Implementation

- **JavaScript**: Dynamic content processing with `createOptimizedPicture` for responsive images
- **CSS**: Mobile-first responsive design using CSS Grid and aspect-ratio for consistent image sizing
- **Models**: Image-focused Universal Editor models with required image fields
- **Accessibility**: Proper semantic HTML structure with required alt text and heading hierarchy
- **Performance**: Optimized image delivery with responsive breakpoints and lazy loading

## Accessibility Features

- Semantic HTML structure with proper headings hierarchy
- Required alt text for all images
- Keyboard navigation support
- Screen reader compatible
- WCAG 2.1 AA compliant color contrast ratios
- Focus indicators for interactive elements

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and aspect-ratio support required
- Graceful fallback for older browsers
- Mobile browser optimized

## Changelog

### v1.0.0 (2025-01-14)
- Initial implementation based on Figma design
- Image-focused card layout with 3:2 aspect ratio
- Responsive design for all breakpoints
- Universal Editor integration with image-focused models
- `createOptimizedPicture` integration for performance
- Clean, minimal styling for maximum visual impact
