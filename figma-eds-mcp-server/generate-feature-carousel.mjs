import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverPath = join(__dirname, 'dist', 'server.js');

console.log('🚀 Generating feature-carousel block from your Figma design...');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    FIGMA_ACCESS_TOKEN: 'figd_GVQkNvt8A1N71azd9KbcVU4UFlg5MOld3FQqIKOd'
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
        if (response.result) {
          console.log('📥 Success:', response.result.content ? 'Analysis/Generation completed' : 'Tool executed');
          if (response.result.content && response.result.content[0]?.text) {
            // Save the analysis result
            const fs = require('fs');
            fs.writeFileSync('figma-analysis-result.json', response.result.content[0].text);
            console.log('💾 Analysis saved to figma-analysis-result.json');
          }
        }
        if (response.error) {
          console.log('❌ Error:', response.error.message);
        }
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
    clientInfo: { name: "block-generator", version: "1.0.0" }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
  console.log('📤 Generating feature-carousel block...');
  
  const generateRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "generateEdsBlock",
      arguments: {
        blockName: "feature-carousel",
        figmaNodeId: "4118:11899",
        figmaFileKey: "gDpSOY8rJbFGt4aXlmlGVZ",
        outputPath: "/Users/seanohern/adobe-code-kit/adobe-code-kit/blocks",
        options: {
          updateSectionModel: true,
          createTestFiles: true,
          validateOutput: true
        }
      }
    }
  };
  
  server.stdin.write(JSON.stringify(generateRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('🎉 Block generation completed!');
  server.kill();
  process.exit(0);
}, 10000);