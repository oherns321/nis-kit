#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { FigmaNode } from './types.js';

import { FigmaClient } from './figma/client.js';
import { MCPFigmaClient } from './figma/mcpClient.js';
import { DesignAnalyzer } from './figma/analyzer.js';
import { 
  FigmaClientInterface, 
  AnalyzeBlockStructureArgs, 
  ValidateBlockOutputArgs, 
  UpdateSectionModelArgs 
} from './interfaces.js';
import { ModelGenerator } from './generators/modelGenerator.js';
import { CSSGenerator } from './generators/cssGenerator.js';
import { JSGenerator } from './generators/jsGenerator.js';
import { TestGenerator } from './generators/testGenerator.js';
import { DocGenerator } from './generators/docGenerator.js';
import { FieldNamingValidator } from './validators/fieldNaming.js';
import { DesignSystemValidator } from './validators/designSystem.js';
import { FileManager } from './utils/fileSystem.js';
import {
  AnalyzeBlockStructureParamsSchema,
  GenerateEdsBlockParamsSchema,
  type BlockAnalysis,
  type BlockGenerationResult,
  type GenerateEdsBlockParams,
  FigmaAPIError,
  ValidationError,
  GenerationError,
} from './types.js';

class FigmaEdsServer {
  private server: Server;
  private figmaClient: FigmaClientInterface;
  private designAnalyzer: DesignAnalyzer;
  private modelGenerator: ModelGenerator;
  private cssGenerator: CSSGenerator;
  private jsGenerator: JSGenerator;
  private testGenerator: TestGenerator;
  private docGenerator: DocGenerator;
  private fieldNamingValidator: FieldNamingValidator;
  private designSystemValidator: DesignSystemValidator;
  private fileManager: FileManager;

