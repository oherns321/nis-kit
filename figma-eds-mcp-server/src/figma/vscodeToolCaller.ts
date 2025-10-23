import { FigmaClientInterface } from '../interfaces.js';

/**
 * VS Code Tool Caller - calls other MCP tools when running in VS Code context
 */
export class VSCodeToolCaller implements FigmaClientInterface {
  private toolCaller?: (toolName: string, params: any) => Promise<any>;

  constructor(toolCaller?: (toolName: string, params: any) => Promise<any>) {
    this.toolCaller = toolCaller;
  }

  async getNode(fileKey: string, nodeId: string, _accessToken?: string): Promise<any> {
    if (!this.toolCaller) {
      throw new Error('Tool caller not available');
    }

    try {
      const metadata = await this.toolCaller('mcp_my-mcp-server_get_metadata', {
        nodeId,
        clientFrameworks: 'javascript',
        clientLanguages: 'javascript,html,css'
      });
      
      // Transform metadata response to expected format
      return { node: metadata };
    } catch (error) {
      throw new Error(`Failed to get node metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFile(fileKey: string, _accessToken?: string): Promise<any> {
    if (!this.toolCaller) {
      throw new Error('Tool caller not available');
    }

    // For now, return minimal file data - could be enhanced
    return { 
      name: `File ${fileKey}`,
      lastModified: new Date().toISOString()
    };
  }

  async getDesignData(figmaUrl: string): Promise<any> {
    const nodeId = this.extractNodeId(figmaUrl);
    const fileKey = this.extractFileKey(figmaUrl);
    return await this.getNode(fileKey, nodeId);
  }

  async getScreenshot(figmaUrl: string): Promise<string> {
    if (!this.toolCaller) {
      throw new Error('Tool caller not available');
    }

    const nodeId = this.extractNodeId(figmaUrl);
    
    try {
      const screenshot = await this.toolCaller('mcp_my-mcp-server_get_screenshot', {
        nodeId,
        clientFrameworks: 'javascript', 
        clientLanguages: 'javascript,html,css'
      });

      return screenshot;
    } catch (error) {
      throw new Error(`Failed to get screenshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getGeneratedCode(figmaUrl: string): Promise<any> {
    if (!this.toolCaller) {
      throw new Error('Tool caller not available');
    }

    const nodeId = this.extractNodeId(figmaUrl);
    
    try {
      console.log(`[VSCodeToolCaller] Getting generated code for nodeId: ${nodeId}`);
      
      const generatedCode = await this.toolCaller('mcp_my-mcp-server_get_code', {
        nodeId,
        forceCode: true,
        clientFrameworks: 'javascript',
        clientLanguages: 'javascript,html,css'
      });

      console.log(`[VSCodeToolCaller] Generated code result type:`, typeof generatedCode);
      console.log(`[VSCodeToolCaller] Generated code length:`, typeof generatedCode === 'string' ? generatedCode.length : 'N/A');

      // Return in expected format
      if (typeof generatedCode === 'string' && generatedCode.trim().length > 0) {
        return {
          code: generatedCode,
          javascript: generatedCode,
          react: generatedCode,
          jsx: generatedCode,
          component: generatedCode,
          generatedCode: generatedCode
        };
      }

      return generatedCode;
    } catch (error) {
      console.warn(`[VSCodeToolCaller] Failed to get generated code: ${error instanceof Error ? error.message : String(error)}`);
      return { code: '', javascript: '', react: '', jsx: '', component: '', generatedCode: '' };
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

  private extractFileKey(figmaUrl: string): string {
    // Extract file key from Figma URL
    const fileMatch = figmaUrl.match(/\/design\/([^/?]+)/);
    if (fileMatch) {
      return fileMatch[1];
    }
    
    throw new Error('Could not extract file key from Figma URL');
  }

  async testConnection(): Promise<boolean> {
    return this.toolCaller !== undefined;
  }
}