import { BlockAnalysis } from '../types.js';

export class TestGenerator {

  /**
   * Generate test files for a block based on analysis
   */
  async generate(analysis: BlockAnalysis): Promise<{ 
    basicTest: string; 
    realStructureTest: string; 
  }> {
    const basicTest = this.createBasicTest(analysis);
    const realStructureTest = this.createRealStructureTest(analysis);
    
    return { basicTest, realStructureTest };
  }

  private createBasicTest(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const blockTitle = this.capitalizeWords(blockName.replace(/-/g, ' '));

    return `<!doctype html>
<html lang="en">
<head>
  <title>${blockTitle} Block Test</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="/scripts/aem.js" type="module"></script>
  <script src="/scripts/scripts.js" type="module"></script>
  <link rel="stylesheet" href="/styles/styles.css"/>
</head>
<body>
  <header></header>
  <main>
    <div class="section">
      <div class="section-metadata">
        <div>
          <div>style</div>
          <div></div>
        </div>
      </div>
      <div class="${blockName}">
        ${this.generateBasicTestContent(analysis)}
      </div>
    </div>
  </main>
  <footer></footer>
</body>
</html>`;
  }

  private createRealStructureTest(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const blockTitle = this.capitalizeWords(blockName.replace(/-/g, ' '));

    return `<!doctype html>
<html lang="en">
<head>
  <title>${blockTitle} Block - Universal Editor Structure Test</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="/scripts/aem.js" type="module"></script>
  <script src="/scripts/scripts.js" type="module"></script>
  <link rel="stylesheet" href="/styles/styles.css"/>
</head>
<body>
  <header></header>
  <main>
    <div class="section">
      <div class="section-metadata">
        <div>
          <div>style</div>
          <div></div>
        </div>
      </div>
      <div class="${blockName}">
        ${this.generateRealStructureTestContent(analysis)}
      </div>
    </div>
  </main>
  <footer></footer>
</body>
</html>`;
  }

  private generateBasicTestContent(analysis: BlockAnalysis): string {
    if (analysis.blockType === 'multi-item') {
      return this.generateMultiItemBasicContent(analysis);
    } else {
      return this.generateSingleItemBasicContent(analysis);
    }
  }

  private generateRealStructureTestContent(analysis: BlockAnalysis): string {
    if (analysis.blockType === 'multi-item') {
      return this.generateMultiItemRealContent(analysis);
    } else {
      return this.generateSingleItemRealContent(analysis);
    }
  }

  private generateMultiItemBasicContent(analysis: BlockAnalysis): string {
    const content = [];

    // Add configuration option
    content.push(`        <div>
          <div>dark</div>
        </div>`);

    // Add container heading if applicable
    if (analysis.contentStructure.containerFields.length > 0) {
      content.push(`        <div>
          <div>Test ${this.capitalizeWords(analysis.blockName.replace(/-/g, ' '))} Collection</div>
        </div>`);
    }

    // Add multiple items
    const itemFields = analysis.contentStructure.itemFields || [];
    for (let i = 1; i <= 3; i++) {
      const cells: string[] = [];
      
      itemFields.forEach(field => {
        if (field.name.includes('Heading')) {
          cells.push(`Test Item ${i} Heading`);
        } else if (field.name.includes('Body')) {
          cells.push(
            `This is test body content for item ${i}. It demonstrates how the block handles longer text content.`
          );
        } else if (field.name.includes('Cta') && !field.name.includes('Text')) {
          const isPrimary = field.name.includes('primary');
          cells.push(
            `<a href="#test-${i}-${isPrimary ? 'primary' : 'secondary'}">${
              isPrimary ? 'Primary' : 'Secondary'
            } Action ${i}</a>`
          );
        }
      });

      if (cells.length > 0) {
        const cellDivs = cells.map(cell => `          <div>${cell}</div>`).join('\n');
        content.push(`        <div>
${cellDivs}
        </div>`);
      }
    }

    return content.join('\n');
  }

  private generateSingleItemBasicContent(analysis: BlockAnalysis): string {
    const content = [];

    // Add configuration option
    content.push(`        <div>
          <div>centered</div>
        </div>`);

    // Add content based on container fields
    analysis.contentStructure.containerFields.forEach(field => {
      let cellContent = '';
      
      if (field.name.includes('Heading')) {
        cellContent = 'Sample Heading Content';
      } else if (field.name.includes('Body')) {
        cellContent = 'This is sample body content that demonstrates the block functionality.';
      } else if (field.name.includes('Cta') && !field.name.includes('Text')) {
        cellContent = '<a href="#sample-link">Sample Button</a>';
      } else {
        cellContent = `Sample ${field.label}`;
      }

      content.push(`        <div>
          <div>${cellContent}</div>
        </div>`);
    });

    return content.join('\n');
  }

  private generateMultiItemRealContent(analysis: BlockAnalysis): string {
    const content = [];

    // Configuration with Universal Editor structure
    content.push(`        <div>
          <div>
            <p>dark</p>
          </div>
        </div>`);

    // Container heading with UE structure
    if (analysis.contentStructure.containerFields.length > 0) {
      content.push(`        <div>
          <div>
            <p>Real ${this.capitalizeWords(analysis.blockName.replace(/-/g, ' '))} Collection</p>
          </div>
        </div>`);
    }

    // Multiple items with Universal Editor structure
    const itemFields = analysis.contentStructure.itemFields || [];
    for (let i = 1; i <= 3; i++) {
      const cells: string[] = [];
      
      itemFields.forEach(field => {
        if (field.name.includes('Heading')) {
          cells.push(`            <p>Real Item ${i} Heading</p>`);
        } else if (field.name.includes('Body')) {
          cells.push(
            `            <p>This is real Universal Editor body content for item ${i}. ` +
            `It shows the nested div structure.</p>`
          );
        } else if (field.name.includes('Cta') && !field.name.includes('Text')) {
          const isPrimary = field.name.includes('primary');
          cells.push(
            `            <p><a href="#real-${i}-${isPrimary ? 'primary' : 'secondary'}">${
              isPrimary ? 'Primary' : 'Secondary'
            } Real Action ${i}</a></p>`
          );
        }
      });

      if (cells.length > 0) {
        content.push(`        <div>
          <div>
${cells.join('\n          </div>\n          <div>\n')}
          </div>
        </div>`);
      }
    }

    return content.join('\n');
  }

  private generateSingleItemRealContent(analysis: BlockAnalysis): string {
    const content = [];

    // Configuration with Universal Editor structure
    content.push(`        <div>
          <div>
            <p>centered</p>
          </div>
        </div>`);

    // Content with Universal Editor structure
    analysis.contentStructure.containerFields.forEach(field => {
      let cellContent = '';
      
      if (field.name.includes('Heading')) {
        cellContent = '<p>Real Sample Heading Content</p>';
      } else if (field.name.includes('Body')) {
        cellContent = '<p>This is real Universal Editor body content that demonstrates the nested structure.</p>';
      } else if (field.name.includes('Cta') && !field.name.includes('Text')) {
        cellContent = '<p><a href="#real-sample-link">Real Sample Button</a></p>';
      } else {
        cellContent = `<p>Real Sample ${field.label}</p>`;
      }

      content.push(`        <div>
          <div>
            ${cellContent}
          </div>
        </div>`);
    });

    return content.join('\n');
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}