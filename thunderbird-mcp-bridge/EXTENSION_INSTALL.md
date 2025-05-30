# Thunderbolt Bridge Extension Installation Guide

## Prerequisites

1. Thunderbird must be running
2. The Thunderbolt WebSocket server must be running on port 9001

## Installation Steps

### Method 1: Install from XPI file
1. Open Thunderbird
2. Go to **Tools > Add-ons and Themes** (or press `Ctrl+Shift+A`)
3. Click the gear icon (⚙️) in the top-right corner
4. Select **Install Add-on From File...**
5. Navigate to `dist/thunderbolt-bridge.xpi` and select it
6. Click **Add** when prompted
7. Restart Thunderbird if required

### Method 2: Developer Installation
1. Open Thunderbird
2. Go to **Tools > Add-ons and Themes**
3. Click the gear icon (⚙️) in the top-right corner
4. Select **Debug Add-ons**
5. Click **Load Temporary Add-on**
6. Navigate to the `bridge/` folder and select `manifest.json`

## Verification

1. After installation, you should see a "Thunderbolt Bridge" icon in the toolbar
2. Click the icon to open the popup
3. Toggle "Enable Bridge" to ON
4. The status should show "Connected to Thunderbolt"

## Troubleshooting

### Extension not visible
- Check that the extension is enabled in Add-ons and Themes
- Restart Thunderbird
- Check the Browser Console for errors (Tools > Developer Tools > Browser Console)

### Connection issues
- Verify the WebSocket server is running: `lsof -i :9001`
- Check firewall settings for localhost connections
- Look for errors in the Browser Console

### Permission issues
- The extension requires access to:
  - Email accounts and messages
  - Address books and contacts
  - Local storage
  - Localhost connections

## Browser Console Debugging

To debug connection issues:
1. Open **Tools > Developer Tools > Browser Console**
2. Look for messages starting with "Thunderbolt Bridge:"
3. Check for WebSocket connection errors
4. Verify that the extension is loading properly

## Current Status Check

To verify the connection is working:
1. Open the Thunderbolt app
2. Check the status in Settings > Thunderbolt Bridge
3. Look for:
   - ✅ **Thunderbird Connection: Connected**
   - ✅ **Overall Status: Ready**