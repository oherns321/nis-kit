import { BlockAnalysis } from '../types.js';

export class CSSGenerator {

  /**
   * Generate CSS for a block based on analysis
   */
  async generate(analysis: BlockAnalysis): Promise<string> {
    const css = this.createCSS(analysis);
    return css;
  }

  private createCSS(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const sections = [];

    // Header comment
    sections.push(`/* ${this.capitalize(blockName.replace(/-/g, ' '))} Block */`);

    // Container styling
    sections.push(this.generateContainerStyles(blockName));

    // Main block styles
    sections.push(this.generateMainBlockStyles(analysis));

    // Content styles based on block type
    if (analysis.blockType === 'multi-item') {
      sections.push(this.generateMultiItemStyles(analysis));
    } else {
      sections.push(this.generateSingleItemStyles(analysis));
    }

    // Button styles if needed
    if (this.hasButtons(analysis)) {
      sections.push(this.generateButtonStyles(analysis));
    }

    // Empty state styles for Universal Editor
    sections.push(this.generateEmptyStateStyles(blockName));

    // Responsive styles
    sections.push(this.generateResponsiveStyles(analysis));

    return sections.join('\n\n');
  }

  private generateContainerStyles(blockName: string): string {
    return `/* Container styling */
.${blockName}-container .${blockName}-wrapper {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}`;
  }

  private generateMainBlockStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    return `.${blockName} {
  padding: var(--spacing-xl) var(--grid-margin);
}`;
  }

  private generateMultiItemStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    const styles = [];

    // Container heading if present
    if (analysis.contentStructure.containerFields.some(f => f.name.includes('heading'))) {
      styles.push(`/* Main heading uses design system typography automatically */
.${blockName} .container-heading {
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
  text-align: left;
}`);
    }

    // Items container with responsive grid
    styles.push(`/* Items container with responsive grid */
.${blockName} .items-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  max-width: var(--grid-max-width);
  margin: 0 auto;
}`);

    // Individual item styling
    styles.push(`/* Individual item styling */
.${blockName} .item {
  background: var(--surface-white);
  border: 1px solid var(--border-tertiary);
  padding: var(--spacing-l);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
  grid-column: span var(--grid-columns); /* Full width on mobile */
}`);

    // Item heading
    styles.push(`/* Item heading */
.${blockName} .item-heading {
  color: var(--text-primary);
  margin: 0;
  font-family: var(--heading-font-family);
  font-weight: var(--font-weight-headings);
  font-size: var(--heading-font-size-l);
  line-height: var(--line-height-headings-l);
}`);

    // Item body text
    styles.push(`/* Item body text */
.${blockName} .item-body {
  color: var(--text-primary);
  font-family: var(--body-font-family);
  font-weight: var(--font-weight-regular);
  font-size: var(--font-size-body-l);
  line-height: var(--line-height-body-l);
  margin: 0;
  flex-grow: 1;
}`);

    return styles.join('\n\n');
  }

  private generateSingleItemStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    return `/* Content styling */
.${blockName} .content {
  max-width: var(--grid-max-width);
  margin: 0 auto;
}

/* Heading styling */
.${blockName} .heading {
  color: var(--text-primary);
  margin-bottom: var(--spacing-l);
}

/* Text content styling */
.${blockName} .text-content {
  color: var(--text-primary);
  font-family: var(--body-font-family);
  font-weight: var(--font-weight-regular);
  font-size: var(--font-size-body-l);
  line-height: var(--line-height-body-l);
}`;
  }

  private generateButtonStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    return `/* CTA buttons container */
.${blockName} .ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  margin-top: auto;
}

/* Button base styles */
.${blockName} .ctas .button {
  font-family: var(--body-font-family);
  font-weight: var(--font-weight-button);
  font-size: var(--font-size-button-m);
  line-height: var(--line-height-button-m);
  padding: 16px 24px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

/* Primary button */
.${blockName} .ctas .button-primary {
  background-color: var(--button-primary);
  color: var(--text-on-color);
  border: 2px solid var(--button-primary);
}

.${blockName} .ctas .button-primary:hover {
  background-color: var(--button-primary-hover, var(--button-primary));
  border-color: var(--button-primary-hover, var(--button-primary));
}

/* Secondary button */
.${blockName} .ctas .button-secondary {
  background-color: transparent;
  color: var(--button-primary);
  border: 2px solid var(--button-primary);
}

.${blockName} .ctas .button-secondary:hover {
  background-color: var(--button-primary);
  color: var(--text-on-color);
}`;
  }

  private generateEmptyStateStyles(blockName: string): string {
    return `/* Empty state placeholder styling for Universal Editor */
.${blockName} [data-placeholder]::before {
  content: attr(data-placeholder);
  color: #999;
  font-style: italic;
  opacity: 0.7;
}

.${blockName} .empty-cta[data-placeholder] {
  background-color: transparent;
  border: 2px dashed #ccc;
  color: #999;
  cursor: default;
}

.${blockName} .empty-cta[data-placeholder]:hover {
  background-color: transparent;
  border-color: #999;
  color: #666;
}

.${blockName} [data-placeholder]:empty::before {
  content: attr(data-placeholder);
  display: inline-block;
  min-height: 1em;
  min-width: 100px;
}`;
  }

  private generateResponsiveStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    if (analysis.blockType === 'single') {
      return '';
    }

    return `/* Tablet breakpoint (768px+) */
@media (width >= 768px) {
  .${blockName} .item {
    grid-column: span 4; /* Half width on tablet */
  }
}

/* Desktop breakpoint (900px+) */
@media (width >= 900px) {
  .${blockName} .item {
    grid-column: span 6; /* Half width on desktop (2 columns) */
  }
  
  /* Container heading spans appropriate columns */
  .${blockName} .container-heading {
    grid-column: span 8;
  }
}`;
  }

  private hasButtons(analysis: BlockAnalysis): boolean {
    const hasInteractionButtons = (analysis.interactions?.ctaButtons?.length ?? 0) > 0;
    const hasFieldButtons = analysis.contentStructure.itemFields && 
                           analysis.contentStructure.itemFields.some(f => f.name.includes('Cta'));
    return hasInteractionButtons || !!hasFieldButtons;
  }

  private capitalize(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}