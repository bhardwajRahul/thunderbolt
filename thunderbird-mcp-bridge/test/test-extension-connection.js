import WebSocket from 'ws';

console.log('🔍 Testing if Thunderbird extension is connecting...');

const ws = new WebSocket('ws://localhost:9001');

let messageReceived = false;

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket server');
  
  // Send a test request like the extension would
  const testRequest = {
    type: 'request',
    id: 'test-123',
    method: 'thunderbird_accounts',
    params: {}
  };
  
  console.log('📤 Sending test request:', JSON.stringify(testRequest, null, 2));
  ws.send(JSON.stringify(testRequest));
  
  // Wait for response
  setTimeout(() => {
    if (!messageReceived) {
      console.log('⏰ No response received - extension likely not connected');
      console.log('📋 Please check:');
      console.log('   1. Extension is installed in Thunderbird');
      console.log('   2. Extension popup shows "Connected" status');
      console.log('   3. Bridge is enabled in extension popup');
      ws.close();
    }
  }, 5000);
});

ws.on('message', function message(data) {
  messageReceived = true;
  console.log('📨 Received response:', data.toString());
  
  try {
    const parsed = JSON.parse(data.toString());
    if (parsed.type === 'response' && parsed.id === 'test-123') {
      console.log('✅ Extension is working correctly!');
      console.log('✅ Thunderbird data accessible:', parsed.result ? 'Yes' : 'No');
    }
  } catch (e) {
    console.log('⚠️  Received non-JSON response');
  }
  
  ws.close();
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 Connection closed');
  process.exit(0);
});