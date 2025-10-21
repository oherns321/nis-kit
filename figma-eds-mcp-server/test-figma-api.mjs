#!/usr/bin/env node

// Test Figma API access directly
async function testFigmaAccess() {
  const token = 'figd_GVQkNvt8A1N71azd9KbcVU4UFlg5MOld3FQqIKOd';
  const fileKey = 'uNaqf803xH0QtIb65S4klS';

  console.log('🔑 Testing Figma API access...\n');

  try {
    // Test 1: Get user info (to verify token works)
    console.log('1️⃣ Testing user authentication...');
    const userResponse = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('User API Status:', userResponse.status);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Token valid! User:', userData.email || userData.handle);
    } else {
      console.log('❌ Token invalid or expired');
      const error = await userResponse.text();
      console.log('Error:', error);
      return;
    }

    // Test 2: Try to access the file
    console.log('\n2️⃣ Testing file access...');
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('File API Status:', fileResponse.status);
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      console.log('✅ File accessible! Name:', fileData.name);
      console.log('File has', Object.keys(fileData.document.children).length, 'pages');
    } else {
      console.log('❌ File not accessible');
      const error = await fileResponse.text();
      console.log('Error:', error);

      if (fileResponse.status === 403) {
        console.log('\n💡 This usually means:');
        console.log('- The file is private and you need edit access');
        console.log('- The token needs "File content" permission');
        console.log('- Try using a different Figma file that you own');
      }
    }

    // Test 3: Try a different approach - get nodes directly
    console.log('\n3️⃣ Testing node access...');
    const nodeResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=8990:3013`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('Node API Status:', nodeResponse.status);
    if (nodeResponse.ok) {
      const nodeData = await nodeResponse.json();
      console.log('✅ Node accessible!');
      console.log('Node data keys:', Object.keys(nodeData));
    } else {
      const error = await nodeResponse.text();
      console.log('❌ Node not accessible:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFigmaAccess();
