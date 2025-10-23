import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'server.js');

console.log('🔍 Testing environment variables in MCP server...');

// Test with explicit environment variable
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    FIGMA_ACCESS_TOKEN: 'figd_GVQkNvt8A1N71azd9KbcVU4UFlg5MOld3FQqIKOd',
    DEBUG: 'true'
  }
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || '';
  
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

// Initialize
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "env-test", version: "1.0.0" }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
  console.log('📤 Testing with explicit environment...');
  
  const analysisRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "analyzeBlockStructure",
      arguments: {
        figmaNodeId: "4118:11899",
        figmaFileKey: "gDpSOY8rJbFGt4aXlmlGVZ"
      }
    }
  };
  
  server.stdin.write(JSON.stringify(analysisRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('🎉 Environment test completed!');
  server.kill();
  process.exit(0);
}, 4000);