#!/usr/bin/env node

// Bridge server that forwards stdio MCP requests to HTTP MCP server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change to the figma-eds-mcp-server directory to ensure module resolution
const figmaEdsRoot = path.join(__dirname, '../..');
console.error(`[Bridge] Changing to directory: ${figmaEdsRoot}`);
process.chdir(figmaEdsRoot);

class McpHttpBridge {
  constructor() {
    this.server = new Server({
      name: 'figma-http-bridge',
      version: '1.0.0'
    }, {
      capabilities: { 
        tools: {},
        resources: {},
        prompts: {}
      }
    });
    
    this.setupHandlers();
  }
  
  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'mcp_my-mcp-server_get_code',
          description: 'Get generated code from Figma design',
          inputSchema: {
            type: 'object',
            properties: {
              nodeId: { 
                type: 'string',
                description: 'Figma node ID (e.g., "13157:13513")'
              },
              clientLanguages: { 
                type: 'string',
                description: 'Client languages (e.g., "javascript,html,css")'
              },
              clientFrameworks: { 
                type: 'string',
                description: 'Client frameworks (e.g., "javascript")'
              },
              forceCode: {
                type: 'boolean',
                description: 'Force code generation'
              }
            },
            required: ['nodeId', 'clientLanguages', 'clientFrameworks']
          }
        },
        {
          name: 'mcp_my-mcp-server_get_metadata',
          description: 'Get Figma node metadata',
          inputSchema: {
            type: 'object',
            properties: {
              nodeId: { type: 'string' },
              clientLanguages: { type: 'string' },
              clientFrameworks: { type: 'string' }
            },
            required: ['nodeId', 'clientLanguages', 'clientFrameworks']
          }
        },
        {
          name: 'mcp_my-mcp-server_get_screenshot',
          description: 'Get Figma node screenshot',
          inputSchema: {
            type: 'object',
            properties: {
              nodeId: { type: 'string' },
              clientLanguages: { type: 'string' },
              clientFrameworks: { type: 'string' }
            },
            required: ['nodeId', 'clientLanguages', 'clientFrameworks']
          }
        }
      ]
    }));
    
    // Handle tool calls by forwarding to HTTP MCP server
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        console.error(`[HttpBridge] Forwarding ${request.params.name} to HTTP MCP server`);
        console.error(`[HttpBridge] Arguments:`, JSON.stringify(request.params.arguments, null, 2));
        
        const httpResponse = await fetch('http://127.0.0.1:3845/mcp', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: request.params.name,
              arguments: request.params.arguments || {}
            }
          })
        });
        
        if (!httpResponse.ok) {
          const errorText = await httpResponse.text();
          console.error(`[HttpBridge] HTTP Error ${httpResponse.status}: ${errorText}`);
          throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
        }
        
        const result = await httpResponse.json();
        console.error(`[HttpBridge] Got response from HTTP server`);
        console.error(`[HttpBridge] Response type: ${typeof result}`);
        console.error(`[HttpBridge] Response keys: ${Object.keys(result || {})}`);
        
        if (result.error) {
          console.error(`[HttpBridge] MCP Error: ${JSON.stringify(result.error)}`);
          throw new Error(`MCP Error: ${result.error.message || JSON.stringify(result.error)}`);
        }
        
        // Return the result in MCP format
        if (typeof result.result === 'string') {
          console.error(`[HttpBridge] Returning string result of length: ${result.result.length}`);
          return {
            content: [
              {
                type: 'text',
                text: result.result
              }
            ]
          };
        } else if (result.result) {
          console.error(`[HttpBridge] Returning object result`);
          return result.result;
        } else if (typeof result === 'string') {
          console.error(`[HttpBridge] Returning direct string result of length: ${result.length}`);
          return {
            content: [
              {
                type: 'text', 
                text: result
              }
            ]
          };
        }
        
        console.error(`[HttpBridge] Returning raw result`);
        return result;
        
      } catch (error) {
        console.error(`[HttpBridge] Error forwarding request: ${error.message}`);
        throw error;
      }
    });
  }
  
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[HttpBridge] Bridge server started and connected');
  }
}

// Start the bridge server
const bridge = new McpHttpBridge();
bridge.start().catch(error => {
  console.error('[HttpBridge] Failed to start:', error);
  process.exit(1);
});