# VelariAI Desktop Application

VelariAI is now available as both a web application and a native desktop app built with Electron. The desktop version provides enhanced features while maintaining full compatibility with the web version.

## Features

### Desktop-Specific Features
- **Native Window Controls**: Custom minimize, maximize, and close buttons
- **Drag-to-Move**: Draggable title bar for easy window positioning
- **Desktop Notifications**: System-level notifications for important events
- **Enhanced UI**: Desktop-optimized interface with status indicators
- **Platform Integration**: Native menu bar and keyboard shortcuts

### Shared Features (Web & Desktop)
- **Voice Input**: Real-time speech recognition via Web Speech API
- **AI Assistant**: Floating, draggable assistant with streaming responses
- **Context Integration**: Unlimited background context for personalized responses
- **Sub-1-Second Responses**: Optimized for fast AI interaction
- **Responsive Design**: Works across all screen sizes

## Running the Desktop App

### Quick Start

**Windows:**
```bash
start-desktop.bat
```

**macOS/Linux:**
```bash
./start-desktop.sh
```

### Manual Start
1. Start the server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the desktop app:
   ```bash
   npx electron .
   ```

### Development Mode
Both web and desktop versions run simultaneously:
- Web version: http://localhost:5000
- Desktop app: Electron window with enhanced features

## Building for Distribution

### Development Build
```bash
npm run pack
```

### Production Build
```bash
npm run dist
```

This creates installers for:
- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg` file (Universal binary)
- **Linux**: `.AppImage` file

## Architecture

The desktop app uses a hybrid approach:
- **Web Core**: Same React frontend and Node.js backend
- **Desktop Wrapper**: Electron shell with native features
- **Smart Detection**: Automatically enables desktop features when running in Electron
- **Seamless Integration**: No code duplication between web and desktop versions

## File Structure

```
├── electron/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Security bridge
│   └── assets/          # Desktop icons and resources
├── client/src/components/
│   └── DesktopWrapper.tsx  # Desktop-specific UI enhancements
├── start-desktop.sh     # Linux/macOS startup script
├── start-desktop.bat    # Windows startup script
└── electron-builder.json  # Build configuration
```

## Security

The desktop app follows Electron security best practices:
- **Context Isolation**: Renderer process is isolated from Node.js
- **No Node Integration**: Web content cannot access Node.js APIs directly
- **Preload Scripts**: Secure communication bridge between processes
- **Content Security Policy**: Prevents XSS and code injection

## Keyboard Shortcuts

- **Cmd/Ctrl + R**: Reload application
- **Cmd/Ctrl + Shift + I**: Toggle Developer Tools
- **Cmd/Ctrl + M**: Minimize window
- **Cmd/Ctrl + W**: Close window

## Troubleshooting

### Common Issues

1. **Server not starting**: Ensure port 5000 is available
2. **Desktop app won't open**: Check Node.js and Electron installation
3. **Voice input not working**: Verify microphone permissions

### Development Issues

1. **Hot reload not working**: Restart both server and desktop app
2. **Build failures**: Clear `dist/` and `node_modules/`, then reinstall
3. **Icon not showing**: Ensure icon files exist in `electron/assets/`

## Differences from Web Version

| Feature | Web Version | Desktop Version |
|---------|-------------|-----------------|
| Window Controls | Browser-native | Custom controls |
| Notifications | Browser notifications | System notifications |
| Dragging | Limited to floating components | Full window dragging |
| Menu Bar | None | Native application menu |
| Installation | None required | Installable executable |
| Updates | Instant | Requires app update |

The desktop version maintains 100% feature parity with the web version while adding native desktop capabilities.