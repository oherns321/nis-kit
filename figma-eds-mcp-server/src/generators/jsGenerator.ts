import { BlockAnalysis } from '../types.js';
import { BlockField } from '../interfaces.js';

export class JSGenerator {

  /**
   * Generate JavaScript for a block based on analysis
   */
  async generate(analysis: BlockAnalysis): Promise<string> {
    const js = this.createJavaScript(analysis);
    return js;
  }

  private createJavaScript(analysis: BlockAnalysis): string {
    const sections = [];

    // Imports
    sections.push(this.generateImports());

    // Helper functions
    sections.push(this.generateHelperFunctions(analysis));

    // Main decorate function
    sections.push(this.generateDecorateFunction(analysis));

    return sections.join('\n\n');
  }

  private generateImports(): string {
    return `import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';`;
  }

  private generateHelperFunctions(analysis: BlockAnalysis): string {
    const functions = [];

    // Configuration value helper
    functions.push(`/**
 * Helper function to identify configuration values
 */
function isConfigurationValue(text) {
  const configValues = ${JSON.stringify(analysis.contentStructure.configurationOptions)};
  return configValues.includes(text.toLowerCase());
}`);

    if (analysis.blockType === 'multi-item') {
      // First content row helper
      functions.push(`/**
 * Helper function to identify if this is the first content row
 */
function isFirstContentRow(currentIndex, allRows) {
  for (let i = 0; i < allRows.length; i += 1) {
    const row = allRows[i];
    const cells = [...row.children];
    if (cells.length > 0) {
      const cellText = cells[0].textContent.trim();
      if (cellText && !isConfigurationValue(cellText)) {
        return i === currentIndex;
      }
    }
  }
  return false;
}`);

      // Item row detection helper
      functions.push(`/**
 * Helper function to identify item rows
 */
function isItemRow(cell) {
  // Check for Universal Editor component markers
  if (cell.querySelector('[data-aue-filter="${analysis.blockName}-item"]')
      || (cell.hasAttribute('data-aue-filter') 
          && cell.getAttribute('data-aue-filter') === '${analysis.blockName}-item')) {
    return true;
  }

  if (cell.querySelector('[data-aue-type="component"]')
      || cell.hasAttribute('data-aue-type')) {
    const parent = cell.parentElement;
    const isInContainer = parent && parent.classList.contains('${analysis.blockName}');
    const hasMultipleSiblings = parent && parent.children.length > 2;
    return isInContainer && hasMultipleSiblings;
  }

  // Item rows might have multiple cells or specific structure
  const parent = cell.parentElement;
  const cellsInRow = parent ? parent.children.length : 1;

  return cellsInRow > 1
         || cell.querySelector('a')
         || (cell.textContent.trim()
             && cell.previousElementSibling
             && cell.previousElementSibling.textContent.trim());
}`);

      // Data extraction helper
      functions.push(this.generateDataExtractionFunction(analysis));

      // Element creation helper
      functions.push(this.generateElementCreationFunction(analysis));
    }

    return functions.join('\n\n');
  }

  private generateDataExtractionFunction(analysis: BlockAnalysis): string {
    const itemFields = analysis.contentStructure.itemFields || [];
    
    // Generate field extraction logic based on model field order
    let extractionLogic = '';
    let dataStructure = '{\n';
    
    // Build data structure based on actual model fields
    itemFields.forEach(field => {
      const defaultValue = field.component === 'reference' ? 'null' : "''";
      dataStructure += `    ${field.name}: ${defaultValue},\n`;
      
      // Add alt text for image fields
      if (field.component === 'reference' && field.name === 'image') {
        dataStructure += `    imageAlt: '',\n`;
      }
    });
    dataStructure += '    originalRow: row,\n  }';

    // Generate extraction logic that follows model field order
    extractionLogic = this.generateModelBasedExtraction(itemFields);

    return `/**
 * Extract item data from a row
 */
function extractItemData(row) {
  const cells = [...row.children];
  const itemData = ${dataStructure};

${extractionLogic}

  return itemData;
}`;
  }

