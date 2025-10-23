#!/usr/bin/env node

// Test Figma API access for your specific design
async function testYourFigmaDesign() {
  const token = '';
  const fileKey = 'gDpSOY8rJbFGt4aXlmlGVZ';  // Your file
  const nodeId = '4118-11899';  // Your node

  console.log('🎨 Testing your specific Figma design...\n');
  console.log('File:', fileKey);
  console.log('Node:', nodeId);

  try {
    // Test 1: Get the file
    console.log('\n1️⃣ Testing file access...');
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('File API Status:', fileResponse.status);
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      console.log('✅ File accessible! Name:', fileData.name);
      console.log('File has', fileData.document.children.length, 'pages');
    } else {
      console.log('❌ File not accessible');
      const error = await fileResponse.text();
      console.log('Error:', error);
      return;
    }

    // Test 2: Get your specific node
    console.log('\n2️⃣ Testing node access...');
    const nodeResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('Node API Status:', nodeResponse.status);
    if (nodeResponse.ok) {
      const nodeData = await nodeResponse.json();
      console.log('✅ Node accessible!');
      
      const node = nodeData.nodes[nodeId];
      if (node && node.document) {
        console.log('Node name:', node.document.name);
        console.log('Node type:', node.document.type);
        console.log('Node children:', node.document.children ? node.document.children.length : 'none');
        
        // Let's see what's in the node
        if (node.document.children) {
          console.log('\n📋 Node structure:');
          node.document.children.forEach((child, i) => {
            console.log(`  ${i + 1}. ${child.name} (${child.type})`);
          });
        }
      }
    } else {
      const error = await nodeResponse.text();
      console.log('❌ Node not accessible:', error);
    }

    // Test 3: Get images from the node
    console.log('\n3️⃣ Testing image export...');
    const imageResponse = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('Image API Status:', imageResponse.status);
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log('✅ Images available!');
      console.log('Image URLs:', Object.keys(imageData.images || {}));
    } else {
      const error = await imageResponse.text();
      console.log('❌ Image export failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testYourFigmaDesign();