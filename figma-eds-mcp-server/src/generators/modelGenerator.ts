import { BlockAnalysis } from '../types.js';
import { UniversalEditorModel } from '../interfaces.js';

export class ModelGenerator {

  /**
   * Generate Universal Editor model JSON for a block
   */
  async generate(analysis: BlockAnalysis): Promise<string> {
    const model = this.createModel(analysis);
    return JSON.stringify(model, null, 2);
  }

  private createModel(analysis: BlockAnalysis): UniversalEditorModel {
    if (analysis.blockType === 'multi-item') {
      return this.createMultiItemModel(analysis);
    } else {
      return this.createSingleItemModel(analysis);
    }
  }

  private createMultiItemModel(analysis: BlockAnalysis): UniversalEditorModel {
    const blockId = analysis.blockName;
    const itemId = `${blockId.replace(/-/g, '-')}-item`;
    
    const definitions = [
      // Container definition
      {
        title: this.capitalize(analysis.blockName.replace(/-/g, ' ')),
        id: blockId,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: {
                name: this.capitalize(analysis.blockName.replace(/-/g, ' ')),
                filter: blockId,
                ...(analysis.contentStructure.containerFields.length > 0 && {
                  model: blockId
                })
              }
            }
          }
        }
      }
    ];

    const models = [];
    const filters = [];

    // Add container model if it has fields
    if (analysis.contentStructure.containerFields.length > 0) {
      models.push({
        id: blockId,
        fields: analysis.contentStructure.containerFields
      });
    }

    // Add item definition and model
    if (analysis.contentStructure.itemFields && analysis.contentStructure.itemFields.length > 0) {
      definitions.push({
        title: this.capitalize(analysis.blockName.replace(/-/g, ' ')) + ' Item',
        id: itemId,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block/item',
              template: {
                name: this.capitalize(analysis.blockName.replace(/-/g, ' ')) + ' Item',
                model: itemId,
                filter: itemId
              }
            }
          }
        }
      });

      models.push({
        id: itemId,
        fields: analysis.contentStructure.itemFields
      });

      // Add filter
      filters.push({
        id: blockId,
        components: [itemId]
      });
    }

    const result: UniversalEditorModel = {
      definitions,
      models,
      filters: filters.length > 0 ? filters : []
    };

    return result;
  }

  private createSingleItemModel(analysis: BlockAnalysis): UniversalEditorModel {
    const blockId = analysis.blockName;
    
    return {
      definitions: [
        {
          title: this.capitalize(analysis.blockName.replace(/-/g, ' ')),
          id: blockId,
          plugins: {
            xwalk: {
              page: {
                resourceType: 'core/franklin/components/block/v1/block',
                template: {
                  name: this.capitalize(analysis.blockName.replace(/-/g, ' ')),
                  model: blockId
                }
              }
            }
          }
        }
      ],
      models: [
        {
          id: blockId,
          fields: analysis.contentStructure.containerFields
        }
      ],
      filters: []
    };
  }

  async generateItemModel(analysis: BlockAnalysis): Promise<string | null> {
    if (analysis.blockType !== 'multi-item' || !analysis.contentStructure.itemFields?.length) {
      return null;
    }

    const itemId = `${analysis.blockName.replace(/-/g, '-')}-item`;
    
    const itemModel = {
      definitions: [
        {
          title: this.capitalize(analysis.blockName.replace(/-/g, ' ')) + ' Item',
          id: itemId,
          plugins: {
            xwalk: {
              page: {
                resourceType: 'core/franklin/components/block/v1/block/item',
                template: {
                  name: this.capitalize(analysis.blockName.replace(/-/g, ' ')) + ' Item',
                  model: itemId,
                  filter: itemId
                }
              }
            }
          }
        }
      ],
      models: [
        {
          id: itemId,
          fields: analysis.contentStructure.itemFields
        }
      ],
      filters: []
    };

    return JSON.stringify(itemModel, null, 2);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}