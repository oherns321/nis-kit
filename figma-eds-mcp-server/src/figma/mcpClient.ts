import { FigmaDesignData, FigmaCodeData, FigmaClientInterface, FigmaFileResponse } from '../interfaces.js';

export class MCPFigmaClient implements FigmaClientInterface {
  private mcpServerUrl: string;

  constructor(mcpServerUrl = 'http://127.0.0.1:3845/mcp') {
    this.mcpServerUrl = mcpServerUrl;
  }

  /**
   * Get Figma node data (implements FigmaClientInterface)
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async getNode(fileKey: string, nodeId: string, _accessToken?: string): Promise<unknown> {
    // For MCP client, we adapt the interface by creating a figma URL
    const figmaUrl = `https://www.figma.com/file/${fileKey}?node-id=${nodeId}`;
    return await this.getDesignData(figmaUrl);
  }

  /**
   * Get Figma file data (implements FigmaClientInterface)
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async getFile(fileKey: string, _accessToken?: string): Promise<FigmaFileResponse> {
    // For MCP client, we adapt the interface by creating a figma URL
    const figmaUrl = `https://www.figma.com/file/${fileKey}`;
    const designData = await this.getDesignData(figmaUrl);
    return designData as unknown as FigmaFileResponse;
  }

  /**
   * Get Figma design data via existing MCP server
   */
  async getDesignData(figmaUrl: string): Promise<FigmaDesignData> {
    try {
      const nodeId = this.extractNodeId(figmaUrl);
      
      // Use existing MCP server to get design data
      const response = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'get_metadata', // or whatever your existing server calls this
            arguments: {
              figmaUrl,
              nodeId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Figma MCP error: ${result.error.message}`);
      }

      return result.result;
    } catch (error) {
      throw new Error(`Failed to get design data: ${error}`);
    }
  }

  /**
   * Get screenshot via existing MCP server
   */
  async getScreenshot(figmaUrl: string): Promise<string> {
    try {
      const response = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'get_screenshot', // or whatever your existing server calls this
            arguments: {
              figmaUrl
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Screenshot error: ${result.error.message}`);
      }

      return result.result.imageUrl || result.result.screenshot;
    } catch (error) {
      throw new Error(`Failed to get screenshot: ${error}`);
    }
  }

  /**
   * Get generated code via existing MCP server
   */
  async getGeneratedCode(figmaUrl: string): Promise<FigmaCodeData> {
    try {
      const response = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'get_code', // or whatever your existing server calls this
            arguments: {
              figmaUrl
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Code generation error: ${result.error.message}`);
      }

      return result.result;
    } catch (error) {
      throw new Error(`Failed to get generated code: ${error}`);
    }
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

  /**
   * Test connection to existing MCP server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 0,
          method: 'tools/list',
          params: {}
        })
      });

      const result = await response.json();
      return !result.error;
    } catch (error) {
      return false;
    }
  }
}