  private generateModelBasedExtraction(itemFields: BlockField[]): string {
    // Create mapping based on expected DOM structure matching model order
    let cellMapping = '';
    let cellIndex = 0;
    
    // Generate cell-by-cell extraction based on model field order
    itemFields.forEach((field) => {
      if (field.component === 'reference') {
        // Image field - detect by DOM structure (picture/img elements)
        cellMapping += `    if (cellIndex === ${cellIndex} && (picture || img)) {
      // Cell ${cellIndex}: ${field.label}
      if (img) {
        itemData.${field.name} = img.src;
        itemData.imageAlt = img.alt || '';
      } else if (picture && picture.querySelector('img')) {
        const pictureImg = picture.querySelector('img');
        itemData.${field.name} = pictureImg.src;
        itemData.imageAlt = pictureImg.alt || '';
      }
    }`;
        cellIndex++;
      } else if ((field.component === 'text' || field.component === 'richtext') 
                 && !this.isCtaField(field, itemFields)) {
        // Regular text field - detect by DOM structure (text content without links)
        cellMapping += ` else if (cellIndex === ${cellIndex} && textContent && !link) {
      // Cell ${cellIndex}: ${field.label}
      itemData.${field.name} = cell.innerHTML.trim();
    }`;
        cellIndex++;
      } else if (this.isCtaUrlField(field, itemFields)) {
        // CTA field - detect by DOM structure (contains <a> link)
        const ctaTextField = this.findCtaTextField(field, itemFields);
        cellMapping += ` else if (cellIndex === ${cellIndex} && link) {
      // Cell ${cellIndex}: CTA Link (${field.label})
      itemData.${field.name} = link.getAttribute('href') || '#';`;
        
        if (ctaTextField) {
          cellMapping += `
      itemData.${ctaTextField.name} = link.textContent.trim();`;
        }
        
        cellMapping += `
    }`;
        cellIndex++;
      }
    });

    return `  // Extract content based on DOM structure, not field names
  // Expected DOM structure matches model: ${itemFields.map(f => f.label).join(' → ')}
  
  cells.forEach((cell, cellIndex) => {
    const picture = cell.querySelector('picture');
    const img = cell.querySelector('img');
    const link = cell.querySelector('a');
    const textContent = cell.textContent.trim();

${cellMapping}
  });`;
  }

  private isCtaField(field: BlockField, itemFields: BlockField[]): boolean {
    // Check if this field is part of a CTA pair by looking for corresponding URL/Text fields
    return this.isCtaUrlField(field, itemFields) || this.isCtaTextField(field, itemFields);
  }

  private isCtaUrlField(field: BlockField, itemFields: BlockField[]): boolean {
    // A CTA URL field typically has a corresponding text field
    const possibleTextFieldNames = [
      field.name + 'Text',
      field.name + 'Label',
      field.name.replace('Url', 'Text'),
      field.name.replace('Link', 'Text')
    ];
    
    return itemFields.some(f => possibleTextFieldNames.includes(f.name));
  }

  private isCtaTextField(field: BlockField, itemFields: BlockField[]): boolean {
    // A CTA text field typically has a corresponding URL field
    const possibleUrlFieldNames = [
      field.name.replace('Text', ''),
      field.name.replace('Label', ''),
      field.name.replace('Text', 'Url'),
      field.name.replace('Text', 'Link')
    ];
    
    return itemFields.some(f => possibleUrlFieldNames.includes(f.name));
  }

  private findCtaTextField(ctaUrlField: BlockField, itemFields: BlockField[]): BlockField | null {
    const possibleTextFieldNames = [
      ctaUrlField.name + 'Text',
      ctaUrlField.name + 'Label',
      ctaUrlField.name.replace('Url', 'Text'),
      ctaUrlField.name.replace('Link', 'Text')
    ];
    
    return itemFields.find(f => possibleTextFieldNames.includes(f.name)) || null;
  }

  private generateCTAExtractionLogic(itemFields: BlockField[]): string {
    const ctaFields = itemFields.filter(f => f.name.includes('Cta'));
    if (ctaFields.length === 0) return '';

    const logic = [];
    let primaryCta = null;
    let primaryCtaText = null;
    let secondaryCta = null;
    let secondaryCtaText = null;

    // Find primary and secondary CTA fields
    ctaFields.forEach(field => {
      if (field.name.includes('primary') && field.name.endsWith('Cta')) {
        primaryCta = field.name;
      } else if (field.name.includes('primary') && field.name.endsWith('CtaText')) {
        primaryCtaText = field.name;
      } else if (field.name.includes('secondary') && field.name.endsWith('Cta')) {
        secondaryCta = field.name;
      } else if (field.name.includes('secondary') && field.name.endsWith('CtaText')) {
        secondaryCtaText = field.name;
      }
    });

    if (primaryCta && primaryCtaText) {
      logic.push(`if (!itemData.${primaryCta}) {
        itemData.${primaryCta} = linkUrl;
        itemData.${primaryCtaText} = linkText;`);
      
      if (secondaryCta && secondaryCtaText) {
        logic.push(`      } else if (!itemData.${secondaryCta}) {
        itemData.${secondaryCta} = linkUrl;
        itemData.${secondaryCtaText} = linkText;
      }`);
      } else {
        logic.push('      }');
      }
    }

    return logic.join('\n');
  }

