// Thunderbolt Bridge Background Script
console.log('Thunderbolt Bridge: Background script loaded');
console.log('Thunderbolt Bridge: Extension version 1.0.0');
console.log('Thunderbolt Bridge: WebSocket URL:', 'ws://localhost:9001');

let websocket = null;
let reconnectTimer = null;
let connectionStatus = 'disconnected';
let isEnabled = false;

// WebSocket configuration
const WS_URL = 'ws://localhost:9001';
const RECONNECT_DELAY = 5000;

// Initialize extension state
browser.storage.local.get(['enabled']).then(result => {
  isEnabled = result.enabled || false;
  console.log('Thunderbolt Bridge: Extension enabled from storage:', isEnabled);
  if (isEnabled) {
    console.log('Thunderbolt Bridge: Auto-connecting because extension is enabled');
    connect();
  } else {
    console.log('Thunderbolt Bridge: Extension disabled, not auto-connecting');
  }
}).catch(error => {
  console.error('Thunderbolt Bridge: Error reading storage:', error);
});

// Connect to WebSocket server
function connect() {
  if (!isEnabled || websocket?.readyState === WebSocket.OPEN) {
    return;
  }

  console.log('Thunderbolt Bridge: Connecting to WebSocket server...');
  
  try {
    websocket = new WebSocket(WS_URL);
    
    websocket.onopen = () => {
      console.log('Thunderbolt Bridge: Connected to WebSocket server at', WS_URL);
      connectionStatus = 'connected';
      updateIcon('connected');
      clearTimeout(reconnectTimer);
      
      // Send a test message to verify the connection
      const testMessage = {
        type: 'test',
        timestamp: Date.now(),
        message: 'Bridge connected successfully'
      };
      websocket.send(JSON.stringify(testMessage));
    };
    
    websocket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Thunderbolt Bridge: Received message:', message);
        await handleMessage(message);
      } catch (error) {
        console.error('Thunderbolt Bridge: Error parsing message:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('Thunderbolt Bridge: WebSocket error:', error);
      connectionStatus = 'error';
      updateIcon('error');
    };
    
    websocket.onclose = () => {
      console.log('Thunderbolt Bridge: WebSocket connection closed');
      connectionStatus = 'disconnected';
      updateIcon('disconnected');
      websocket = null;
      
      // Reconnect if still enabled
      if (isEnabled) {
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
      }
    };
  } catch (error) {
    console.error('Thunderbolt Bridge: Failed to create WebSocket:', error);
    connectionStatus = 'error';
    updateIcon('error');
  }
}

// Disconnect from WebSocket server
function disconnect() {
  console.log('Thunderbolt Bridge: Disconnecting...');
  isEnabled = false;
  clearTimeout(reconnectTimer);
  
  if (websocket) {
    websocket.close();
    websocket = null;
  }
  
  connectionStatus = 'disconnected';
  updateIcon('disconnected');
}

// Handle incoming messages from WebSocket
async function handleMessage(message) {
  if (message.type !== 'request') {
    return;
  }
  
  const { id, method, params } = message;
  let result = null;
  let error = null;
  
  try {
    switch (method) {
      case 'thunderbird_contacts':
        result = await getContacts(params);
        break;
        
      case 'thunderbird_emails':
        result = await getEmails(params);
        break;
        
      case 'thunderbird_accounts':
        result = await getAccounts();
        break;
        
      default:
        error = `Unknown method: ${method}`;
    }
    
    console.log(`Thunderbolt Bridge: Method ${method} completed successfully:`, result);
  } catch (err) {
    error = err.message || 'Unknown error';
    console.error(`Thunderbolt Bridge: Error handling ${method}:`, err);
  }
  
  // Send response
  const response = {
    type: 'response',
    id,
    result,
    error
  };
  
  console.log(`Thunderbolt Bridge: Sending response for ${method}:`, response);
  
  if (websocket?.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(response));
    console.log('Thunderbolt Bridge: Response sent successfully');
  } else {
    console.error('Thunderbolt Bridge: WebSocket not open, cannot send response');
  }
}

