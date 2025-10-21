# Super Cards Block

A responsive cards component with container heading and dual CTA buttons, designed for Adobe Edge Delivery Services with Universal Editor support.

## Overview

The Super Cards block displays a collection of cards with:
- Container-level heading
- Individual card headings and body text
- Primary and secondary CTA buttons per card
- Responsive grid layout (1 column mobile, 2 columns tablet/desktop)
- Built-in empty state support for Universal Editor

## Features

- **Responsive Design**: Mobile-first with responsive breakpoints
- **Design System Integration**: Uses EY theme variables exclusively
- **Universal Editor Compatible**: Full authoring and editing support
- **Dual CTAs**: Primary and secondary call-to-action buttons per card
- **Semantic HTML**: Proper heading hierarchy and accessible markup
- **Performance Optimized**: Lightweight JavaScript (< 3KB minified)

## Usage

### Basic Structure

```html
<div class="super-cards block" data-block-name="super-cards">
  <!-- Container heading -->
  <div><div><p>Your Container Title</p></div></div>
  
  <!-- Card 1 -->
  <div><div><p>Card 1 Heading</p></div></div>
  <div><div><p>Card 1 body text content...</p></div></div>
  <div><div><p><a href="/primary-link">Primary CTA</a></p></div></div>
  <div><div><p><a href="/secondary-link">Secondary CTA</a></p></div></div>
  
  <!-- Card 2 -->
  <div><div><p>Card 2 Heading</p></div></div>
  <div><div><p>Card 2 body text content...</p></div></div>
  <div><div><p><a href="/primary-link-2">Primary CTA</a></p></div></div>
  <div><div><p><a href="/secondary-link-2">Secondary CTA</a></p></div></div>
</div>
```

### Universal Editor Fields

#### Container Fields
- **Container Heading**: Main heading displayed above all cards

#### Card Item Fields (repeatable)
- **Card Heading**: Individual card heading (h3 element)
- **Card Body Text**: Main content text (supports rich text)
- **Primary CTA URL**: URL for primary button
- **Primary CTA Text**: Display text for primary button
- **Secondary CTA URL**: URL for secondary button  
- **Secondary CTA Text**: Display text for secondary button

### Variants

Currently supports theme variants:
- `light` (default)
- `dark` 
- `compact`
- `centered`

Add variant as a text content row: `<div><div><p>dark</p></div></div>`

## Technical Details

### CSS Architecture
- Uses CSS Grid for responsive layout
- Leverages design system variables from `/styles/root.css`
- Mobile-first responsive design
- Container queries for fine-grained control

### JavaScript Features
- Universal Editor DOM structure handling
- Content extraction from nested wrappers
- Empty state placeholder support
- Automatic instrumentation preservation
- Configuration value processing

### Grid Layout
- **Mobile**: 1 column (full width)
- **Tablet** (768px+): 2 columns  
- **Desktop** (900px+): 2 columns with optimal spacing

### Button Styles
- **Primary**: Filled button with brand color background
- **Secondary**: Outlined button with brand color border
- Both buttons support hover states and disabled states

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Supports CSS Grid and Container Queries
- Progressive enhancement for older browsers

## Performance

- **CSS**: Minimal custom styles, leverages design system
- **JavaScript**: < 3KB minified + gzipped
- **Lazy Loading**: Compatible with EDS lazy loading
- **Core Web Vitals**: Optimized for LCP, CLS, FID

## Accessibility

- **WCAG 2.1 AA Compliant**
- **Semantic HTML**: Proper heading hierarchy
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Descriptive labels and ARIA attributes
- **Color Contrast**: Meets contrast requirements

## Development

### File Structure
```
blocks/super-cards/
├── super-cards.css          # Block styles
├── super-cards.js           # Block functionality  
├── _super-cards.json        # Universal Editor model
├── README.md                # This documentation
└── icon.svg                 # Block icon (if needed)

test/
├── super-cards.html                    # Simple test file
└── super-cards-realstructure.html      # Universal Editor test
```

### Testing
1. Open test files in browser
2. Both files should render identically after JavaScript processing
3. Test responsive breakpoints 
4. Validate accessibility with screen reader
5. Check Universal Editor compatibility

### Customization
- Modify CSS variables in `/styles/root.css` for global changes
- Override specific styles in block CSS file for component-specific changes
- Use variant classes for theme variations

## Changelog

### v1.0.0
- Initial release
- Universal Editor support
- Responsive grid layout
- Dual CTA button support
- Design system integration