  private generateElementCreationFunction(analysis: BlockAnalysis): string {
    const itemFields = analysis.contentStructure.itemFields || [];
    
    let elementCreation = '';
    
    // Generate element creation for each field
    itemFields.forEach(field => {
      if (field.name.includes('Heading')) {
        elementCreation += `  // Create heading
  const headingElement = document.createElement('h3');
  headingElement.className = 'item-heading';
  if (safeItemData.${field.name}) {
    headingElement.innerHTML = safeItemData.${field.name};
  } else {
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add ${field.label.toLowerCase()}...');
  }

`;
      } else if (field.name.includes('Body')) {
        elementCreation += `  // Create body text
  const bodyElement = document.createElement('div');
  bodyElement.className = 'item-body';
  if (safeItemData.${field.name}) {
    bodyElement.innerHTML = safeItemData.${field.name};
  } else {
    bodyElement.innerHTML = '';
    bodyElement.setAttribute('data-placeholder', 'Add ${field.label.toLowerCase()}...');
  }

`;
      }
    });

    // Generate CTA buttons if present
    const ctaFields = itemFields.filter(f => this.isCtaUrlField(f, itemFields));
    if (ctaFields.length > 0) {
      elementCreation += `  // Create CTA buttons container
  const ctasContainer = document.createElement('div');
  ctasContainer.className = 'ctas';

`;

      // Generate buttons based on CTA fields (detected by structure, not naming)
      ctaFields.forEach((field, index) => {
        const textField = this.findCtaTextField(field, itemFields);
        const buttonType = field.name.toLowerCase().includes('primary') ? 'primary' : 
                          field.name.toLowerCase().includes('secondary') ? 'secondary' : 'primary';
        const label = field.label || `CTA ${index + 1}`;
        
        elementCreation += `  // ${label}
  if (safeItemData.${field.name}${textField ? ` && safeItemData.${textField.name}` : ''}) {
    const ctaButton${index} = document.createElement('a');
    ctaButton${index}.className = 'button button-${buttonType}';
    ctaButton${index}.href = safeItemData.${field.name};
    ctaButton${index}.textContent = ${textField ? `safeItemData.${textField.name}` : `'${label}'`};
    ctasContainer.appendChild(ctaButton${index});
  } else {
    // Empty placeholder for ${label}
    const placeholder${index} = document.createElement('a');
    placeholder${index}.className = 'button button-${buttonType} empty-cta';
    placeholder${index}.textContent = 'Add ${label}';
    placeholder${index}.href = '#';
    placeholder${index}.setAttribute('data-placeholder', 'true');
    ctasContainer.appendChild(placeholder${index});
  }

`;
      });
    }

    // Assembly logic - follow model field order for DOM structure
    let assembly = '  // Assemble item following model field order\n';
    
    // Generate assembly based on actual field order from model
    itemFields.forEach(field => {
      if (field.component === 'reference') {
        assembly += `  // ${field.label} (image) container\n`;
        assembly += '  if (safeItemData.image) {\n';
        assembly += '    const imageContainer = document.createElement("div");\n';
        assembly += '    imageContainer.className = "item-image";\n';
        assembly += '    \n';
        assembly += '    // Create optimized picture\n';
        assembly += '    const optimizedPic = createOptimizedPicture(\n';
        assembly += '      safeItemData.image,\n';
        assembly += '      safeItemData.imageAlt || "",\n';
        assembly += '      false,\n';
        assembly += '      [{ width: "750" }]\n';
        assembly += '    );\n';
        assembly += '    \n';
        assembly += '    if (originalRow) {\n';
        assembly += '      moveInstrumentation(originalRow, optimizedPic.querySelector("img"));\n';
        assembly += '    }\n';
        assembly += '    \n';
        assembly += '    imageContainer.appendChild(optimizedPic);\n';
        assembly += '    itemContainer.appendChild(imageContainer);\n';
        assembly += '  } else {\n';
        assembly += '    // Empty placeholder for image\n';
        assembly += '    const imageContainer = document.createElement("div");\n';
        assembly += '    imageContainer.className = "item-image empty-image";\n';
        assembly += '    imageContainer.setAttribute("data-placeholder", "Add image...");\n';
        assembly += '    itemContainer.appendChild(imageContainer);\n';
        assembly += '  }\n';
      } else if (field.name.includes('Heading') || field.name.includes('heading')) {
        assembly += '  itemContainer.appendChild(headingElement);\n';
      } else if (field.name.includes('Description') || field.name.includes('Body') || field.name.includes('body')) {
        assembly += '  itemContainer.appendChild(bodyElement);\n';
      } else if (field.name.includes('cta') && field.name.includes('Text')) {
        // CTA button added after text fields
        if (ctaFields.length > 0) {
          assembly += '  itemContainer.appendChild(ctasContainer);\n';
        }
      }
    });
    
    assembly += '\n  return itemContainer;';

    return `/**
 * Create an item element from item data
 */
function createItemElement(itemData, originalRow = null) {
  const itemContainer = document.createElement('div');
  itemContainer.className = 'item';

  // Move Universal Editor instrumentation
  if (originalRow) {
    moveInstrumentation(originalRow, itemContainer);
  }

  // Ensure itemData is valid
  const safeItemData = itemData || {
${itemFields.map(f => 
    `    ${f.name}: ${f.name.includes('Cta') && !f.name.includes('Text') ? 'null' : "''"},`
  ).join('\n')}
  };

${elementCreation}${assembly}
}`;
  }

