# Feature Carousel

The Feature Carousel block displays content in a responsive layout.

## Purpose

This block enables editors to present feature carousel with consistent styling and responsive behavior.

## Design System Integration

- Uses EY design system variables from `/styles/root.css`
- Responsive grid system with Figma-accurate gutters
- Typography automatically applied (h1-h6 work without custom CSS)
- Follows Universal Editor authoring patterns

## Universal Editor Model

This block follows the **Single Item** model:

### Block Model (`_feature-carousel.json`)
- **Purpose**: Defines the block configuration and content fields
- **Fields**: heading (Heading 1), text1 (Text 2), text2 (Text 3), text3 (Text 4)
- **Repeatable**: No - single instance per block

### Section Integration
Added to `/models/_section.json` allowedComponents for page-level insertion.

## Field Definitions

### Container Fields

| Field Name | Label | Type | Required | Description |
|------------|-------|------|----------|-------------|
| `heading` | Heading 1 | Rich Text | Yes | Content for heading 1 |
| `text1` | Text 2 | Text | Yes | Content for text 2 |
| `text2` | Text 3 | Text | Yes | Content for text 3 |
| `text3` | Text 4 | Text | Yes | Content for text 4 |


## Styling Options

### CSS Variables Used
- **Colors**: `var(--text-primary)`, `var(--text-secondary)`, `var(--background-primary)`
- **Typography**: `var(--heading-font-size-xl)`, `var(--body-font-size-m)`, `var(--font-family-heading)`
- **Spacing**: `var(--spacing-s)`, `var(--spacing-m)`, `var(--spacing-l)`
- **Grid**: `var(--grid-container-width)`, `var(--grid-gutter-width)`

### Responsive Behavior
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid with adjusted spacing
- **Desktop**: Full grid layout as designed

### Configuration Classes
- `light`: Applies light theme styling (default)
- `dark`: Applies dark theme styling

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Progressive enhancement for older browsers
- Accessible by default (WCAG 2.1 AA)

## Implementation Details

### JavaScript Functionality
- **Universal Editor Support**: Full compatibility with UE DOM structure
- **Instrumentation Preservation**: Maintains UE editing capabilities
- **Progressive Enhancement**: Works without JavaScript
- **Performance**: Minimal runtime overhead

### File Structure
```
/blocks/feature-carousel/
├── README.md                    # This documentation
├── feature-carousel.css            # Styling with design system variables
├── feature-carousel.js             # Decoration and UE compatibility logic
├── icon.svg                    # Block icon for Universal Editor
└── _feature-carousel.json          # Block model definition

```

### Universal Editor Integration
- **DOM Processing**: Handles nested `<div><div><p>content</p></div></div>` structure
- **Content Extraction**: Safely extracts text, links, and images from UE markup
- **Instrumentation**: Preserves UE editing annotations with `moveInstrumentation`
- **Empty States**: Provides placeholders for new content creation

### Dependencies
- **EDS Framework**: `/scripts/scripts.js` for `moveInstrumentation`
- **Design System**: `/styles/root.css` for CSS variables
- **No External Libraries**: Pure vanilla JavaScript implementation

## Testing

### Test Files
- `/test/feature-carousel.html`: Basic block structure for development testing
- `/test/feature-carousel-realstructure.html`: Universal Editor DOM structure testing

### Validation Checklist
- [ ] **Visual Accuracy**: Design matches Figma within 2% tolerance
- [ ] **Responsive Design**: Works across all breakpoints
- [ ] **Accessibility**: WCAG 2.1 AA compliance (Lighthouse 100)
- [ ] **Performance**: Lighthouse ≥90 for Performance, Best Practices, SEO
- [ ] **Universal Editor**: Full authoring and editing support
- [ ] **Code Quality**: Passes ESLint and Stylelint with zero errors

### Quality Standards
- **Lighthouse Scores**: Performance 90+, Accessibility 100, Best Practices 90+, SEO 90+
- **Bundle Size**: CSS ≤5KB, JavaScript ≤3KB (minified+gzipped)
- **Load Time**: First Contentful Paint ≤1.5s on 3G
- **Cross-browser**: Chrome, Firefox, Safari, Edge latest versions

## Usage Examples

### Basic Implementation
```html
<div class="feature-carousel">
    <div><div><p>Single item content</p></div></div>
</div>
```

### With Configuration
```html
<div class="feature-carousel">
  <div><div><p>dark</p></div></div>
    <div><div><p>Single item content</p></div></div>
</div>
```