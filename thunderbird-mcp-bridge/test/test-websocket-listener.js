import WebSocket from 'ws';

console.log('🔍 Starting WebSocket listener to monitor extension traffic...');

// Create a WebSocket server to listen for connections
const wss = new WebSocket.Server({ port: 9003 }, () => {
  console.log('📡 Test WebSocket server listening on port 9003');
  console.log('📋 To test:');
  console.log('   1. Change extension WS_URL to ws://localhost:9003');
  console.log('   2. Reload extension');
  console.log('   3. Enable the bridge');
});

wss.on('connection', function connection(ws, req) {
  console.log('✅ Extension connected from:', req.socket.remoteAddress);
  
  ws.on('message', function message(data) {
    console.log('📨 Received from extension:');
    console.log(data.toString());
    
    try {
      const parsed = JSON.parse(data.toString());
      console.log('📋 Parsed message:', JSON.stringify(parsed, null, 2));
      
      if (parsed.type === 'test') {
        console.log('🧪 Test message received');
      } else if (parsed.type === 'response') {
        console.log('✅ Response message - Extension is working!');
        console.log('📊 Result data:', parsed.result ? 'Present' : 'None');
        console.log('❌ Error:', parsed.error || 'None');
      }
    } catch (e) {
      console.log('⚠️  Non-JSON message');
    }
  });
  
  ws.on('close', function close() {
    console.log('❌ Extension disconnected');
  });
  
  // Send a test request to the extension
  setTimeout(() => {
    const testRequest = {
      type: 'request',
      id: 'test-listener-123',
      method: 'thunderbird_contacts',
      params: {}
    };
    
    console.log('📤 Sending test request to extension...');
    ws.send(JSON.stringify(testRequest));
  }, 1000);
});

console.log('⏰ Listening for connections...');

// Keep server running
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  wss.close();
  process.exit(0);
});