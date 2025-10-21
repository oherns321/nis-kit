# Quick Start Example: Using the Figma-to-EDS MCP Server

This example shows how to use the MCP server to generate the `super-cards` block from the Figma design we analyzed earlier.

## Step 1: Setup (One-time)

1. **Get Your Figma Token**
   ```bash
   # Go to Figma → Settings → Personal Access Tokens
   # Create a new token and copy it
   export FIGMA_ACCESS_TOKEN="figd_your_token_here"
   ```

2. **Start the MCP Server**
   ```bash
   cd /Users/seanohern/adobe-code-kit/adobe-code-kit/figma-eds-mcp-server
   FIGMA_ACCESS_TOKEN="$FIGMA_ACCESS_TOKEN" node dist/server.js
   ```

## Step 2: Generate a Block

### Option A: Using VS Code Chat (Recommended)
```
@BlockBuilder Create a block called "super-cards" from this Figma design:
https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev
```

### Option B: Using MCP Client Directly

```javascript
// analyze-block-example.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function generateBlock() {
  const client = new Client({
    name: "figma-eds-example",
    version: "1.0.0"
  }, { capabilities: {} });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./figma-eds-mcp-server/dist/server.js'],
    env: {
      FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN
    }
  });

  await client.connect(transport);

  try {
    // Step 1: Analyze the design
    console.log('🔍 Analyzing Figma design...');
    const analysis = await client.request({
      method: 'tools/call',
      params: {
        name: 'analyze-block-structure',
        arguments: {
          figmaUrl: 'https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev',
          blockName: 'super-cards'
        }
      }
    });

    console.log('📊 Analysis Result:', JSON.stringify(analysis.content[0].text, null, 2));

    // Step 2: Generate the complete block
    console.log('🏗️ Generating EDS block files...');
    const generation = await client.request({
      method: 'tools/call',
      params: {
        name: 'generate-eds-block',
        arguments: {
          figmaUrl: 'https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev',
          blockName: 'super-cards',
          outputPath: '/Users/seanohern/adobe-code-kit/adobe-code-kit'
        }
      }
    });

    console.log('✅ Block generation complete!');
    console.log('📁 Files created in /blocks/super-cards/');
    console.log('🧪 Test files created in /test/');
    console.log('⚙️  Section model updated in /models/_section.json');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

generateBlock();
```

### Option C: Command Line JSON-RPC

```bash
# Analyze design structure
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "analyze-block-structure",
    "arguments": {
      "figmaUrl": "https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev",
      "blockName": "super-cards"
    }
  }
}' | FIGMA_ACCESS_TOKEN="$FIGMA_ACCESS_TOKEN" node dist/server.js

# Generate complete block
echo '{
  "jsonrpc": "2.0", 
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "generate-eds-block",
    "arguments": {
      "figmaUrl": "https://www.figma.com/design/uNaqf803xH0QtIb65S4klS/AEM---EDS-Design-Kit-for-OOTB?node-id=8990-3013&m=dev",
      "blockName": "super-cards"
    }
  }
}' | FIGMA_ACCESS_TOKEN="$FIGMA_ACCESS_TOKEN" node dist/server.js
```

## Step 3: Review Generated Files

After generation, you'll have:

```
/blocks/super-cards/
├── README.md                    # 📚 Complete documentation
├── super-cards.css             # 🎨 Design system compliant CSS
├── super-cards.js              # ⚙️  Universal Editor compatible JS
├── icon.svg                    # 🖼️  Block icon for Universal Editor
├── _super-cards.json           # 📋 Container model definition
└── _super-cards-item.json      # 📋 Item model definition

/test/
├── super-cards.html            # 🧪 Basic test structure
└── super-cards-realstructure.html  # 🧪 Universal Editor structure test

/models/
└── _section.json               # ⚙️  Updated with new block
```

## Step 4: Test the Block

1. **Open Test Files**
   ```bash
   # View basic test
   open /Users/seanohern/adobe-code-kit/adobe-code-kit/test/super-cards.html
   
   # View Universal Editor structure test
   open /Users/seanohern/adobe-code-kit/adobe-code-kit/test/super-cards-realstructure.html
   ```

2. **Check Block Documentation**
   ```bash
   cat /Users/seanohern/adobe-code-kit/adobe-code-kit/blocks/super-cards/README.md
   ```

3. **Validate Code Quality**
   ```bash
   cd /Users/seanohern/adobe-code-kit/adobe-code-kit
   npm run lint  # Should pass with zero errors
   ```

## Expected Output

### Analysis Result Example:
```json
{
  "blockType": "multi-item",
  "blockName": "super-cards",
  "contentStructure": {
    "containerFields": [
      {
        "name": "heading",
        "label": "Container Heading",
        "component": "text",
        "valueType": "string",
        "required": false
      }
    ],
    "itemFields": [
      {
        "name": "cardHeading",
        "label": "Card Heading",
        "component": "richtext",
        "valueType": "string",
        "required": true
      },
      {
        "name": "cardBody",
        "label": "Card Body",
        "component": "richtext",
        "valueType": "string",
        "required": false
      },
      {
        "name": "primaryCta",
        "label": "Primary CTA URL",
        "component": "text",
        "valueType": "string",
        "required": false
      },
      {
        "name": "primaryCtaText",
        "label": "Primary CTA Text",
        "component": "text",
        "valueType": "string",
        "required": false
      }
    ],
    "configurationOptions": ["dark", "centered"]
  }
}
```

### Generated CSS Example:
```css
/* Uses design system variables exclusively */
.super-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-l);
  padding: var(--spacing-l);
}

.super-cards .item {
  background: var(--background-primary);
  border-radius: var(--card-border-radius);
  padding: var(--card-padding);
}

.super-cards .item-heading {
  font-size: var(--heading-font-size-m);
  color: var(--text-primary);
  margin-bottom: var(--spacing-s);
}
```

## Troubleshooting

- **Server won't start**: Check that all dependencies are installed (`npm install`)
- **Figma token error**: Verify token is correct and has file read permissions
- **Files not created**: Ensure write permissions in target directory
- **Linting errors**: The server generates compliant code; check for manual modifications

## Next Steps

1. **Customize the block** by modifying CSS/JS while preserving Universal Editor compatibility
2. **Test in Universal Editor** using the real structure test file
3. **Deploy to production** - the block is ready for use