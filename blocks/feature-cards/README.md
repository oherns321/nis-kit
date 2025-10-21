# Feature Cards Block

A responsive, feature-rich card layout block for showcasing product features, services, or benefits with images, headings, descriptions, and call-to-action buttons.

## Overview

The Feature Cards block creates a visually appealing grid of cards, each containing:
- **Feature Image**: Hero image representing the feature
- **Feature Heading**: Prominent title for the feature
- **Feature Description**: Detailed explanation of the feature
- **CTA Button**: Optional call-to-action button

Built with the EY Theme Design System, this block provides consistent spacing, typography, and responsive behavior across all devices.

## Usage

### Simple Structure (Basic Document Creation)

```html
<div class="feature-cards">
  <div>
    <div>Container Heading</div>
  </div>
  <div>
    <div><img src="feature1.jpg" alt="Feature 1"></div>
    <div>Advanced Analytics</div>
    <div>Get deep insights with powerful analytics tools.</div>
    <div><a href="/analytics">Learn More</a></div>
  </div>
  <div>
    <div><img src="feature2.jpg" alt="Feature 2"></div>
    <div>Real-time Collaboration</div>
    <div>Work together seamlessly with team members.</div>
    <div><a href="/collaboration">Get Started</a></div>
  </div>
</div>
```

### Universal Editor Structure

The block automatically handles the nested DOM structure created by Universal Editor:

```html
<div class="feature-cards block" data-block-name="feature-cards">
  <!-- Container heading -->
  <div>
    <div><div><p>Our Amazing Features</p></div></div>
  </div>
  
  <!-- Feature card items -->
  <div data-aue-filter="feature-card" data-aue-type="component">
    <div><div><div><p><img src="feature1.jpg" alt="Feature 1"></p></div></div></div>
    <div><div><div><p>Advanced Analytics</p></div></div></div>
    <div><div><div><p>Get deep insights with our powerful analytics tools that help you make informed decisions.</p></div></div></div>
    <div><div><div><p><a href="/analytics">Learn More</a></p></div></div></div>
  </div>
</div>
```

## Configuration Options

### Layout Variants

Add configuration values as separate rows to modify the layout:

| Value | Description | Responsive Behavior |
|-------|-------------|-------------------|
| `two-columns` | 2-column layout | Mobile: 1 col, Tablet+: 2 cols |
| `four-columns` | 4-column layout | Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols |
| *(default)* | 3-column layout | Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols |

### Style Options

| Value | Description |
|-------|-------------|
| `compact` | Reduced spacing between elements |
| `centered` | Center-aligned text and buttons |
| `dark` | Dark theme with light text |
| `light` | Explicit light theme (default) |

### Example with Configuration

```html
<div class="feature-cards">
  <div><div>two-columns</div></div>
  <div><div>compact</div></div>
  <div><div>centered</div></div>
  <div><div>Key Benefits</div></div>
  <!-- Feature card items... -->
</div>
```

## Universal Editor Integration

### Container Model

The feature-cards container supports:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| **heading** | Text | Main heading above cards | No |
| **variant** | Select | Layout variant (default, two-columns, four-columns) | No |
| **style** | Multi-select | Style options (compact, centered, dark, light) | No |

### Feature Card Model

Each feature card supports:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| **image** | Reference | Feature image | Yes |
| **featureHeading** | Text | Card heading (max 100 chars) | Yes |
| **featureDescription** | Rich Text | Card description (max 500 chars) | Yes |
| **cta** | Text | CTA button URL | No |
| **ctaText** | Text | CTA button text (max 50 chars) | No |

### Important Field Naming Rules

⚠️ **Critical**: Avoid using `title` or `imageAlt` as field names - these are restricted in Universal Editor.

✅ **Correct field names**: `featureHeading`, `featureDescription`, `cta`, `ctaText`
❌ **Forbidden**: `title`, `cardTitle`, `imageAlt` (without base `image` field)

## Responsive Behavior

### Breakpoints

| Screen Size | Columns | Cards per Row |
|-------------|---------|---------------|
| Mobile (< 768px) | Full width | 1 |
| Tablet (768px - 899px) | Half width | 2 |
| Desktop (≥ 900px) | Third width | 3 |
| Large Desktop (≥ 1200px) | Enhanced typography | 3 |

