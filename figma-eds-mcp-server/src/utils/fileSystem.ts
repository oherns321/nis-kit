import * as fs from 'fs/promises';
import * as path from 'path';
import { SectionModel, SectionModelField } from '../interfaces.js';

export class FileManager {
  
  private readonly PROJECT_ROOT: string;

  constructor(projectRoot: string) {
    this.PROJECT_ROOT = projectRoot;
  }

  /**
   * Create block directory structure
   */
  async createBlockStructure(blockName: string): Promise<string> {
    const blockPath = path.join(this.PROJECT_ROOT, 'blocks', blockName);
    
    try {
      await fs.mkdir(blockPath, { recursive: true });
      return blockPath;
    } catch (error) {
      throw new Error(`Failed to create block directory: ${error}`);
    }
  }

  /**
   * Write block files
   */
  async writeBlockFiles(blockName: string, files: {
    css: string;
    js: string;
    model: string;
    itemModel?: string;
    readme: string;
    icon: string;
    basicTest: string;
    realStructureTest: string;
  }): Promise<void> {
    const blockPath = path.join(this.PROJECT_ROOT, 'blocks', blockName);
    const testPath = path.join(this.PROJECT_ROOT, 'test');

    // Ensure directories exist
    await fs.mkdir(blockPath, { recursive: true });
    await fs.mkdir(testPath, { recursive: true });

    try {
      // Write block files
      await Promise.all([
        fs.writeFile(path.join(blockPath, `${blockName}.css`), files.css),
        fs.writeFile(path.join(blockPath, `${blockName}.js`), files.js),
        fs.writeFile(path.join(blockPath, `_${blockName}.json`), files.model),
        fs.writeFile(path.join(blockPath, 'README.md'), files.readme),
        fs.writeFile(path.join(blockPath, 'icon.svg'), files.icon),
        
        // Write test files
        fs.writeFile(path.join(testPath, `${blockName}.html`), files.basicTest),
        fs.writeFile(path.join(testPath, `${blockName}-realstructure.html`), files.realStructureTest),
      ]);

      // Write item model if it exists
      if (files.itemModel) {
        await fs.writeFile(path.join(blockPath, `_${blockName}-item.json`), files.itemModel);
      }

    } catch (error) {
      throw new Error(`Failed to write block files: ${error}`);
    }
  }

  /**
   * Update section model to include new block
   */
  async updateSectionModel(blockName: string): Promise<void> {
    const sectionModelPath = path.join(this.PROJECT_ROOT, 'models', '_section.json');
    
    try {
      // Read current section model
      const sectionContent = await fs.readFile(sectionModelPath, 'utf-8');
      const sectionModel: SectionModel = JSON.parse(sectionContent);

      // Find the content field with allowedComponents
      const contentField = sectionModel.fields?.find((f: SectionModelField) => 
        f.name === 'content' && f.component === 'aem-content'
      );

      if (!contentField) {
        throw new Error('Could not find content field in section model');
      }

      // Add block to allowedComponents if not already present
      if (!contentField.constraints) {
        contentField.constraints = { allowedComponents: [] };
      }
      
      if (!contentField.constraints.allowedComponents) {
        contentField.constraints.allowedComponents = [];
      }

      const allowedComponents = contentField.constraints.allowedComponents;
      if (!allowedComponents.includes(blockName)) {
        allowedComponents.push(blockName);
        allowedComponents.sort(); // Keep alphabetical order
      }

      // Write updated section model
      await fs.writeFile(sectionModelPath, JSON.stringify(sectionModel, null, 2));

    } catch (error) {
      throw new Error(`Failed to update section model: ${error}`);
    }
  }

  /**
   * Check if block already exists
   */
  async blockExists(blockName: string): Promise<boolean> {
    const blockPath = path.join(this.PROJECT_ROOT, 'blocks', blockName);
    
    try {
      await fs.access(blockPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get existing blocks list
   */
  async getExistingBlocks(): Promise<string[]> {
    const blocksPath = path.join(this.PROJECT_ROOT, 'blocks');
    
    try {
      const entries = await fs.readdir(blocksPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      throw new Error(`Failed to read blocks directory: ${error}`);
    }
  }

  /**
   * Validate project structure
   */
  async validateProjectStructure(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    const requiredPaths = [
      'blocks',
      'models',
      'models/_section.json',
      'styles',
      'styles/root.css',
      'test'
    ];

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(this.PROJECT_ROOT, requiredPath);
      try {
        await fs.access(fullPath);
      } catch {
        errors.push(`Missing required path: ${requiredPath}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Read existing CSS root variables
   */
  async getCSSVariables(): Promise<string[]> {
    const rootCSSPath = path.join(this.PROJECT_ROOT, 'styles', 'root.css');
    
    try {
      const content = await fs.readFile(rootCSSPath, 'utf-8');
      const variables = content.match(/--[a-zA-Z0-9-]+/g) || [];
      return [...new Set(variables)].sort();
    } catch (error) {
      throw new Error(`Failed to read CSS variables: ${error}`);
    }
  }

  /**
   * Create backup of existing block (if updating)
   */
  async backupBlock(blockName: string): Promise<string> {
    const blockPath = path.join(this.PROJECT_ROOT, 'blocks', blockName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.PROJECT_ROOT, 'blocks', `${blockName}.backup.${timestamp}`);
    
    try {
      await fs.cp(blockPath, backupPath, { recursive: true });
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Generate block icon SVG
   */
  generateBlockIcon(blockName: string): string {
    // Generate a simple SVG icon based on block name
    const firstLetter = blockName.charAt(0).toUpperCase();
    const color = this.getColorFromName(blockName);
    
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" rx="2" fill="${color}" fill-opacity="0.1" 
        stroke="${color}" stroke-width="1.5"/>
  <text x="12" y="16" text-anchor="middle" font-family="system-ui, sans-serif" 
        font-size="12" font-weight="600" fill="${color}">${firstLetter}</text>
</svg>`;
  }

  private getColorFromName(name: string): string {
    // Generate consistent color from block name
    const colors = [
      '#0066CC', '#00AA44', '#CC6600', '#AA0044', 
      '#6600CC', '#00CCAA', '#CC0066', '#4400CC'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}