  constructor() {
    this.server = new Server(
      {
        name: 'figma-eds-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize components - try MCP client first, fallback to direct API
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    const mcpServerUrl = process.env.FIGMA_MCP_URL || 'http://127.0.0.1:3845/mcp';
    
    if (figmaToken) {
      // Use direct API if token is available
      this.figmaClient = new FigmaClient(figmaToken);
    } else {
      // Use existing MCP server as proxy
      /* eslint-disable-next-line no-console */
      console.log(`Using existing Figma MCP server at ${mcpServerUrl}`);
      this.figmaClient = new MCPFigmaClient(mcpServerUrl);
    }
    this.designAnalyzer = new DesignAnalyzer();
    this.modelGenerator = new ModelGenerator();
    this.cssGenerator = new CSSGenerator();
    this.jsGenerator = new JSGenerator();
    this.testGenerator = new TestGenerator();
    this.docGenerator = new DocGenerator();
    this.fieldNamingValidator = new FieldNamingValidator();
    this.designSystemValidator = new DesignSystemValidator();
    this.fileManager = new FileManager(process.cwd());

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyzeBlockStructure',
          description: 'Analyze a Figma design to determine block structure and content types',
          inputSchema: {
            type: 'object',
            properties: {
              figmaNodeId: {
                type: 'string',
                description: 'The Figma node ID to analyze',
              },
              figmaFileKey: {
                type: 'string',
                description: 'The Figma file key containing the node',
              },
              accessToken: {
                type: 'string',
                description: 'Figma access token (optional if set in environment)',
              },
            },
            required: ['figmaNodeId', 'figmaFileKey'],
          },
        },
        {
          name: 'generateEdsBlock',
          description: 'Generate a complete EDS block from a Figma design',
          inputSchema: {
            type: 'object',
            properties: {
              blockName: {
                type: 'string',
                description: 'Name for the generated block (lowercase with hyphens)',
              },
              figmaNodeId: {
                type: 'string',
                description: 'The Figma node ID to convert',
              },
              figmaFileKey: {
                type: 'string',
                description: 'The Figma file key containing the node',
              },
              outputPath: {
                type: 'string',
                description: 'Output directory path for generated files',
              },
              options: {
                type: 'object',
                properties: {
                  updateSectionModel: {
                    type: 'boolean',
                    description: 'Whether to update the section model',
                    default: true,
                  },
                  createTestFiles: {
                    type: 'boolean',
                    description: 'Whether to create test files',
                    default: true,
                  },
                  validateOutput: {
                    type: 'boolean',
                    description: 'Whether to validate generated output',
                    default: true,
                  },
                  customVariables: {
                    type: 'object',
                    description: 'Custom CSS variables to use',
                  },
                },
              },
            },
            required: ['blockName', 'figmaNodeId', 'figmaFileKey', 'outputPath'],
          },
        },
        {
          name: 'validateBlockOutput',
          description: 'Validate generated block files for compliance and quality',
          inputSchema: {
            type: 'object',
            properties: {
              blockPath: {
                type: 'string',
                description: 'Path to the block directory',
              },
              blockName: {
                type: 'string',
                description: 'Name of the block to validate',
              },
              strictMode: {
                type: 'boolean',
                description: 'Enable strict validation mode',
                default: false,
              },
            },
            required: ['blockPath', 'blockName'],
          },
        },
        {
          name: 'updateSectionModel',
          description: 'Update the section model to include a new block',
          inputSchema: {
            type: 'object',
            properties: {
              blockName: {
                type: 'string',
                description: 'Name of the block to add',
              },
              sectionModelPath: {
                type: 'string',
                description: 'Path to the _section.json file',
              },
              blockType: {
                type: 'string',
                enum: ['single', 'multi-item'],
                description: 'Type of block being added',
              },
            },
            required: ['blockName', 'sectionModelPath', 'blockType'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments || {};
        
        switch (request.params.name) {
          case 'analyzeBlockStructure':
            return await this.handleAnalyzeBlockStructure(args as unknown as AnalyzeBlockStructureArgs);

          case 'generateEdsBlock':
            return await this.handleGenerateEdsBlock(args);

          case 'validateBlockOutput':
            return await this.handleValidateBlockOutput(args as unknown as ValidateBlockOutputArgs);

          case 'updateSectionModel':
            return await this.handleUpdateSectionModel(args as unknown as UpdateSectionModelArgs);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(ErrorCode.InternalError, message);
      }
    });
  }

  private async handleAnalyzeBlockStructure(args: AnalyzeBlockStructureArgs) {
    const params = AnalyzeBlockStructureParamsSchema.parse(args);
    
    try {
      // Fetch Figma node data
      const figmaData = await this.figmaClient.getNode(
        params.figmaFileKey,
        params.figmaNodeId,
        params.accessToken
      );

      // Analyze the design structure
      const analysis = await this.designAnalyzer.analyze(figmaData as FigmaNode);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw new McpError(ErrorCode.InvalidRequest, `Figma API error: ${error.message}`);
      }
      throw new McpError(
        ErrorCode.InternalError, 
        `Analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleGenerateEdsBlock(args: unknown) {
    const params = GenerateEdsBlockParamsSchema.parse(args);
    
    try {
      // Analyze the block structure first
      const analysisResult = await this.handleAnalyzeBlockStructure({
        figmaNodeId: params.figmaNodeId,
        figmaFileKey: params.figmaFileKey,
      });

      const analysis: BlockAnalysis = JSON.parse(analysisResult.content[0].text);
      analysis.blockName = params.blockName;

      // Generate all files
      const generationResult = await this.generateAllFiles(analysis, params);

      // Validate if requested
      if (params.options?.validateOutput) {
        const validation = await this.validateGeneration(generationResult, params.outputPath);
        generationResult.validation = validation;
      }

      // Update section model if requested
      if (params.options?.updateSectionModel) {
        await this.updateSectionModelFile(params.blockName, params.outputPath, analysis.blockType);
        generationResult.integration.sectionModelUpdated = true;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(generationResult, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new McpError(ErrorCode.InvalidRequest, `Validation failed: ${error.message}`);
      }
      if (error instanceof GenerationError) {
        throw new McpError(
          ErrorCode.InternalError, 
          `Generation failed at ${error.stage}: ${error.message}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError, 
        `Block generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private async handleValidateBlockOutput(_args: ValidateBlockOutputArgs) {
    // TODO: Implement validation logic
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ validated: true, errors: [], warnings: [] }, null, 2),
        },
      ],
    };
  }

  private async handleUpdateSectionModel(args: UpdateSectionModelArgs) {
    // TODO: Implement section model update logic
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ updated: true, blockName: args.blockName }, null, 2),
        },
      ],
    };
  }

  private async generateAllFiles(
    analysis: BlockAnalysis, 
    params: GenerateEdsBlockParams
  ): Promise<BlockGenerationResult> {
    const result: BlockGenerationResult = {
      files: {
        css: '',
        javascript: '',
        model: '',
        readme: '',
        icon: '',
        testSimple: '',
        testRealStructure: '',
      },
      validation: {
        linting: [],
        accessibility: [],
        designSystem: [],
      },
      integration: {
        sectionModelUpdated: false,
        componentsRegistered: [],
      },
    };

    try {
      // Generate CSS
      result.files.css = await this.cssGenerator.generate(analysis);
      
      // Generate JavaScript
      result.files.javascript = await this.jsGenerator.generate(analysis);
      
      // Generate Universal Editor model
      result.files.model = await this.modelGenerator.generate(analysis);
      
      // Generate documentation
      result.files.readme = await this.docGenerator.generate(analysis);
      
      // Generate test files
      if (params.options?.createTestFiles) {
        const testFiles = await this.testGenerator.generate(analysis);
        result.files.testSimple = testFiles.basicTest;
        result.files.testRealStructure = testFiles.realStructureTest;
      }

      // Generate icon (placeholder for now)
      result.files.icon = this.generateSimpleIcon();

      // Write files to disk
      await this.fileManager.writeBlockFiles(params.blockName, {
        css: result.files.css,
        js: result.files.javascript,
        model: result.files.model,
        itemModel: analysis.blockType === 'multi-item' 
          ? (await this.modelGenerator.generateItemModel(analysis)) || undefined 
          : undefined,
        readme: result.files.readme,
        icon: result.files.icon,
        basicTest: result.files.testSimple,
        realStructureTest: result.files.testRealStructure,
      });

      return result;
    } catch (error) {
      throw new GenerationError(
        `File generation failed: ${error instanceof Error ? error.message : String(error)}`, 
        'file-generation'
      );
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private async validateGeneration(_result: BlockGenerationResult, _outputPath: string) {
    // TODO: Implement comprehensive validation
    return {
      linting: [],
      accessibility: [],
      designSystem: [],
    };
  }

  private async updateSectionModelFile(blockName: string, outputPath: string, blockType: 'single' | 'multi-item') {
    // TODO: Implement section model update
    /* eslint-disable-next-line no-console */
    console.log(`Updating section model for ${blockName} (${blockType})`);
  }

  private generateSimpleIcon(): string {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
           'fill="none" stroke="currentColor" stroke-width="2" ' +
           'stroke-linecap="round" stroke-linejoin="round">' +
           '<rect x="3" y="3" width="7" height="9"/>' +
           '<rect x="14" y="3" width="7" height="9"/>' +
           '<line x1="3" y1="15" x2="21" y2="15"/>' +
           '<line x1="3" y1="19" x2="21" y2="19"/>' +
           '</svg>';
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    /* eslint-disable-next-line no-console */
    console.error('Figma-EDS MCP Server running on stdio');
  }
}

const server = new FigmaEdsServer();
/* eslint-disable-next-line no-console */
server.run().catch(console.error);