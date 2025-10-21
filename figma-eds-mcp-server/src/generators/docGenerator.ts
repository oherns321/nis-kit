import { BlockAnalysis } from '../types.js';
import { FieldDefinition } from '../interfaces.js';

export class DocGenerator {

  /**
   * Generate documentation for a block based on analysis
   */
  async generate(analysis: BlockAnalysis): Promise<string> {
    const readme = this.createReadme(analysis);
    return readme;
  }

  private createReadme(analysis: BlockAnalysis): string {
    const sections = [];

    // Header and purpose
    sections.push(this.generateHeader(analysis));

    // Universal Editor model
    sections.push(this.generateModelSection(analysis));

    // Field definitions
    sections.push(this.generateFieldsSection(analysis));

    // Styling options
    sections.push(this.generateStylingSection(analysis));

    // Implementation details
    sections.push(this.generateImplementationSection(analysis));

    // Testing information
    sections.push(this.generateTestingSection(analysis));

    return sections.join('\n\n');
  }

  private generateHeader(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const blockTitle = this.capitalizeWords(blockName.replace(/-/g, ' '));
    
    return `# ${blockTitle}

The ${blockTitle} block displays ${
      analysis.blockType === 'multi-item' ? 'multiple items' : 'content'
    } in a responsive layout.

## Purpose

This block enables editors to ${
      analysis.blockType === 'multi-item' ? 'create collections of' : 'present'
    } ${blockName.replace(/-/g, ' ')} with consistent styling and responsive behavior.

## Design System Integration

- Uses EY design system variables from \`/styles/root.css\`
- Responsive grid system with Figma-accurate gutters
- Typography automatically applied (h1-h6 work without custom CSS)
- Follows Universal Editor authoring patterns`;
  }

  private generateModelSection(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;

    if (analysis.blockType === 'multi-item') {
      return `## Universal Editor Model

This block follows the **Container + Item** model:

### Container Model (\`_${blockName}.json\`)
- **Purpose**: Defines the overall block configuration and container-level fields
- **Fields**: ${analysis.contentStructure.containerFields.length > 0 ? 
  analysis.contentStructure.containerFields.map(f => `${f.name} (${f.label})`).join(', ') : 
  'None - uses items only'}

### Item Model (\`_${blockName}-item.json\`)
- **Purpose**: Defines the structure for individual ${blockName.replace(/-/g, ' ')} items
        - **Fields**: ${analysis.contentStructure.itemFields?.map(f => `${f.name} (${f.label})`).join(', ') || 'None'}
- **Repeatable**: Yes - editors can add/remove items as needed

### Section Integration
Added to \`/models/_section.json\` allowedComponents for page-level and container insertion.`;
    } else {
      return `## Universal Editor Model

This block follows the **Single Item** model:

### Block Model (\`_${blockName}.json\`)
- **Purpose**: Defines the block configuration and content fields
- **Fields**: ${analysis.contentStructure.containerFields.map(f => `${f.name} (${f.label})`).join(', ')}
- **Repeatable**: No - single instance per block

### Section Integration
Added to \`/models/_section.json\` allowedComponents for page-level insertion.`;
    }
  }

  private generateFieldsSection(analysis: BlockAnalysis): string {
    const sections = [];

    if (analysis.contentStructure.containerFields.length > 0) {
      sections.push('### Container Fields');
      const containerTable = this.generateFieldsTable(analysis.contentStructure.containerFields);
      sections.push(containerTable);
    }

    if (analysis.contentStructure.itemFields && analysis.contentStructure.itemFields.length > 0) {
      sections.push('### Item Fields');
      const itemTable = this.generateFieldsTable(analysis.contentStructure.itemFields);
      sections.push(itemTable);
    }

    return `## Field Definitions\n\n${sections.join('\n\n')}`;
  }

  private generateFieldsTable(fields: FieldDefinition[]): string {
    let table = '| Field Name | Label | Type | Required | Description |\n';
    table += '|------------|-------|------|----------|-------------|\n';

    fields.forEach(field => {
      const type = this.getFieldType(field);
      const required = field.required ? 'Yes' : 'No';
      const description = field.description || this.generateFieldDescription(field);
      
      table += `| \`${field.name}\` | ${field.label || field.name} | ${type} | ${required} | ${description} |\n`;
    });

    return table;
  }

  private getFieldType(field: FieldDefinition): string {
    if (field.name.includes('Cta') && !field.name.includes('Text')) return 'URL';
    if (field.name.toLowerCase().includes('image')) return 'Image';
    if (field.name.toLowerCase().includes('heading')) return 'Rich Text';
    if (field.name.toLowerCase().includes('body')) return 'Rich Text';
    if (field.name.toLowerCase().includes('text')) return 'Text';
    return 'Text';
  }

