# Figma to EDS Block Generator MCP Server

This Model Context Protocol (MCP) server automates the process of generating Adobe Edge Delivery Services (EDS) blocks from Figma designs. It transforms the manual 2-hour block creation workflow into a 3-minute automated process.

## Features

- **Figma Integration**: Extracts designs, screenshots, and metadata from Figma
- **Automated Block Generation**: Creates complete EDS blocks with all required files
- **Universal Editor Support**: Generates blocks compatible with Universal Editor DOM structure
- **Design System Integration**: Uses EY theme CSS variables exclusively
- **Production Ready**: Generates linting-compliant, accessible, and performant blocks

## Tools Provided

### `analyze-block-structure`
Analyzes a Figma design to determine block structure and content fields.

**Parameters:**
- `figmaUrl` (required): Figma design URL or node ID
- `blockName` (required): Name for the generated block
- `figmaAccessToken` (optional): Figma API access token

**Returns:**
- Block type (single or multi-item)
- Content structure with field definitions
- Styling and interaction analysis

### `generate-eds-block`
Generates complete EDS block files from analyzed Figma design.

**Parameters:**
- `figmaUrl` (required): Figma design URL or node ID
- `blockName` (required): Name for the generated block
- `outputPath` (optional): Custom output directory path
- `figmaAccessToken` (optional): Figma API access token

**Returns:**
- Complete file set (CSS, JS, models, README, tests)
- Validation results and suggestions
- Section model integration status

## Generated Files

For each block, the server generates:

```
/blocks/[block-name]/
├── README.md                    # Comprehensive documentation
├── [block-name].css            # Design system compliant styling
├── [block-name].js             # Universal Editor compatible logic
├── icon.svg                    # Block icon for Universal Editor
├── _[block-name].json          # Container model definition
└── _[block-name]-item.json     # Item model (for multi-item blocks)

/test/
├── [block-name].html           # Basic testing structure
└── [block-name]-realstructure.html  # Universal Editor structure test
```

## Architecture

### Core Components

- **FigmaClient**: Handles Figma API communication
- **DesignAnalyzer**: Extracts and analyzes design structure
- **Generators**: Create specific file types (CSS, JS, models, docs, tests)
- **Validators**: Ensure field naming and design system compliance
- **FileManager**: Handles file system operations and project integration

### Validation & Quality

- **Field Naming**: Enforces safe, Universal Editor compatible field names
- **Design System**: Validates CSS variable usage and prevents hardcoded values
- **Accessibility**: Ensures WCAG 2.1 AA compliance patterns
- **Performance**: Optimizes for bundle size and load times

## Installation

1. Build the server:
   ```bash
   npm install
   npm run build
   ```

2. Configure in your VS Code settings or chat mode:
   ```json
   {
     "mcpServers": {
       "figma-eds": {
         "command": "node",
         "args": ["./dist/server.js"],
         "env": {
           "FIGMA_ACCESS_TOKEN": "your-figma-token"
         }
       }
     }
   }
   ```

## Environment Variables

- `FIGMA_ACCESS_TOKEN`: Your Figma personal access token (get from Figma settings)

## Quality Standards

Generated blocks meet these standards:
- **Visual Accuracy**: Within 2% of Figma design
- **Accessibility**: WCAG 2.1 AA compliance (Lighthouse 100)
- **Performance**: Lighthouse ≥90 for all metrics
- **Code Quality**: Zero ESLint and Stylelint errors
- **Bundle Size**: CSS ≤5KB, JavaScript ≤3KB (minified+gzipped)

## Usage Example

1. **Analyze a Figma design:**
   ```typescript
   const analysis = await mcpClient.callTool('analyze-block-structure', {
     figmaUrl: 'https://figma.com/design/...',
     blockName: 'feature-cards'
   });
   ```

2. **Generate the complete block:**
   ```typescript
   const result = await mcpClient.callTool('generate-eds-block', {
     figmaUrl: 'https://figma.com/design/...',
     blockName: 'feature-cards',
     outputPath: '/path/to/eds-project'
   });
   ```

3. **Review generated files** and customize as needed

## Block Types Supported

### Single Item Blocks
- Hero sections
- Banner content
- Single card displays
- Simple content blocks

### Multi-Item Blocks
- Card collections
- Feature lists
- Gallery displays
- Repeatable content sections

## Integration

The server automatically:
- Adds new blocks to `/models/_section.json` allowedComponents
- Creates appropriate model definitions for Universal Editor
- Generates test files for development and validation
- Provides comprehensive documentation

## Development

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Protocol**: Model Context Protocol (MCP)
- **APIs**: Figma REST API
- **Target**: Adobe Edge Delivery Services + Universal Editor

## License

This project follows the same license as the parent Adobe Code Kit project.