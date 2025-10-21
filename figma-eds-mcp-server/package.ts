{
  "name": "figma-eds-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for generating Adobe EDS blocks from Figma designs",
  "main": "dist/server.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "test": "jest"
  },
  "keywords": [
    "figma",
    "adobe-eds",
    "mcp",
    "code-generation",
    "universal-editor"
  ],
  "author": "Adobe Code Kit Team",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "handlebars": "^4.7.8",
    "fs-extra": "^11.2.0",
    "path": "^0.12.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/fs-extra": "^11.0.4",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "typescript": "^5.3.0"
  }
}