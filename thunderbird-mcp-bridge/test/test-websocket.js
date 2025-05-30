import WebSocket from 'ws';

console.log('Testing WebSocket connection to ws://localhost:9001...');

const ws = new WebSocket('ws://localhost:9001');

ws.on('open', function open() {
  console.log('✅ WebSocket connection opened successfully');
  
  // Send a test message
  const testMessage = {
    type: 'test',
    timestamp: Date.now(),
    message: 'Test connection from Node.js'
  };
  
  console.log('📤 Sending test message:', testMessage);
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', function message(data) {
  console.log('📨 Received message:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});

// Keep the script running for a few seconds
setTimeout(() => {
  console.log('⏰ Closing connection...');
  ws.close();
}, 3000);