  private generateDecorateFunction(analysis: BlockAnalysis): string {
    if (analysis.blockType === 'multi-item') {
      return this.generateMultiItemDecorateFunction(analysis);
    } else {
      return this.generateSingleItemDecorateFunction(analysis);
    }
  }

  private generateMultiItemDecorateFunction(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const hasContainerFields = analysis.contentStructure.containerFields.length > 0;

    return `/**
 * Decorates the ${blockName} block
 * @param {Element} block The ${blockName} block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const content = document.createElement('div');
  content.className = 'items-container';

  ${hasContainerFields ? 'let containerHeading = null;' : ''}
  const items = [];
  const configurationValues = [];

  // Process rows to categorize content
  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const cell = cells[0];
    const textContent = cell.textContent.trim();

    // Check if this is a configuration value
    if (isConfigurationValue(textContent)) {
      configurationValues.push({ value: textContent.toLowerCase(), row });
      return;
    }

    // Check for Universal Editor item markers
    if (isItemRow(cell)) {
      items.push(extractItemData(row));
      return;
    }

    ${hasContainerFields ? `// First content row is likely the container heading
    if (!containerHeading && isFirstContentRow(index, rows)) {
      containerHeading = {
        content: cell.innerHTML.trim(),
        row,
      };
      return;
    }` : ''}

    // Fallback: treat as item if it has meaningful content
    if (textContent) {
      items.push(extractItemData(row));
    }
  });

  ${hasContainerFields ? `// Create container heading if it exists
  if (containerHeading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'container-heading';
    headingElement.innerHTML = containerHeading.content;
    block.insertBefore(headingElement, block.firstChild);
    containerHeading.row.remove();
  }` : ''}

  // Create items
  items.forEach((itemData) => {
    if (itemData) {
      const itemElement = createItemElement(itemData, itemData.originalRow);
      content.appendChild(itemElement);
    }
  });

  // Apply configuration values
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Clear original content and add new structure
  block.innerHTML = '';
  ${hasContainerFields ? `if (containerHeading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'container-heading';
    headingElement.innerHTML = containerHeading.content;
    block.appendChild(headingElement);
  }` : ''}
  block.appendChild(content);
}`;
  }

  private generateSingleItemDecorateFunction(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;

    return `/**
 * Decorates the ${blockName} block
 * @param {Element} block The ${blockName} block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const content = document.createElement('div');
  content.className = 'content';

  const configurationValues = [];

  // Process rows
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const cell = cells[0];
    const textContent = cell.textContent.trim();

    // Check if this is a configuration value
    if (isConfigurationValue(textContent)) {
      configurationValues.push({ value: textContent.toLowerCase(), row });
      return;
    }

    // Process content based on type
    const img = cell.querySelector('img');
    const link = cell.querySelector('a');

    if (img) {
      // Handle images
      content.appendChild(img.cloneNode(true));
    } else if (link) {
      // Handle buttons/links
      const button = document.createElement('a');
      button.className = 'button button-primary';
      button.href = link.href;
      button.textContent = link.textContent;
      content.appendChild(button);
    } else if (textContent) {
      // Handle text content
      const textElement = document.createElement('div');
      textElement.className = 'text-content';
      textElement.innerHTML = cell.innerHTML;
      content.appendChild(textElement);
    }
  });

  // Apply configuration values
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Clear original content and add new structure
  block.innerHTML = '';
  block.appendChild(content);
}`;
  }
}