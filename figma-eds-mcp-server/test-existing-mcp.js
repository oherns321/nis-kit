#!/usr/bin/env node

// Test script to check what tools the existing Figma MCP server provides
async function testExistingMCPServer() {
  try {
    const response = await fetch('http://127.0.0.1:3845/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`MCP Error: ${result.error.message}`);
    }

    console.log('✅ Existing Figma MCP Server Tools:');
    console.log(JSON.stringify(result.result, null, 2));

    // Test a simple tool call to see the response format
    if (result.result.tools && result.result.tools.length > 0) {
      console.log('\n🧪 Testing first available tool...');
      const firstTool = result.result.tools[0];

      const testResponse = await fetch('http://127.0.0.1:3845/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: firstTool.name,
            arguments: {},
          },
        }),
      });

      const testResult = await testResponse.json();
      console.log('Test result:', JSON.stringify(testResult, null, 2));
    }
  } catch (error) {
    console.error('❌ Error connecting to existing MCP server:', error.message);
    console.log('\n💡 This means:');
    console.log('1. The server might not be running at http://127.0.0.1:3845/mcp');
    console.log('2. Or it uses a different protocol/format');
    console.log('3. We should use the direct Figma API approach instead');
  }
}

testExistingMCPServer();