// Get contacts from Thunderbird
async function getContacts(params) {
  try {
    const { query } = params || {};
    console.log('Thunderbolt Bridge: Getting contacts with params:', params);
    
    const books = await browser.addressBooks.list();
    console.log('Thunderbolt Bridge: Found address books:', books.length);
    
    const allContacts = [];
    
    for (const book of books) {
      const contacts = await browser.contacts.list(book.id);
      console.log(`Thunderbolt Bridge: Found ${contacts.length} contacts in ${book.name}`);
      
      for (const contact of contacts) {
        // Filter by query if provided
        if (query) {
          const searchString = `${contact.properties.DisplayName || ''} ${contact.properties.PrimaryEmail || ''}`.toLowerCase();
          if (!searchString.includes(query.toLowerCase())) {
            continue;
          }
        }
        
        allContacts.push({
          id: contact.id,
          name: contact.properties.DisplayName || 'Unknown',
          email: contact.properties.PrimaryEmail || '',
          addressBook: book.name
        });
      }
    }
    
    console.log(`Thunderbolt Bridge: Returning ${allContacts.length} contacts`);
    return allContacts;
  } catch (error) {
    console.error('Thunderbolt Bridge: Error getting contacts:', error);
    throw new Error(`Failed to get contacts: ${error.message}`);
  }
}

// Get emails from Thunderbird
async function getEmails(params) {
  try {
    const { folder = 'INBOX', limit = 50 } = params || {};
    console.log('Thunderbolt Bridge: Getting emails with params:', params);
    
    const accounts = await browser.accounts.list();
    console.log('Thunderbolt Bridge: Found accounts:', accounts.length);
    
    const allMessages = [];
    
    for (const account of accounts) {
      if (account.type !== 'imap' && account.type !== 'pop3') {
        console.log(`Thunderbolt Bridge: Skipping account ${account.name} (type: ${account.type})`);
        continue;
      }
      
      console.log(`Thunderbolt Bridge: Processing account ${account.name} (type: ${account.type})`);
      
      const folders = await browser.folders.list(account.id);
      const targetFolder = folders.find(f => f.name === folder || f.path === `/${folder}`);
      
      if (targetFolder) {
        console.log(`Thunderbolt Bridge: Found target folder: ${targetFolder.path}`);
        const messageList = await browser.messages.list(targetFolder.id);
        const messages = messageList.messages.slice(0, limit);
        console.log(`Thunderbolt Bridge: Processing ${messages.length} messages from ${targetFolder.path}`);
        
        for (const msg of messages) {
          try {
            const full = await browser.messages.getFull(msg.id);
            
            allMessages.push({
              id: msg.id,
              subject: msg.subject || 'No Subject',
              from: msg.author || 'Unknown',
              date: msg.date || new Date(),
              folder: targetFolder.path,
              account: account.name,
              body: extractBody(full)
            });
          } catch (msgError) {
            console.warn(`Thunderbolt Bridge: Error processing message ${msg.id}:`, msgError);
          }
        }
      } else {
        console.log(`Thunderbolt Bridge: Folder '${folder}' not found in account ${account.name}`);
      }
    }
    
    console.log(`Thunderbolt Bridge: Returning ${allMessages.length} messages`);
    return allMessages;
  } catch (error) {
    console.error('Thunderbolt Bridge: Error getting emails:', error);
    throw new Error(`Failed to get emails: ${error.message}`);
  }
}

// Get email accounts from Thunderbird
async function getAccounts() {
  try {
    console.log('Thunderbolt Bridge: Getting accounts');
    
    const accounts = await browser.accounts.list();
    console.log(`Thunderbolt Bridge: Found ${accounts.length} accounts`);
    
    const result = accounts.map(account => ({
      id: account.id,
      name: account.name || 'Unknown Account',
      type: account.type || 'unknown',
      identities: account.identities || []
    }));
    
    console.log('Thunderbolt Bridge: Returning accounts:', result);
    return result;
  } catch (error) {
    console.error('Thunderbolt Bridge: Error getting accounts:', error);
    throw new Error(`Failed to get accounts: ${error.message}`);
  }
}

// Extract body from message parts
function extractBody(messagePart) {
  try {
    if (messagePart.body) {
      return messagePart.body;
    }
    
    if (messagePart.parts && Array.isArray(messagePart.parts)) {
      for (const part of messagePart.parts) {
        const body = extractBody(part);
        if (body) {
          return body;
        }
      }
    }
    
    return '';
  } catch (error) {
    console.warn('Thunderbolt Bridge: Error extracting message body:', error);
    return '';
  }
}

// Update extension icon based on connection status
function updateIcon(status) {
  let path;
  
  switch (status) {
    case 'connected':
      path = {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png'
      };
      break;
      
    case 'error':
    case 'disconnected':
    default:
      // TODO: Create grayed out versions of icons
      path = {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png'
      };
  }
  
  browser.browserAction.setIcon({ path });
}

// Handle messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse({
        status: connectionStatus,
        enabled: isEnabled
      });
      break;
      
    case 'setEnabled':
      isEnabled = request.enabled;
      browser.storage.local.set({ enabled: isEnabled });
      
      if (isEnabled) {
        connect();
      } else {
        disconnect();
      }
      
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true;
});