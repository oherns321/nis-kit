import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { FigmaDesignData, FigmaCodeData, FigmaClientInterface, FigmaFileResponse } from '../interfaces.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StdioMcpClient implements FigmaClientInterface {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private initialized = false;

  constructor() {
    // We'll initialize lazily when first needed
  }

  /**
   * Initialize the MCP client with stdio transport to connect to the existing server
   */
  private async initializeClient(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('[StdioMcpClient] Initializing stdio connection to my-mcp-server...');
      
      // Create a bridge server script path
      const bridgeServerPath = path.join(__dirname, '../utils/bridge-server.js');
      
      console.log(`[StdioMcpClient] Bridge server path: ${bridgeServerPath}`);
      
      // Create transport to launch the standalone bridge server
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [bridgeServerPath]
      });

      // Create client
      this.client = new Client({
        name: 'figma-eds-client',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });

      // Connect client to transport
      await this.client.connect(this.transport);
      this.initialized = true;
      console.log('[StdioMcpClient] Successfully connected to bridge server via stdio');
    } catch (error) {
      console.error('[StdioMcpClient] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Call a tool on the connected MCP server
   */
  private async callTool(toolName: string, params: any): Promise<any> {
    await this.initializeClient();
    
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    try {
      console.log(`[StdioMcpClient] Calling tool ${toolName} with params:`, JSON.stringify(params, null, 2));
      
      const result = await this.client.callTool({
        name: toolName,
        arguments: params
      });

      console.log(`[StdioMcpClient] Tool ${toolName} returned result type:`, typeof result);
      console.log(`[StdioMcpClient] Result structure:`, Object.keys(result || {}));
      
      // Handle MCP response format
      if (result && result.content && Array.isArray(result.content)) {
        // Extract text content from MCP format
        const textContent = result.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\\n');
        
        if (textContent) {
          console.log(`[StdioMcpClient] Extracted text content length:`, textContent.length);
          return textContent;
        }
      }
      
      return result;
    } catch (error) {
      console.error(`[StdioMcpClient] Tool call ${toolName} failed:`, error);
      throw error;
    }
  }

  // Implement FigmaClientInterface methods

  async getNode(fileKey: string, nodeId: string, _accessToken?: string): Promise<unknown> {
    const figmaUrl = `https://www.figma.com/file/${fileKey}?node-id=${nodeId}`;
    return await this.getDesignData(figmaUrl);
  }

  async getFile(fileKey: string, _accessToken?: string): Promise<FigmaFileResponse> {
    const figmaUrl = `https://www.figma.com/file/${fileKey}`;
    const designData = await this.getDesignData(figmaUrl);
    return designData as unknown as FigmaFileResponse;
  }

  async getDesignData(figmaUrl: string): Promise<FigmaDesignData> {
    const nodeId = this.extractNodeId(figmaUrl);
    
    const result = await this.callTool('mcp_my-mcp-server_get_metadata', {
      nodeId,
      clientFrameworks: 'javascript',
      clientLanguages: 'javascript,html,css'
    });

    return result;
  }

  async getScreenshot(figmaUrl: string): Promise<string> {
    const nodeId = this.extractNodeId(figmaUrl);
    
    const result = await this.callTool('mcp_my-mcp-server_get_screenshot', {
      nodeId,
      clientFrameworks: 'javascript',
      clientLanguages: 'javascript,html,css'
    });

    return result.imageUrl || result.screenshot || result;
  }

  async getGeneratedCode(figmaUrl: string): Promise<FigmaCodeData> {
    const nodeId = this.extractNodeId(figmaUrl);
    
    console.log(`[StdioMcpClient] Getting generated code for nodeId: ${nodeId}`);
    
    const result = await this.callTool('mcp_my-mcp-server_get_code', {
      nodeId,
      forceCode: true,
      clientFrameworks: 'javascript',
      clientLanguages: 'javascript,html,css'
    });

    console.log(`[StdioMcpClient] Generated code result type:`, typeof result);
    console.log(`[StdioMcpClient] Generated code length:`, typeof result === 'string' ? result.length : 'N/A');
    
    // If result is a string (the actual generated code), wrap it in the expected format
    if (typeof result === 'string' && result.trim().length > 0) {
      console.log(`[StdioMcpClient] Successfully got generated code, length: ${result.length}`);
      return { 
        code: result,
        html: '',
        css: '',
        javascript: result,
        react: result,
        jsx: result,
        component: result,
        generatedCode: result
      };
    }
    
    // Handle object responses
    if (result && typeof result === 'object') {
      return {
        code: result.code || result.javascript || result.jsx || result.react || '',
        html: result.html || '',
        css: result.css || '',
        javascript: result.javascript || result.code || result.jsx || result.react || '',
        react: result.react || result.jsx || result.code || '',
        jsx: result.jsx || result.react || result.code || '',
        component: result.component || result.code || '',
        generatedCode: result.generatedCode || result.code || ''
      };
    }
    
    console.warn(`[StdioMcpClient] No generated code found in result`);
    return { code: '', html: '', css: '', javascript: '', react: '', jsx: '', component: '', generatedCode: '' };
  }

  private extractNodeId(figmaUrl: string): string {
    // Extract node ID from various Figma URL formats
    const nodeMatch = figmaUrl.match(/node-id=([^&]+)/);
    if (nodeMatch) {
      return nodeMatch[1].replace(/-/g, ':');
    }
    
    // Direct node ID format
    if (figmaUrl.match(/^\d+[-:]\d+$/)) {
      return figmaUrl.replace(/-/g, ':');
    }
    
    throw new Error('Could not extract node ID from Figma URL');
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initializeClient();
      return this.client !== null;
    } catch (error) {
      console.error('[StdioMcpClient] Test connection failed:', error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async disconnect(): Promise<void> {
    if (this.client && this.transport) {
      try {
        await this.client.close();
        this.client = null;
        this.transport = null;
        this.initialized = false;
        console.log('[StdioMcpClient] Disconnected from MCP server');
      } catch (error) {
        console.error('[StdioMcpClient] Error during disconnect:', error);
      }
    }
  }
}