### Layout Variants Override

- **Two Columns**: Mobile 1, Tablet+ 2
- **Four Columns**: Mobile 1, Tablet 2, Desktop 4

## Design System Integration

### Typography

All typography uses EY Theme design system variables:
- **Headings**: Automatic responsive scaling from `--font-size-heading-*`
- **Body Text**: `--font-size-body-*` with proper line heights
- **Font Weights**: `--font-weight-headings`, `--font-weight-body`

### Colors

- **Text**: `--text-primary`, `--text-secondary`, `--text-tertiary`
- **Surfaces**: `--surface-white`, `--surface-black`, `--surface-grey-light`
- **Buttons**: `--button-primary`, `--button-primary-hover`
- **Borders**: `--border-primary`, `--border-tertiary`

### Spacing

- **Margins**: `--spacing-xl`, `--spacing-xxl` for block margins
- **Padding**: `--spacing-m` for card content
- **Gaps**: `--grid-gutter` for consistent grid spacing

## Accessibility Features

- **Semantic HTML**: Uses proper heading hierarchy (`h2`, `h3`)
- **ARIA Labels**: Images include descriptive alt text
- **Keyboard Navigation**: Buttons and links are keyboard accessible
- **Color Contrast**: Meets WCAG 2.1 AA standards
- **Screen Readers**: Proper content structure and labeling

## Performance Optimizations

- **Image Optimization**: Automatic `createOptimizedPicture` implementation
- **Responsive Images**: Proper breakpoint-based image serving
- **CSS Grid**: Efficient layout with minimal reflows
- **Hover Effects**: Hardware-accelerated transforms
- **Bundle Size**: Minimal JavaScript footprint

## Browser Support

- **Modern Browsers**: Full support (Chrome 88+, Firefox 87+, Safari 14+, Edge 88+)
- **CSS Grid**: Required for layout
- **CSS Custom Properties**: Required for design system integration

## Examples

### Basic Feature Showcase

```html
<div class="feature-cards">
  <div><div>Why Choose Our Platform?</div></div>
  <div>
    <div><img src="/images/analytics.jpg" alt="Analytics Dashboard"></div>
    <div>Advanced Analytics</div>
    <div>Powerful insights with real-time reporting and custom dashboards.</div>
    <div><a href="/features/analytics">Explore Analytics</a></div>
  </div>
  <div>
    <div><img src="/images/security.jpg" alt="Security Shield"></div>
    <div>Enterprise Security</div>
    <div>Bank-level security with end-to-end encryption and compliance.</div>
    <div><a href="/security">Learn More</a></div>
  </div>
</div>
```

### Compact Two-Column Layout

```html
<div class="feature-cards">
  <div><div>two-columns</div></div>
  <div><div>compact</div></div>
  <div><div>Key Benefits</div></div>
  <div>
    <div><img src="/images/productivity.jpg" alt="Productivity Tools"></div>
    <div>Boost Productivity</div>
    <div>Streamline workflows with automation and intuitive tools.</div>
    <div><a href="/productivity">Try Now</a></div>
  </div>
  <div>
    <div><img src="/images/scaling.jpg" alt="Scalable Infrastructure"></div>
    <div>Scale with Confidence</div>
    <div>Handle millions of users without compromising performance.</div>
    <div><a href="/scaling">View Plans</a></div>
  </div>
</div>
```

## Testing

Run the test files to verify functionality:

- **Basic Test**: `/test/feature-cards.html`
- **Universal Editor Test**: `/test/feature-cards-realstructure.html`

## Files Structure

```
/blocks/feature-cards/
├── README.md                           # This documentation
├── feature-cards.js                    # Block decoration logic
├── feature-cards.css                   # Responsive styles with design system
├── _feature-cards.json                 # Universal Editor model definition
└── icon.svg                           # Block icon for Universal Editor

/test/
├── feature-cards.html                  # Basic functionality test
└── feature-cards-realstructure.html    # Universal Editor DOM test
```

## Related Blocks

- **Cards**: Basic card layout without images
- **Super Cards**: Cards with multiple CTAs
- **Background Cards**: Cards with background images
- **Tab Cards**: Tabbed interface with cards

---

*This block is built with the Adobe Edge Delivery Services (EDS) framework and EY Theme Design System.*