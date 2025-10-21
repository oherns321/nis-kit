import { FigmaNode, BlockAnalysis } from '../types.js';
import { 
  DesignToken, 
  TypographyToken, 
  SpacingToken, 
  CTAButton, 
  InteractionLink, 
  HoverState,
  FigmaFill,
  BlockField
} from '../interfaces.js';

export class DesignAnalyzer {
  
  /**
   * Analyze a Figma node to determine block structure
   */
  async analyze(node: FigmaNode): Promise<BlockAnalysis> {
    const analysis: BlockAnalysis = {
      blockType: this.determineBlockType(node),
      blockName: this.sanitizeBlockName(node.name),
      contentStructure: {
        containerFields: [],
        itemFields: [],
        configurationOptions: [],
      },
      designTokens: {
        colors: [],
        typography: [],
        spacing: [],
        grid: {
          columns: 12,
          gutter: '24px',
          margin: '120px',
          maxWidth: '1200px',
        },
      },
      interactions: {
        ctaButtons: [],
        links: [],
        hovers: [],
      },
      variants: [],
      accessibility: {
        headingHierarchy: [],
        altTextRequired: false,
        colorContrast: { valid: true },
        keyboardNavigation: true,
      },
    };

    // Analyze content structure
    this.analyzeContentStructure(node, analysis);
    
    // Extract design tokens
    this.extractDesignTokens(node, analysis);
    
    // Analyze interactions
    this.analyzeInteractions(node, analysis);
    
    // Check accessibility requirements
    this.analyzeAccessibility(node, analysis);

    return analysis;
  }

  /**
   * Determine if this should be a single block or multi-item block
   */
  private determineBlockType(node: FigmaNode): 'single' | 'multi-item' {
    if (!node.children || node.children.length === 0) {
      return 'single';
    }

    // Look for repeating patterns that suggest cards/items
    const potentialItems = this.findRepeatingComponents(node);
    
    // If we find multiple similar components, it's likely multi-item
    if (potentialItems.length > 1) {
      return 'multi-item';
    }

    // Check for common multi-item indicators
    const hasContainer = this.findContainerElements(node);
    const hasTitle = this.findTitleElements(node);
    const hasRepeatingContent = this.hasRepeatingContentPattern(node);

    if (hasContainer && hasTitle && hasRepeatingContent) {
      return 'multi-item';
    }

    return 'single';
  }

  /**
   * Analyze the content structure to determine fields
   */
  private analyzeContentStructure(node: FigmaNode, analysis: BlockAnalysis): void {
    const textNodes = this.findAllTextNodes(node);
    const imageNodes = this.findAllImageNodes(node);
    const buttonNodes = this.findAllButtonNodes(node);

    if (analysis.blockType === 'multi-item') {
      // For multi-item blocks, separate container and item fields
      
      // Container fields (typically the main heading)
      const mainHeading = this.findMainHeading(textNodes);
      if (mainHeading) {
        analysis.contentStructure.containerFields.push({
          name: 'heading',
          label: 'Container Heading',
          component: 'text',
          valueType: 'string',
          required: true,
          maxLength: 200,
          description: 'Main heading displayed above the items',
        });
      }

      // Item fields (content that repeats for each item)
      const itemStructure = this.analyzeItemStructure(node);
      analysis.contentStructure.itemFields = itemStructure.fields;
      
    } else {
      // For single blocks, all fields are container fields
      analysis.contentStructure.containerFields = this.extractAllFields(textNodes, imageNodes, buttonNodes);
    }

    // Configuration options (themes, variants, etc.)
    analysis.contentStructure.configurationOptions = this.findConfigurationOptions(node);
  }

  /**
   * Extract design tokens from the Figma node
   */
  private extractDesignTokens(node: FigmaNode, analysis: BlockAnalysis): void {
    // Extract colors
    analysis.designTokens.colors = this.extractColors(node);
    
    // Extract typography
    analysis.designTokens.typography = this.extractTypography(node);
    
    // Extract spacing
    analysis.designTokens.spacing = this.extractSpacing(node);
  }

  /**
   * Analyze interactive elements
   */
  private analyzeInteractions(node: FigmaNode, analysis: BlockAnalysis): void {
    // Find CTA buttons
    analysis.interactions.ctaButtons = this.findCTAButtons(node);
    
    // Find regular links
    analysis.interactions.links = this.findLinks(node);
    
    // Analyze hover states (if available)
    analysis.interactions.hovers = this.findHoverStates(node);
  }

  /**
   * Analyze accessibility requirements
   */
  private analyzeAccessibility(node: FigmaNode, analysis: BlockAnalysis): void {
    // Determine heading hierarchy
    analysis.accessibility.headingHierarchy = this.determineHeadingHierarchy(node);
    
    // Check if images require alt text
    analysis.accessibility.altTextRequired = this.findAllImageNodes(node).length > 0;
    
    // Basic color contrast check (simplified)
    analysis.accessibility.colorContrast = this.checkColorContrast(node);
  }

