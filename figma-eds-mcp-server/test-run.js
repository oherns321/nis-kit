#!/usr/bin/env node

// Test the Figma-to-EDS MCP server with the super-cards example
async function testFigmaEdsServer() {
  console.log('🧪 Testing Figma-to-EDS MCP Server...\n');

  const figmaUrl = 'https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev';
  const blockName = 'test-super-cards';

  try {
    // First, test the server connection
    console.log('1️⃣ Testing server startup...');

    const { spawn } = await import('child_process');
    const { promisify } = await import('util');

    // Start the MCP server process
    const serverProcess = spawn('node', ['dist/server.js'], {
      cwd: '/Users/seanohern/adobe-code-kit/adobe-code-kit/figma-eds-mcp-server',
      env: {
        ...process.env,
        FIGMA_ACCESS_TOKEN: 'figd_GVQkNvt8A1N71azd9KbcVU4UFlg5MOld3FQqIKOd',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let serverReady = false;
    let serverOutput = '';

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log('📄 Server output:', output);

      // Check if server is ready (you might need to adjust this based on actual server output)
      if (output.includes('listening') || output.includes('ready') || output.includes('started')) {
        serverReady = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('⚠️ Server stderr:', data.toString());
    });

    // Wait a bit for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('✅ Server started, now testing tools...\n');

    // Test 1: Analyze block structure
    console.log('2️⃣ Testing analyze-block-structure...');

    const analyzeRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'analyze-block-structure',
        arguments: {
          figmaUrl,
          blockName,
        },
      },
    };

    console.log('📤 Sending request:', JSON.stringify(analyzeRequest, null, 2));

    // Send the request to stdin
    serverProcess.stdin.write(`${JSON.stringify(analyzeRequest)}\n`);

    // Wait for response
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('📥 Server response received');

    // Test 2: Generate block (if analysis worked)
    console.log('\n3️⃣ Testing generate-eds-block...');

    const generateRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'generate-eds-block',
        arguments: {
          figmaUrl,
          blockName,
        },
      },
    };

    console.log('📤 Sending generate request:', JSON.stringify(generateRequest, null, 2));

    serverProcess.stdin.write(`${JSON.stringify(generateRequest)}\n`);

    // Wait for generation
    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log(`✅ Test complete! Check for generated files in /blocks/${blockName}/`);

    // Clean up
    serverProcess.kill();
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure the server builds successfully: npm run build');
    console.log('2. Check that the Figma token is valid');
    console.log('3. Verify the Figma URL is accessible');
    console.log('4. Try running the server manually first: node dist/server.js');
  }
}

testFigmaEdsServer();