  private generateFieldDescription(field: FieldDefinition): string {
    if (field.name.includes('Heading')) return 'Main heading text with rich formatting support';
    if (field.name.includes('Body')) return 'Body content with rich text formatting';
    if (field.name.includes('Cta') && !field.name.includes('Text')) return 'Call-to-action button URL';
    if (field.name.includes('CtaText')) return 'Call-to-action button text';
    if (field.name.toLowerCase().includes('image')) return 'Image asset with automatic optimization';
    return `Content for ${(field.label || field.name).toLowerCase()}`;
  }

  private generateStylingSection(analysis: BlockAnalysis): string {
    return `## Styling Options

### CSS Variables Used
- **Colors**: \`var(--text-primary)\`, \`var(--text-secondary)\`, \`var(--background-primary)\`
- **Typography**: \`var(--heading-font-size-xl)\`, \`var(--body-font-size-m)\`, \`var(--font-family-heading)\`
- **Spacing**: \`var(--spacing-s)\`, \`var(--spacing-m)\`, \`var(--spacing-l)\`
- **Grid**: \`var(--grid-container-width)\`, \`var(--grid-gutter-width)\`

### Responsive Behavior
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid with adjusted spacing
- **Desktop**: Full grid layout as designed

### Configuration Classes
${analysis.contentStructure.configurationOptions.map(option => 
  `- \`${option}\`: ${this.getConfigurationDescription(option)}`
).join('\n')}

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Progressive enhancement for older browsers
- Accessible by default (WCAG 2.1 AA)`;
  }

  private getConfigurationDescription(option: string): string {
    const descriptions: { [key: string]: string } = {
      'dark': 'Applies dark theme styling',
      'light': 'Applies light theme styling (default)',
      'compact': 'Reduces spacing for dense layouts',
      'centered': 'Centers content alignment',
      'full-width': 'Removes container constraints',
      'no-padding': 'Removes default padding'
    };
    return descriptions[option] || `Applies ${option} styling variant`;
  }

  private generateImplementationSection(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;

    return `## Implementation Details

### JavaScript Functionality
- **Universal Editor Support**: Full compatibility with UE DOM structure
- **Instrumentation Preservation**: Maintains UE editing capabilities
- **Progressive Enhancement**: Works without JavaScript
- **Performance**: Minimal runtime overhead

### File Structure
\`\`\`
/blocks/${blockName}/
├── README.md                    # This documentation
├── ${blockName}.css            # Styling with design system variables
├── ${blockName}.js             # Decoration and UE compatibility logic
├── icon.svg                    # Block icon for Universal Editor
└── _${blockName}.json          # ${
      analysis.blockType === 'multi-item' ? 'Container model definition' : 'Block model definition'
    }
${analysis.blockType === 'multi-item' ? `└── _${blockName}-item.json     # Item model definition` : ''}
\`\`\`

### Universal Editor Integration
- **DOM Processing**: Handles nested \`<div><div><p>content</p></div></div>\` structure
- **Content Extraction**: Safely extracts text, links, and images from UE markup
- **Instrumentation**: Preserves UE editing annotations with \`moveInstrumentation\`
- **Empty States**: Provides placeholders for new content creation

### Dependencies
- **EDS Framework**: \`/scripts/scripts.js\` for \`moveInstrumentation\`
- **Design System**: \`/styles/root.css\` for CSS variables
- **No External Libraries**: Pure vanilla JavaScript implementation`;
  }

  private generateTestingSection(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;

    return `## Testing

### Test Files
- \`/test/${blockName}.html\`: Basic block structure for development testing
- \`/test/${blockName}-realstructure.html\`: Universal Editor DOM structure testing

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
\`\`\`html
<div class="${blockName}">
  ${this.generateUsageExample(analysis)}
</div>
\`\`\`

### With Configuration
\`\`\`html
<div class="${blockName}">
  <div><div><p>dark</p></div></div>
  ${this.generateUsageExample(analysis)}
</div>
\`\`\``;
  }

  private generateUsageExample(analysis: BlockAnalysis): string {
    if (analysis.blockType === 'multi-item') {
      // Generate example based on item fields
      const exampleItems = [];
      for (let i = 1; i <= 2; i++) {
        const cells: string[] = [];
        analysis.contentStructure.itemFields?.forEach(field => {
          if (field.name.includes('Heading')) {
            cells.push(`<p>Example Heading ${i}</p>`);
          } else if (field.name.includes('Body')) {
            cells.push(`<p>Example body content for item ${i}</p>`);
          } else if (field.name.includes('Cta') && !field.name.includes('Text')) {
            cells.push(`<p><a href="#example-${i}">Example Link ${i}</a></p>`);
          }
        });
        
        if (cells.length > 0) {
          exampleItems.push(`  <div>
    <div>${cells.join('</div>\n    <div>')}</div>
  </div>`);
        }
      }
      
      let example = '';
      if (analysis.contentStructure.containerFields.length > 0) {
        example += '  <div><div><p>Container Heading</p></div></div>\n';
      }
      example += exampleItems.join('\n');
      
      return example;
    } else {
      return '  <div><div><p>Single item content</p></div></div>';
    }
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}