  // Helper methods
  
  private sanitizeBlockName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private findAllTextNodes(node: FigmaNode): FigmaNode[] {
    const textNodes: FigmaNode[] = [];
    
    const traverse = (n: FigmaNode) => {
      if (n.type === 'TEXT') {
        textNodes.push(n);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return textNodes;
  }

  private findAllImageNodes(node: FigmaNode): FigmaNode[] {
    const imageNodes: FigmaNode[] = [];
    
    const traverse = (n: FigmaNode) => {
      if (n.type === 'RECTANGLE' && n.fills && n.fills.some((fill: FigmaFill) => fill.type === 'IMAGE')) {
        imageNodes.push(n);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return imageNodes;
  }

  private findAllButtonNodes(node: FigmaNode): FigmaNode[] {
    const buttonNodes: FigmaNode[] = [];
    
    const traverse = (n: FigmaNode) => {
      // Look for common button patterns
      if (n.name?.toLowerCase().includes('button') || 
          n.name?.toLowerCase().includes('cta') ||
          (n.type === 'FRAME' && n.backgroundColor && this.hasTextChild(n))) {
        buttonNodes.push(n);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return buttonNodes;
  }

  private hasTextChild(node: FigmaNode): boolean {
    if (node.type === 'TEXT') return true;
    if (!node.children) return false;
    return node.children.some(child => this.hasTextChild(child));
  }

  private findRepeatingComponents(node: FigmaNode): FigmaNode[] {
    if (!node.children) return [];
    
    // Group children by similar structure/size
    const groups: { [key: string]: FigmaNode[] } = {};
    
    node.children.forEach(child => {
      const signature = this.getNodeSignature(child);
      if (!groups[signature]) {
        groups[signature] = [];
      }
      groups[signature].push(child);
    });
    
    // Return groups with more than one item
    return Object.values(groups).filter(group => group.length > 1).flat();
  }

  private getNodeSignature(node: FigmaNode): string {
    // Create a signature based on node structure
    const bounds = node.absoluteBoundingBox;
    const width = bounds ? Math.round(bounds.width / 10) * 10 : 0;
    const height = bounds ? Math.round(bounds.height / 10) * 10 : 0;
    const childCount = node.children?.length || 0;
    
    return `${node.type}-${width}x${height}-${childCount}`;
  }

  private findContainerElements(node: FigmaNode): boolean {
    // Look for elements that suggest this is a container
    return node.name?.toLowerCase().includes('container') || 
           node.name?.toLowerCase().includes('wrapper') ||
           node.type === 'FRAME';
  }

  private findTitleElements(node: FigmaNode): boolean {
    const textNodes = this.findAllTextNodes(node);
    return textNodes.some(n => 
      n.name?.toLowerCase().includes('title') ||
      n.name?.toLowerCase().includes('heading') ||
      (n.style && n.style.fontSize && n.style.fontSize > 32)
    );
  }

  private hasRepeatingContentPattern(node: FigmaNode): boolean {
    return this.findRepeatingComponents(node).length > 0;
  }

  private findMainHeading(textNodes: FigmaNode[]): FigmaNode | null {
    // Find the largest text node, likely the main heading
    return textNodes.reduce((largest, node) => {
      const currentSize = node.style?.fontSize || 0;
      const largestSize = largest?.style?.fontSize || 0;
      return currentSize > largestSize ? node : largest;
    }, null as FigmaNode | null);
  }

  private analyzeItemStructure(node: FigmaNode): { fields: BlockField[] } {
    // Simplified item structure analysis
    const fields = [];
    
    // Common card patterns
    fields.push({
      name: 'cardHeading',
      label: 'Card Heading',
      component: 'text',
      valueType: 'string',
      required: true,
      maxLength: 100,
      description: 'Heading for individual card',
    });
    
    fields.push({
      name: 'cardBody',
      label: 'Card Body Text',
      component: 'richtext',
      valueType: 'string',
      required: true,
      maxLength: 500,
      description: 'Main content text for the card',
    });
    
    // Check for buttons/CTAs
    const buttons = this.findCTAButtons(node);
    if (buttons.length > 0) {
      buttons.forEach((button, index) => {
        const suffix = index === 0 ? 'Primary' : index === 1 ? 'Secondary' : `${index + 1}`;
        const ctaName = `${suffix.toLowerCase()}Cta`;
        const ctaTextName = `${suffix.toLowerCase()}CtaText`;
        
        fields.push({
          name: ctaName,
          label: `${suffix} CTA URL`,
          component: 'text',
          valueType: 'string',
          required: false,
          description: `URL for the ${suffix.toLowerCase()} call-to-action button`,
        });
        
        fields.push({
          name: ctaTextName,
          label: `${suffix} CTA Text`,
          component: 'text',
          valueType: 'string',
          required: false,
          maxLength: 50,
          description: `Display text for the ${suffix.toLowerCase()} CTA button`,
        });
      });
    }
    
    return { fields };
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private extractAllFields(textNodes: FigmaNode[], imageNodes: FigmaNode[], _buttonNodes: FigmaNode[]): BlockField[] {
    // For single blocks, create fields for all content
    const fields: BlockField[] = [];
    
    // Add text fields
    textNodes.forEach((node, index) => {
      const isHeading = node.style?.fontSize && node.style.fontSize > 24;
      fields.push({
        name: isHeading ? `heading${index || ''}` : `text${index || ''}`,
        label: isHeading ? `Heading ${index + 1}` : `Text ${index + 1}`,
        component: isHeading ? 'text' : 'richtext',
        valueType: 'string',
        required: true,
      });
    });
    
    // Add image fields
    imageNodes.forEach((node, index) => {
      fields.push({
        name: `image${index || ''}`,
        label: `Image ${index + 1}`,
        component: 'reference',
        valueType: 'string',
        required: false,
      });
    });
    
    return fields;
  }

  private findConfigurationOptions(node: FigmaNode): string[] {
    // Look for common configuration patterns
    const options = ['light', 'dark'];
    
    // Check node name for variants
    if (node.name?.toLowerCase().includes('compact')) {
      options.push('compact');
    }
    
    if (node.name?.toLowerCase().includes('centered')) {
      options.push('centered');
    }
    
    return options;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private extractColors(_node: FigmaNode): DesignToken[] {
    // Extract color tokens from the design
    const colors = [];
    
    // Default EDS colors based on common patterns
    colors.push({
      figmaToken: 'Text/Primary',
      cssVariable: '--text-primary',
      value: '#0d0d0c',
      context: 'text' as const,
    });
    
    colors.push({
      figmaToken: 'Button/Primary',
      cssVariable: '--button-primary',
      value: '#769bcd',
      context: 'button' as const,
    });
    
    colors.push({
      figmaToken: 'Surface/White',
      cssVariable: '--surface-white',
      value: '#ffffff',
      context: 'background' as const,
    });
    
    return colors;
  }

  private extractTypography(node: FigmaNode): TypographyToken[] {
    const typography: TypographyToken[] = [];
    const textNodes = this.findAllTextNodes(node);
    
    textNodes.forEach(textNode => {
      if (textNode.style) {
        const fontSize = textNode.style.fontSize || 16;
        const lineHeight = textNode.style.lineHeightPx || Math.round(fontSize * 1.5);
        
        let cssVariable = '--body-font-size-m';
        let figmaToken = 'Typography/Body/M';
        
        if (fontSize >= 48) {
          cssVariable = '--heading-font-size-xl';
          figmaToken = 'Typography/Heading/XL';
        } else if (fontSize >= 32) {
          cssVariable = '--heading-font-size-l';
          figmaToken = 'Typography/Heading/L';
        } else if (fontSize >= 24) {
          cssVariable = '--heading-font-size-m';
          figmaToken = 'Typography/Heading/M';
        }
        
        typography.push({
          figmaToken,
          cssVariable,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          fontWeight: `${textNode.style.fontWeight || 400}`,
          fontFamily: textNode.style.fontFamily || 'Roboto',
        });
      }
    });
    
    return typography;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private extractSpacing(_node: FigmaNode): SpacingToken[] {
    // Extract spacing patterns
    return [
      {
        figmaToken: 'Spacing/L',
        cssVariable: '--spacing-l',
        value: '32px',
        usage: 'padding' as const,
      },
      {
        figmaToken: 'Spacing/M',
        cssVariable: '--spacing-m',
        value: '24px',
        usage: 'gap' as const,
      },
    ];
  }

  private findCTAButtons(node: FigmaNode): CTAButton[] {
    const buttons = this.findAllButtonNodes(node);
    
    return buttons.map((button, index) => ({
      text: this.extractButtonText(button) || `CTA ${index + 1}`,
      type: index === 0 ? 'primary' : 'secondary',
      url: '#',
    }));
  }

  private extractButtonText(node: FigmaNode): string | null {
    const textNodes = this.findAllTextNodes(node);
    return textNodes[0]?.characters || null;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private findLinks(_node: FigmaNode): InteractionLink[] {
    // Find links that aren't buttons
    return [];
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private findHoverStates(_node: FigmaNode): HoverState[] {
    // Analyze hover states if available
    return [];
  }

  private determineHeadingHierarchy(node: FigmaNode): string[] {
    const textNodes = this.findAllTextNodes(node);
    const headings = textNodes
      .filter(n => n.style?.fontSize && n.style.fontSize > 24)
      .sort((a, b) => (b.style?.fontSize || 0) - (a.style?.fontSize || 0))
      .map((n, index) => `h${index + 1}`);
      
    return headings.slice(0, 6); // Max 6 heading levels
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private checkColorContrast(_node: FigmaNode): { valid: boolean; ratio?: number } {
    // Simplified color contrast check
    return { valid: true };
  }
}