import { FigmaDesignData, FigmaCodeData, FigmaClientInterface, FigmaFileResponse } from '../interfaces.js';

export class HttpMcpClient implements FigmaClientInterface {
  private mcpServerUrl: string;
  private sessionInitialized = false;

  constructor(mcpServerUrl = 'http://127.0.0.1:3845/mcp') {
    this.mcpServerUrl = mcpServerUrl;
  }

  /**
   * Initialize session with HTTP MCP server
   */
  private async initializeSession(): Promise<void> {
    if (this.sessionInitialized) {
      return;
    }

    try {
      console.log('[HttpMcpClient] Initializing HTTP MCP session...');
      
      // Initialize MCP session
      const initResponse = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: 'figma-eds-client',
              version: '1.0.0'
            }
          }
        })
      });

      if (!initResponse.ok) {
        throw new Error(`HTTP ${initResponse.status}: ${initResponse.statusText}`);
      }

      // Handle SSE response format
      const responseText = await initResponse.text();
      console.log('[HttpMcpClient] Raw response:', responseText);
      
      // Parse SSE format: "event: message\ndata: {json}\n"
      const dataLine = responseText.split('\n').find(line => line.startsWith('data: '));
      if (!dataLine) {
        throw new Error('Invalid SSE response format');
      }
      
      const jsonData = dataLine.substring(6); // Remove "data: " prefix
      const initResult = JSON.parse(jsonData);
      if (initResult.error) {
        throw new Error(`MCP initialization error: ${initResult.error.message}`);
      }

      console.log('[HttpMcpClient] Session initialized successfully');
      this.sessionInitialized = true;
    } catch (error) {
      console.error('[HttpMcpClient] Failed to initialize session:', error);
      throw error;
    }
  }

  /**
   * Call a tool on the HTTP MCP server
   */
  async callTool(toolName: string, params: any): Promise<any> {
    await this.initializeSession();
    
    try {
      console.log(`[HttpMcpClient] Calling tool ${toolName}`);
      
      const response = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: params
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle SSE response format
      const responseText = await response.text();
      console.log(`[HttpMcpClient] Raw response for ${toolName}:`, responseText);
      
      // Parse SSE format: "event: message\ndata: {json}\n"
      const dataLine = responseText.split('\n').find(line => line.startsWith('data: '));
      if (!dataLine) {
        throw new Error('Invalid SSE response format');
      }
      
      const jsonData = dataLine.substring(6); // Remove "data: " prefix
      const result = JSON.parse(jsonData);
      
      if (result.error) {
        throw new Error(`MCP tool error: ${result.error.message}`);
      }

      console.log(`[HttpMcpClient] Tool ${toolName} completed successfully`);
      
      // Handle MCP response format
      if (result.result && result.result.content && Array.isArray(result.result.content)) {
        // Extract text content from MCP format
        const textContent = result.result.content
          .filter((item: any) => item.type === 'text')
          .map((item: any) => item.text)
          .join('\n');
        
        if (textContent) {
          // Try to parse as JSON if it looks like JSON
          try {
            return JSON.parse(textContent);
          } catch {
            return textContent;
          }
        }
      }
      
      return result.result;
    } catch (error) {
      console.error(`[HttpMcpClient] Tool call ${toolName} failed:`, error);
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
    
    const result = await this.callTool('get_metadata', {
      nodeId,
      clientFrameworks: 'react',
      clientLanguages: 'typescript,css'
    });

    return result;
  }

  async getScreenshot(figmaUrl: string): Promise<string> {
    const nodeId = this.extractNodeId(figmaUrl);
    
    const result = await this.callTool('get_screenshot', {
      nodeId,
      clientFrameworks: 'react',
      clientLanguages: 'typescript,css'
    });

    return result.imageUrl || result.screenshot || result;
  }

  async getGeneratedCode(figmaUrl: string): Promise<FigmaCodeData> {
    const nodeId = this.extractNodeId(figmaUrl);
    
    console.log(`[HttpMcpClient] Getting generated code for nodeId: ${nodeId}`);
    
    const result = await this.callTool('get_code', {
      nodeId,
      forceCode: true,
      clientFrameworks: 'react',
      clientLanguages: 'typescript,css'
    });

    console.log(`[HttpMcpClient] Generated code result:`, typeof result);
    
    // Handle different response formats
    if (typeof result === 'string' && result.trim().length > 0) {
      console.log(`[HttpMcpClient] Got string result, length: ${result.length}`);
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
    
    if (result && typeof result === 'object') {
      const code = result.code || result.javascript || result.jsx || result.react || '';
      if (code) {
        console.log(`[HttpMcpClient] Got object result with code, length: ${code.length}`);
        return {
          code,
          html: result.html || '',
          css: result.css || '',
          javascript: result.javascript || code,
          react: result.react || code,
          jsx: result.jsx || code,
          component: result.component || code,
          generatedCode: result.generatedCode || code
        };
      }
    }
    
    console.warn(`[HttpMcpClient] No generated code found in result`);
    return { 
      code: '', 
      html: '', 
      css: '', 
      javascript: '', 
      react: '', 
      jsx: '', 
      component: '', 
      generatedCode: '' 
    };
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
      await this.initializeSession();
      return true;
    } catch (error) {
      console.error('[HttpMcpClient] Test connection failed:', error);
      return false;
    }
  }
}