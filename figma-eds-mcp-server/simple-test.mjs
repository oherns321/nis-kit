#!/usr/bin/env node

// Simple test of the Figma-to-EDS MCP server
import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🚀 Starting Figma-to-EDS MCP Server test...\n');

  // Start the server
  const server = spawn('node', ['dist/server.js'], {
    cwd: '/Users/seanohern/adobe-code-kit/adobe-code-kit/figma-eds-mcp-server',
    env: {
      ...process.env,
      FIGMA_ACCESS_TOKEN: 'figd_GVQkNvt8A1N71azd9KbcVU4UFlg5MOld3FQqIKOd',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let responseReceived = false;

  // Handle server responses
  server.stdout.on('data', (data) => {
    try {
      const response = JSON.parse(data.toString());
      console.log('📥 Server Response:', JSON.stringify(response, null, 2));
      responseReceived = true;
    } catch (e) {
      console.log('📄 Server Output:', data.toString());
    }
  });

  server.stderr.on('data', (data) => {
    console.log('⚠️ Server Error:', data.toString());
  });

  // Wait for server to initialize
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('✅ Server started, sending test request...\n');

  // Test 1: List available tools
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  };

  console.log('📤 Listing available tools...');
  server.stdin.write(`${JSON.stringify(listToolsRequest)}\n`);

  // Wait for response
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 2: Analyze block structure
  const analyzeRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'analyze-block-structure',
      arguments: {
        figmaUrl: 'https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev',
        blockName: 'test-super-cards',
      },
    },
  };

  console.log('📤 Testing block analysis...');
  server.stdin.write(`${JSON.stringify(analyzeRequest)}\n`);

  // Wait for analysis response
  await new Promise((resolve) => setTimeout(resolve, 8000));

  if (responseReceived) {
    console.log('\n🎉 Test completed successfully!');
  } else {
    console.log('\n⏳ Server may still be processing, check VS Code for MCP server status');
  }

  // Clean up
  server.kill();
  process.exit(0);
}

testMCPServer().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
