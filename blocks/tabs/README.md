# Tabs Block

A responsive tabs component that matches the Figma design specifications with a clean, modern interface.

## Features

- **Figma Design Match**: Styled to match node-id=10454:20346 specifications
- **Design System Integration**: Uses Adobe EDS design system variables
- **Responsive Layout**: Mobile-first responsive design with proper breakpoints  
- **Accessibility**: Full ARIA support with proper roles and attributes
- **Universal Editor**: Compatible with Adobe Universal Editor for content authoring

## Visual Design

- Black background container with white text
- Clean tab interface with active/inactive states
- White 2px underline for active tabs
- Proper typography scaling and spacing
- Maximum container width of 1200px with responsive margins

## Usage

### Basic Implementation
```html
<div class="tabs block">
  <div>
    <div>Before: Out-of-the-box</div>
    <div>
      <p>Content for the first tab</p>
    </div>
  </div>
  <div>
    <div>After: Branded</div>
    <div>
      <p>Content for the second tab</p>
    </div>
  </div>
</div>
```

### Universal Editor
The block supports multi-item editing through Universal Editor with:
- Tab name field (text input)
- Tab content field (rich text editor)
- Add/remove tab functionality

## Design System Variables Used

### Typography
- `--font-size-body-m` (16px) - Tab text size
- `--line-height-body-s` (24px) - Tab line height  
- `--font-weight-body` (400) - Inactive tab weight
- `--font-weight-body-semibold` (600) - Active tab weight
- `--body-font-family` - Font family

### Colors
- `--surface-black` - Background color
- `--text-on-color` - Text and active underline color
- `#5d5d66` - Bottom border line (Border/Tertiary)

### Spacing
- `--spacing-xs` (8px) - Tab gaps and padding
- `--spacing-xl` (40px) - Content top padding
- `--grid-section-margin` (60px) - Container vertical padding

### Layout
- `--grid-max-width-desktop` (1200px) - Maximum container width
- `--grid-margin-desktop` (120px) - Desktop margins
- `--grid-margin-tablet` (32px) - Tablet margins  
- `--grid-margin` (16px) - Mobile margins

## Responsive Behavior

### Mobile (< 768px)
- 16px side margins
- Full-width container
- Stacked tab layout if needed

### Tablet (768px - 899px)  
- 32px side margins
- Responsive typography

### Desktop (≥ 900px)
- 120px side margins
- Maximum 1200px container width
- Optimal tab spacing

## Accessibility Features

- Full ARIA support with `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Proper `aria-selected`, `aria-hidden`, `aria-controls` attributes
- Keyboard navigation support
- Screen reader friendly structure

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Progressive enhancement approach
- Graceful degradation for older browsers

## File Structure

```
blocks/tabs/
├── tabs.css          # Main styling
├── tabs.js           # JavaScript functionality  
├── _tabs.json        # Universal Editor model
├── icon.svg          # Component picker icon
└── README.md         # This documentation
```

## Customization

The block uses design system variables, so customization should be done by:
1. Updating CSS custom properties in `styles/root.css`
2. Modifying the design system variables
3. Adding theme variants through CSS classes

## Testing

Test files are available in the `test/` directory:
- `test/tabs-figma-design.html` - Visual design verification
- `test/tabs-updated.html` - Functional testing

## Dependencies

- `scripts/aem.js` - For `toClassName` utility
- `scripts/scripts.js` - For `moveInstrumentation` utility
- Design system CSS variables from `styles/root.css`
