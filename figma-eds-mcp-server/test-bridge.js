#!/usr/bin/env node

// Test script to verify the stdio bridge is working
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function testBridge() {
  console.log('Testing stdio bridge...');
  
  try {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['-e', `
        const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
        const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
        
        const server = new Server({
          name: 'test-bridge',
          version: '1.0.0'
        }, {
          capabilities: { tools: {} }
        });
        
        server.setRequestHandler('tools/list', async () => ({
          tools: [{
            name: 'test-tool',
            description: 'Test tool',
            inputSchema: { type: 'object', properties: {} }
          }]
        }));
        
        server.setRequestHandler('tools/call', async (request) => {
          console.error('[TestBridge] Got tool call request');
          
          try {
            const response = await fetch('http://127.0.0.1:3845/mcp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                  name: 'mcp_my-mcp-server_get_code',
                  arguments: {
                    nodeId: '13157:13513',
                    clientLanguages: 'javascript',
                    clientFrameworks: 'javascript',
                    forceCode: true
                  }
                }
              })
            });
            
            if (!response.ok) {
              throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }
            
            const result = await response.json();
            console.error('[TestBridge] Got result from HTTP server');
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }]
            };
          } catch (error) {
            console.error('[TestBridge] Error:', error.message);
            throw error;
          }
        });
        
        const transport = new StdioServerTransport();
        server.connect(transport);
        console.error('[TestBridge] Bridge server started');
      `]
    });
    
    const client = new Client({
      name: 'test-client',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    
    console.log('Connecting client...');
    await client.connect(transport);
    
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.map(t => t.name));
    
    console.log('Calling test tool...');
    const result = await client.callTool({
      name: 'test-tool',
      arguments: {}
    });
    
    console.log('Result:', result);
    
    await client.close();
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBridge();