import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'server.js');

console.log('🚀 Testing Figma EDS MCP Server with your specific design...');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  
  // Process complete JSON-RPC messages
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || ''; // Keep incomplete line
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('📥 Server Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📥 Server Output:', line);
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('⚠️ Server Error:', data.toString());
});

// Initialize the server
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
  console.log('📤 Testing block analysis for feature-carousel...');
  
  const analysisRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "analyzeBlockStructure",
      arguments: {
        figmaNodeId: "4118-11899",
        figmaFileKey: "gDpSOY8rJbFGt4aXlmlGVZ"
      }
    }
  };
  
  server.stdin.write(JSON.stringify(analysisRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('📤 Testing block generation...');
  
  const generateRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "generateEdsBlock",
      arguments: {
        blockName: "feature-carousel",
        figmaNodeId: "4118-11899", 
        figmaFileKey: "gDpSOY8rJbFGt4aXlmlGVZ",
        outputPath: "/Users/seanohern/adobe-code-kit/adobe-code-kit/blocks"
      }
    }
  };
  
  server.stdin.write(JSON.stringify(generateRequest) + '\n');
}, 2000);

setTimeout(() => {
  console.log('🎉 Test completed!');
  server.kill();
  process.exit(0);
}, 5000);