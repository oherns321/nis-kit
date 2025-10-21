# Test Super Cards

The Test Super Cards block displays content in a responsive layout.

## Purpose

This block enables editors to present test super cards with consistent styling and responsive behavior.

## Design System Integration

- Uses EY design system variables from `/styles/root.css`
- Responsive grid system with Figma-accurate gutters
- Typography automatically applied (h1-h6 work without custom CSS)
- Follows Universal Editor authoring patterns

## Universal Editor Model

This block follows the **Single Item** model:

### Block Model (`_test-super-cards.json`)
- **Purpose**: Defines the block configuration and content fields
- **Fields**: heading (Heading 1), text1 (Text 2), text2 (Text 3), text3 (Text 4), heading4 (Heading 5), text5 (Text 6), text6 (Text 7), text7 (Text 8), text8 (Text 9), text9 (Text 10), heading10 (Heading 11), text11 (Text 12), text12 (Text 13), text13 (Text 14)
- **Repeatable**: No - single instance per block

### Section Integration
Added to `/models/_section.json` allowedComponents for page-level insertion.

## Field Definitions

### Container Fields

| Field Name | Label | Type | Required | Description |
|------------|-------|------|----------|-------------|
| `heading` | Heading 1 | Rich Text | No | Content for heading 1 |
| `text1` | Text 2 | Text | No | Content for text 2 |
| `text2` | Text 3 | Text | No | Content for text 3 |
| `text3` | Text 4 | Text | No | Content for text 4 |
| `heading4` | Heading 5 | Rich Text | No | Content for heading 5 |
| `text5` | Text 6 | Text | No | Content for text 6 |
| `text6` | Text 7 | Text | No | Content for text 7 |
| `text7` | Text 8 | Text | No | Content for text 8 |
| `text8` | Text 9 | Text | No | Content for text 9 |
| `text9` | Text 10 | Text | No | Content for text 10 |
| `heading10` | Heading 11 | Rich Text | No | Content for heading 11 |
| `text11` | Text 12 | Text | No | Content for text 12 |
| `text12` | Text 13 | Text | No | Content for text 13 |
| `text13` | Text 14 | Text | No | Content for text 14 |


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
/blocks/test-super-cards/
├── README.md                    # This documentation
├── test-super-cards.css            # Styling with design system variables
├── test-super-cards.js             # Decoration and UE compatibility logic
├── icon.svg                    # Block icon for Universal Editor
└── _test-super-cards.json          # Block model definition

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
- `/test/test-super-cards.html`: Basic block structure for development testing
- `/test/test-super-cards-realstructure.html`: Universal Editor DOM structure testing

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
<div class="test-super-cards">
    <div><div><p>Single item content</p></div></div>
</div>
```

### With Configuration
```html
<div class="test-super-cards">
  <div><div><p>dark</p></div></div>
    <div><div><p>Single item content</p></div></div>
</div>
```