// Test MCP endpoint directly
const testMcpRequest = async () => {
  console.log('🧪 Testing MCP endpoint directly...');
  
  const mcpRequest = {
    jsonrpc: "2.0",
    id: "test-mcp-123",
    method: "tools/call",
    params: {
      name: "thunderbird_contacts",
      arguments: {}
    }
  };
  
  try {
    const response = await fetch('http://localhost:9002/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mcpRequest)
    });
    
    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      return;
    }
    
    const result = await response.json();
    console.log('📨 MCP Response:', JSON.stringify(result, null, 2));
    
    if (result.result && !result.result.error) {
      console.log('✅ MCP endpoint working correctly!');
      console.log('📊 Contacts returned:', Array.isArray(result.result) ? result.result.length : 'N/A');
    } else if (result.result && result.result.error) {
      console.log('⚠️  MCP returned error:', result.result.message);
    } else {
      console.log('❓ Unexpected response format');
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
};

testMcpRequest();