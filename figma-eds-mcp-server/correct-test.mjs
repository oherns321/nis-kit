#!/usr/bin/env node

// Test with correct tool names
import { spawn } from 'child_process';

async function testCorrectToolNames() {
  console.log('🧪 Testing with correct tool names...\n');

  const server = spawn('node', ['dist/server.js'], {
    cwd: '/Users/seanohern/adobe-code-kit/adobe-code-kit/figma-eds-mcp-server',
    env: {
      ...process.env,
      FIGMA_ACCESS_TOKEN: '',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (data) => {
    try {
      const response = JSON.parse(data.toString());
      console.log('📥 Server Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('📄 Server Output:', data.toString().trim());
    }
  });

  server.stderr.on('data', (data) => {
    console.log('⚠️ Server:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Extract file key and node ID from the Figma URL
  const figmaUrl = 'https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev';
  const fileKey = 'uNaqf803xH0QtIb65S4klS'; // From URL
  const nodeId = '8990:3013'; // From node-id parameter (replace - with :)

  console.log('📤 Testing block analysis with correct parameters...');

  const analyzeRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'analyzeBlockStructure', // Correct camelCase name
      arguments: {
        figmaFileKey: fileKey,
        figmaNodeId: nodeId,
      },
    },
  };

  console.log('Request:', JSON.stringify(analyzeRequest, null, 2));
  server.stdin.write(`${JSON.stringify(analyzeRequest)}\n`);

  // Wait for analysis
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // If analysis works, try generation
  console.log('\n📤 Testing block generation...');

  const generateRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'generateEdsBlock',
      arguments: {
        blockName: 'test-super-cards',
        figmaFileKey: fileKey,
        figmaNodeId: nodeId,
        outputPath: '/Users/seanohern/adobe-code-kit/adobe-code-kit',
      },
    },
  };

  console.log('Generate Request:', JSON.stringify(generateRequest, null, 2));
  server.stdin.write(`${JSON.stringify(generateRequest)}\n`);

  // Wait for generation
  await new Promise((resolve) => setTimeout(resolve, 15000));

  console.log('\n✅ Test completed! Check /blocks/test-super-cards/ for generated files');

  server.kill();
}

testCorrectToolNames().catch(console.error);
