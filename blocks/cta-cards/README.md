# CTA Cards Block

Call-to-action cards designed to drive user engagement and conversions. Perfect for highlighting key services, payment options, account management features, and promotional content.

## Features

- **Conversion-Focused Design**: Large, prominent call-to-action buttons
- **Responsive Grid**: Adapts from 1 column (mobile) to 4 columns (large desktop)
- **Optimized Images**: Uses `createOptimizedPicture` for responsive image delivery
- **Columbia Gas Styling**: Matches the call-to-action-cards section design
- **Multiple Layouts**: Support for 2-column and horizontal card variants
- **Universal Editor**: Full support for drag-and-drop editing

## Usage

The CTA cards block displays conversion-focused cards, each featuring:

- Large responsive image (optimized with WebP support)
- Compelling headline
- Descriptive text
- Prominent call-to-action button

Perfect for:
- Payment options and billing features
- Account management services
- Service enrollment (Budget Plan, Paperless Billing)
- Customer support resources
- Mobile app promotion
- Emergency services information

## Content Structure

Each card should contain:

1. **Image**: Visual representation of the service/feature
2. **Title**: Clear, action-oriented headline
3. **Description**: Brief explanation of benefits/features
4. **Link**: Call-to-action with descriptive text

## Authoring Example

```
| Image | Title | Description | Link |
|--------|--------|--------|--------|
| ![Payment Plans](./payment-plans.jpg) | Payment Plans | We offer payment arrangements to help you if you are having trouble paying your bill. | [Enroll Online](./payment-plans.html) |
| ![Budget Plan](./budget-plan.jpg) | Get on our Budget Plan | This program allows you to pay about the same amount each month based on usage, weather and projected costs. | [Explore Budget Plan](./budget-plan.html) |
| ![Billing Alerts](./billing-alerts.jpg) | Get billing and payment alerts | Sign into your account and enroll in billing and payment alerts to get updates about your bill. | [Enroll today](./alerts.html) |
```

## Variants

### Two-Column Layout
Add `two-columns` class for 2 cards per row on all screen sizes:
```html
<div class="cta-cards two-columns">
```

### Horizontal Layout
Add `horizontal` class for side-by-side image and content on tablets and larger:
```html
<div class="cta-cards horizontal">
```

## Technical Implementation

- **JavaScript**: Dynamic content processing with `createOptimizedPicture` for responsive images
- **CSS**: Mobile-first responsive design using CSS Grid
- **Images**: Optimized delivery with lazy loading and responsive breakpoints
- **Accessibility**: Proper semantic HTML structure with ARIA labels
- **Performance**: Optimized image sizes (400px base width) for CTA cards

## Responsive Behavior

- **Mobile (< 768px)**: Single column layout, 200px image height
- **Tablet (768px - 899px)**: 2 columns, 220px image height
- **Desktop (900px - 1199px)**: 3 columns, 240px image height
- **Large Desktop (1200px+)**: 4 columns, 200px image height

## Accessibility Features

- Semantic HTML structure with proper headings
- ARIA labels for call-to-action buttons
- Keyboard navigation support
- Screen reader compatible
- High contrast color ratios
- Focus indicators for interactive elements

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- WebP image format with fallbacks
- Progressive enhancement for older browsers

## Performance Optimization

- Lazy loading for images below the fold
- WebP format with JPEG fallbacks
- Responsive breakpoints: 400px base width
- CSS transitions for smooth interactions
- Optimized grid layout for rendering performance

## Changelog

### v1.0.0 (2025-10-23)
- Initial implementation based on Columbia Gas call-to-action cards
- Responsive grid layout with mobile-first approach
- Universal Editor integration with proper instrumentation
- `createOptimizedPicture` integration for performance
- Support for multiple layout variants
- Accessible design with proper semantic structure