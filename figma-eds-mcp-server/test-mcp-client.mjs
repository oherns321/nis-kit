import { MCPFigmaClient } from './dist/figma/mcpClient.js';

async function test() {
  const client = new MCPFigmaClient();
  console.log('Testing MCP client connection...');
  
  try {
    // Test the connection first
    const connected = await client.testConnection();
    console.log('Connection test result:', connected);
    
    // Try to get code
    const result = await client.getGeneratedCode('https://www.figma.com/design/JVBIwTrUTJtvy6snVCu37S/Comcast-XLR8-Orals?node-id=13157-11781&m=dev');
    console.log('Generated code result:', {
      hasCode: !!result.code,
      codeLength: result.code?.length || 0,
      preview: result.code?.slice(0, 100) || 'No code'
    });
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();