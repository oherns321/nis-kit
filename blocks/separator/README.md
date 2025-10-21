# Separator Block

A visual separator block that displays a horizontal gradient line to separate content sections.

## Overview

The separator block creates a decorative horizontal line with a gradient from teal to lime to yellow. It provides visual separation between content sections and integrates with the grid system.

## Features

- **Universal Editor Ready**: Includes model configuration for content authoring
- **JavaScript-built HTML**: Uses decorator function to build the separator structure
- **Gradient Line**: Teal → Lime → Yellow horizontal gradient line
- **Responsive Design**: Adapts to all screen sizes with proper grid integration
- **Accessibility**: Includes proper ARIA attributes for screen readers
- **Grid Integration**: Follows the established 12-column grid system

## Files

- `separator.js` - Block decorator that creates the separator structure
- `separator.css` - Styling for the gradient line and responsive behavior
- `_separator.json` - Universal Editor model (no fields required)
- `separator.html` - HTML fragment for testing/reference
- `icon.svg` - Block icon for the editor
- `README.md` - This documentation

## Universal Editor Model

The separator block uses a simple Universal Editor model with no required fields:

```json
{
  "definitions": [
    {
      "title": "Separator",
      "id": "separator",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Separator",
              "model": "separator"
            }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "separator",
      "fields": []
    }
  ]
}
```

## HTML Structure

The JavaScript decorator creates this structure:

```html
<div class="separator block" data-block-name="separator">
    <div class="separator-content">
        <div class="separator-line" role="separator" aria-label="Content separator"></div>
    </div>
</div>
```

## CSS Classes

- `.separator` - Main block container
- `.separator-content` - Inner content wrapper
- `.separator-line` - The actual gradient line element

## Usage

The separator block requires no configuration or content. Simply add it to your document and it will render a gradient line.

### In Universal Editor

1. Add a new separator block to your page
2. No configuration needed - the separator will render automatically

### In Document Authoring

Simply add a separator block to your document - no content needed.

## Styling

The gradient uses CSS custom properties and creates a 2px high line with the signature teal-lime-yellow gradient. The block integrates with the grid system margins for consistent spacing.

## JavaScript

The `separator.js` decorator:
- Creates the necessary HTML structure
- Adds accessibility attributes
- Clears any existing content to ensure clean rendering

## Accessibility

- Uses `role="separator"` for semantic meaning
- Includes `aria-label` for screen reader users
- Maintains proper contrast and visual hierarchy

## Browser Support

Works in all modern browsers with CSS Grid and linear-gradient support.
