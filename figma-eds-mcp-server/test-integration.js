#!/usr/bin/env node

// Test the StdioMcpClient integration
import { StdioMcpClient } from './dist/figma/stdioMcpClient.js';

async function testIntegration() {
  console.log('Testing StdioMcpClient integration...');
  
  try {
    const client = new StdioMcpClient();
    console.log('Client created successfully');
    
    await client.initializeClient();
    console.log('Client initialized successfully');
    
    const code = await client.getGeneratedCode('13157:13513');
    console.log('Generated code received:');
    console.log('Code type:', typeof code);
    console.log('Code keys:', Object.keys(code || {}));
    if (code && code.code) {
      console.log(code.code.substring(0, 200) + '...');
    }
    
    await client.disconnect();
    console.log('Integration test completed successfully!');
    
  } catch (error) {
    console.error('Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration();