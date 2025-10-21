# Cards Enhanced Block

The Cards Enhanced block displays a main heading followed by two feature cards in a responsive grid layout. It's designed to showcase paired content with prominent call-to-action buttons.

## Purpose & Variants

- **Primary Use**: Feature comparison sections, service highlights, or paired content presentation
- **Theme**: Black background with cyan accent borders
- **Layout**: Responsive two-column grid (stacks on mobile)

## Authoring Guidance

### Universal Editor Fields:
1. **Main Heading**: The primary title displayed at the top
2. **Card 1 Title**: Title for the first card
3. **Card 1 Body Text**: Rich text content for the first card
4. **Card 1 CTA URL**: Link destination for the first card's button
5. **Card 1 CTA Button Text**: Display text for the first card's button
6. **Card 2 Title**: Title for the second card
7. **Card 2 Body Text**: Rich text content for the second card
8. **Card 2 CTA URL**: Link destination for the second card's button
9. **Card 2 CTA Button Text**: Display text for the second card's button

### Content Guidelines:
- **Main Heading**: Keep concise and descriptive (1-2 lines)
- **Card Titles**: Short, punchy headlines (2-4 words ideal)
- **Body Text**: 2-3 sentences describing the feature or service
- **CTA Text**: Action-oriented phrases like "Learn More", "Get Started", etc.

## Example HTML Output

```html
<div class="cards-enhanced block">
  <div class="cards-enhanced-content">
    <div class="container-header">
      <div class="header-body">
        <div class="header">
          <h1>Turn creative ideas into production-ready ready code with ease.</h1>
        </div>
      </div>
    </div>
    <div class="container-wrap">
      <div class="container-1">
        <div class="card-type-default">
          <div class="card-content">
            <div class="card-title">
              <h3>For Designers</h3>
            </div>
            <div class="card-text">
              <div class="card-body">
                <p>Ready-to-use Figma components for Adobe Experience Manager (AEM) and Edge Delivery Services (EDS)...</p>
              </div>
            </div>
            <div class="card-buttons">
              <a href="#" class="button button-secondary">Primary CTA</a>
            </div>
          </div>
        </div>
      </div>
      <div class="container-2">
        <!-- Second card structure... -->
      </div>
    </div>
  </div>
</div>
```

## Responsive Behavior

- **Mobile (0-767px)**: Cards stack vertically, full width
- **Tablet (768-899px)**: Cards side by side with tablet margins
- **Desktop (900px+)**: Full two-column layout with desktop margins

## Design System Features

- Uses Figma design system variables for consistent typography and spacing
- Black background (`var(--surface-black)`) with white text (`var(--text-on-color)`)
- Cyan accent borders (`#32ffff`) matching Figma design
- Secondary button styling with hover states
- Responsive typography scaling

## Accessibility Notes

- Semantic HTML structure with proper heading hierarchy
- Focus indicators for keyboard navigation
- High contrast mode support
- ARIA-compliant button and link elements
- Screen reader friendly content structure

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement (works without JavaScript)
- CSS Grid and Flexbox support required

## Known Limitations

- Fixed two-card layout (not configurable for 1, 3, or more cards)
- Black background theme is not configurable
- Card heights auto-adjust but don't equalize across different content lengths

## Changelog

### v1.0.0 (2024)
- Initial release
- Two-card responsive layout
- Figma design system integration
- Universal Editor model support
- Comprehensive accessibility features
