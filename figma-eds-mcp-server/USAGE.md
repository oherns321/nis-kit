# How to Use the Figma-to-EDS MCP Server

## Method 1: VS Code Chat Integration (Recommended)

### Setup
1. **Configure VS Code Settings**
   Add this to your VS Code `settings.json`:
   ```json
   {
     "mcp.servers": {
       "figma-eds": {
         "command": "node",
         "args": ["/Users/seanohern/adobe-code-kit/adobe-code-kit/figma-eds-mcp-server/dist/server.js"],
         "env": {
           "FIGMA_ACCESS_TOKEN": "your-figma-personal-access-token"
         }
       }
     }
   }
   ```

2. **Get Your Figma Token**
   - Go to Figma → Settings → Personal Access Tokens
   - Generate a new token
   - Copy it to the `FIGMA_ACCESS_TOKEN` environment variable

3. **Update Block Builder Chat Mode**
   The server works with the existing Block Builder chat mode. Update the configuration:
   ```yaml
   tools: ['runCommands', 'edit', 'search', 'todos', 'usages', 'vscodeAPI', 'problems', 'changes', 'fetch', 'githubRepo', 'figma-eds', 'aitk_get_ai_model_guidance', 'aitk_get_tracing_code_gen_best_practices', 'aitk_open_tracing_page']
   ```

### Usage in VS Code Chat

**Quick Block Generation:**
```
@BlockBuilder Create a block called "feature-highlights" from this Figma design:
https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev
```

**Two-Step Process:**
```
@BlockBuilder First analyze this design:
https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev

Then generate the block called "hero-banner"
```

## Method 2: Direct MCP Client

### Using Node.js MCP Client
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: "figma-eds-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./figma-eds-mcp-server/dist/server.js'],
  env: {
    FIGMA_ACCESS_TOKEN: 'your-token'
  }
});

await client.connect(transport);

// Analyze a design
const analysis = await client.request({
  method: 'tools/call',
  params: {
    name: 'analyze-block-structure',
    arguments: {
      figmaUrl: 'https://figma.com/design/...',
      blockName: 'my-awesome-block'
    }
  }
});

// Generate the block
const result = await client.request({
  method: 'tools/call',
  params: {
    name: 'generate-eds-block', 
    arguments: {
      figmaUrl: 'https://figma.com/design/...',
      blockName: 'my-awesome-block',
      outputPath: '/path/to/your/eds-project'
    }
  }
});
```

## Method 3: Command Line Usage

### Direct Server Execution
You can also run the server directly and send JSON-RPC messages:

```bash
# Start the server
cd /Users/seanohern/adobe-code-kit/adobe-code-kit/figma-eds-mcp-server
FIGMA_ACCESS_TOKEN=your-token node dist/server.js

# Send JSON-RPC request (in another terminal)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"analyze-block-structure","arguments":{"figmaUrl":"https://figma.com/design/...","blockName":"test-block"}}}' | node dist/server.js
```

## Available Tools

### 1. `analyze-block-structure`
Analyzes a Figma design to understand its structure.

**Parameters:**
- `figmaUrl` (required): Figma design URL or node ID
- `blockName` (required): Name for the block
- `figmaAccessToken` (optional): Token if not in environment

**Example:**
```json
{
  "figmaUrl": "https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev",
  "blockName": "super-cards"
}
```

**Returns:**
```json
{
  "blockType": "multi-item",
  "blockName": "super-cards",
  "contentStructure": {
    "containerFields": [...],
    "itemFields": [...],
    "configurationOptions": ["dark", "centered"]
  }
}
```

### 2. `generate-eds-block`
Generates complete EDS block from Figma design.

**Parameters:**
- `figmaUrl` (required): Figma design URL or node ID  
- `blockName` (required): Name for the block
- `outputPath` (optional): Custom output directory
- `figmaAccessToken` (optional): Token if not in environment

**Returns:**
```json
{
  "files": {
    "css": "/* Complete CSS with design system variables */",
    "javascript": "/* Universal Editor compatible JS */", 
    "model": "/* Container model JSON */",
    "readme": "/* Comprehensive documentation */",
    "icon": "/* SVG icon */",
    "testSimple": "/* Basic test HTML */",
    "testRealStructure": "/* UE structure test HTML */"
  },
  "validation": {
    "linting": [],
    "accessibility": [],
    "designSystem": []
  },
  "integration": {
    "sectionModelUpdated": true,
    "componentsRegistered": ["super-cards"]
  }
}
```

## Figma URL Formats Supported

The server accepts various Figma URL formats:

1. **Full Design URL with Node ID:**
   ```
   https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev
   ```

2. **Just Node ID:**
   ```
   8990:3013
   ```

3. **Node ID with Dashes:**
   ```
   8990-3013
   ```

## Environment Variables

- `FIGMA_ACCESS_TOKEN`: Your Figma personal access token (required)
- `PROJECT_ROOT`: Root directory of your EDS project (optional, defaults to current directory)

## File Output Structure

When you run `generate-eds-block`, it creates:

```
/blocks/[block-name]/
├── README.md                    # Complete documentation
├── [block-name].css            # Responsive CSS with design system variables
├── [block-name].js             # Universal Editor compatible JavaScript
├── icon.svg                    # Block icon for Universal Editor
├── _[block-name].json          # Container model definition
└── _[block-name]-item.json     # Item model (for multi-item blocks only)

/test/
├── [block-name].html           # Basic test structure
└── [block-name]-realstructure.html  # Universal Editor DOM structure test

/models/
└── _section.json               # Updated to include new block in allowedComponents
```

## Quality Guarantees

Every generated block meets these standards:
- ✅ **Linting**: Zero ESLint and Stylelint errors
- ✅ **Accessibility**: WCAG 2.1 AA compliant patterns
- ✅ **Performance**: Optimized CSS/JS bundle sizes
- ✅ **Universal Editor**: Full authoring and editing support
- ✅ **Design System**: Uses only approved CSS variables
- ✅ **Documentation**: Comprehensive README and usage examples

## Troubleshooting

### Common Issues

1. **"Figma token invalid"**
   - Check your `FIGMA_ACCESS_TOKEN` is correct
   - Ensure the token has read access to the file

2. **"Node not found"**
   - Verify the Figma URL or node ID is correct
   - Make sure the design is published or you have access

3. **"Block already exists"**
   - The server will create a backup before overwriting
   - Check `/blocks/[block-name].backup.[timestamp]/` for previous version

4. **"TypeScript compilation errors"**
   - Run `npm run build` in the server directory
   - Check that all dependencies are installed

### Debug Mode
Set `NODE_ENV=development` for verbose logging:
```bash
NODE_ENV=development FIGMA_ACCESS_TOKEN=your-token node dist/server.js
```

## Next Steps

After generating a block:

1. **Review Generated Files**: Check the README.md for field explanations
2. **Test the Block**: Use the generated test HTML files
3. **Customize if Needed**: Modify CSS/JS while preserving UE compatibility
4. **Validate Quality**: Run linting and accessibility checks
5. **Deploy**: The block is ready for production use

## Examples

See the `/test/` directory for examples of generated blocks and their structure.