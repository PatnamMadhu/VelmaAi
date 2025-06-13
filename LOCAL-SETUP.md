# VelariAI Local Setup Guide

Complete step-by-step instructions for running VelariAI on your local machine.

## System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Node.js**: Version 18.0.0 or higher
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: At least 1GB free space
- **Browser**: Chrome 88+, Firefox 85+, Safari 14+, or Edge 88+

## Quick Setup (5 minutes)

### 1. Download and Install Node.js

Visit [nodejs.org](https://nodejs.org/) and download the LTS version for your operating system.

**Windows/macOS**: Run the installer and follow the setup wizard.

**Ubuntu/Debian**:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation**:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

### 2. Get the Source Code

**Option A: Download ZIP**
1. Download the project ZIP file
2. Extract to your desired folder
3. Open terminal/command prompt in that folder

**Option B: Clone with Git**
```bash
git clone https://github.com/yourusername/velari-ai.git
cd velari-ai
```

### 3. Install Dependencies

```bash
npm install
```

This downloads all required packages (~200MB). Wait for completion.

### 4. Get Your API Key

1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up with your email (free account available)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the generated key

### 5. Configure Environment

Create a `.env` file in the project root:

**Windows** (using Notepad):
```
echo GROQ_API_KEY=your_api_key_here > .env
```

**macOS/Linux**:
```bash
echo "GROQ_API_KEY=your_api_key_here" > .env
```

Replace `your_api_key_here` with your actual Groq API key.

### 6. Start the Application

```bash
npm run dev
```

You should see:
```
[express] serving on port 5000
```

Open your browser and go to: **http://localhost:5000**

## Detailed Setup Instructions

### Prerequisites Verification

Run these commands to verify your system:

```bash
# Check Node.js version (must be 18+)
node --version

# Check npm version
npm --version

# Check available memory
# Windows:
systeminfo | find "Total Physical Memory"
# macOS:
sysctl hw.memsize
# Linux:
free -h

# Check available disk space
# Windows:
dir
# macOS/Linux:
df -h .
```

### Environment Configuration

#### Complete .env File Example

Create `.env` with these contents:

```env
# Required
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# Optional (with defaults)
NODE_ENV=development
PORT=5000
LOG_LEVEL=info

# Performance settings
AI_TIMEOUT=800
AI_MAX_TOKENS=200
AI_TEMPERATURE=0.5
```

#### Advanced Configuration

For development with additional features:

```env
# Development settings
DEV_HMR=true
DEV_OPEN_BROWSER=false
LOG_REQUESTS=true

# Security settings
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=60
SESSION_SECRET=your_random_secret_string_here

# Desktop app settings
APP_NAME=VelariAI
APP_VERSION=1.0.0
```

### Running Different Versions

#### Web Version Only
```bash
npm run dev
```
Access at: http://localhost:5000

#### Desktop App Version

**Quick start** (Windows):
```bash
start-desktop.bat
```

**Quick start** (macOS/Linux):
```bash
chmod +x start-desktop.sh
./start-desktop.sh
```

**Manual start**:
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Start desktop app
npx electron .
```

### Development Workflow

#### File Structure Overview

```
velari-ai/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── ui/         # UI component library
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configuration
│   └── index.html          # Main HTML file
├── server/                 # Backend (Node.js + Express)
│   ├── services/           # Business logic services
│   ├── index.ts            # Main server file
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite development server
├── electron/               # Desktop app configuration
│   ├── main.js             # Electron main process
│   ├── preload.js          # Security bridge
│   └── assets/             # Desktop app assets
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas and types
├── desktop-start.js        # Desktop app launcher script
├── start-desktop.sh        # Linux/macOS startup script
├── start-desktop.bat       # Windows startup script
├── electron-builder.json   # Electron build configuration
├── .env                    # Your environment variables
└── package.json            # Project configuration
```

#### Making Changes

1. **Frontend changes**: Edit files in `client/src/`
2. **Backend changes**: Edit files in `server/`
3. **Desktop changes**: Edit files in `electron/`

Hot reload is enabled - changes appear automatically.

#### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Run production build
npm run check       # Type checking
npx electron .      # Start desktop app
```

## Platform-Specific Instructions

### Windows Setup

#### Using PowerShell (Recommended)

1. Open PowerShell as Administrator
2. Enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. Install Node.js via Chocolatey (optional):
```powershell
# Install Chocolatey first
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs
```

4. Continue with standard setup

#### Using Command Prompt

1. Download Node.js installer from nodejs.org
2. Run installer with default settings
3. Open new Command Prompt
4. Continue with standard setup

#### Common Windows Issues

**Error: 'npm' is not recognized**
- Close and reopen Command Prompt/PowerShell
- Or manually add Node.js to PATH environment variable

**Permission errors**
- Run Command Prompt as Administrator
- Or use PowerShell with elevated permissions

### macOS Setup

#### Using Terminal

1. Install Homebrew (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install Node.js:
```bash
brew install node
```

3. Continue with standard setup

#### Alternative: Direct Download

1. Download macOS installer from nodejs.org
2. Run .pkg installer
3. Continue with standard setup

#### Common macOS Issues

**Xcode command line tools required**
```bash
xcode-select --install
```

**Permission issues with npm**
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Linux Setup

#### Ubuntu/Debian

```bash
# Update package index
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### CentOS/RHEL/Fedora

```bash
# Enable NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo dnf install nodejs npm
# or for older versions: sudo yum install nodejs npm
```

#### Arch Linux

```bash
sudo pacman -S nodejs npm
```

#### Common Linux Issues

**Permission errors**
```bash
# Create npm directory
mkdir ~/.npm-global

# Configure npm
npm config set prefix '~/.npm-global'

# Add to PATH in ~/.bashrc or ~/.zshrc
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## Troubleshooting

### Installation Issues

**Node.js version too old**
```bash
# Check current version
node --version

# If less than v18, update Node.js
# Windows: Download new installer
# macOS: brew upgrade node
# Linux: Follow NodeSource instructions
```

**npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Disk space issues**
```bash
# Check space
df -h    # Linux/macOS
dir      # Windows

# Clean npm cache
npm cache clean --force

# Clear temporary files
# Windows: Delete %TEMP% contents
# macOS/Linux: rm -rf /tmp/*
```

### Runtime Issues

**Port 5000 already in use**
```bash
# Check what's using port 5000
# Windows:
netstat -ano | findstr :5000
# macOS/Linux:
lsof -i :5000

# Use different port
PORT=3000 npm run dev
```

**API key errors**
```bash
# Verify .env file exists
ls -la .env     # macOS/Linux
dir .env        # Windows

# Check file contents (hide sensitive data)
head .env

# Regenerate API key if needed
```

**Voice input not working**
- Use Chrome or Edge browser
- Ensure microphone permissions granted
- Use HTTPS or localhost only
- Check browser console for errors

**Desktop app won't start**
```bash
# Check Electron installation
npx electron --version

# Reinstall if needed
npm install electron --save-dev

# Clear Electron cache
npx electron-rebuild
```

### Performance Issues

**Slow loading**
- Check internet connection
- Verify API key has quota remaining
- Monitor browser developer tools Network tab

**High memory usage**
- Restart the development server
- Check for memory leaks in browser DevTools
- Close unnecessary browser tabs

**WebSocket disconnections**
- Check firewall settings
- Verify antivirus isn't blocking connections
- Try disabling browser extensions

### Browser Compatibility

**Chrome/Edge (Recommended)**
- Full feature support
- Best voice input performance
- WebSocket stability

**Firefox**
- Good support
- May have voice input limitations
- Update to latest version

**Safari**
- Basic support
- Limited voice features
- macOS/iOS only

## Advanced Configuration

### Custom Ports

```env
# Change server port
PORT=3000

# Update WebSocket configuration
WS_PATH=/websocket
```

### Multiple Environments

Create environment-specific files:

**Development** (`.env.development`):
```env
NODE_ENV=development
LOG_LEVEL=debug
DEV_HMR=true
```

**Production** (`.env.production`):
```env
NODE_ENV=production
LOG_LEVEL=warn
GZIP_ENABLED=true
```

### Performance Tuning

```env
# Faster AI responses
AI_TIMEOUT=500
AI_MAX_TOKENS=150

# More concurrent connections
WS_MAX_CONNECTIONS=50

# Enhanced caching
API_CACHE_DURATION=600
STATIC_CACHE_DURATION=7200
```

## Next Steps

After successful setup:

1. **Test voice input**: Click microphone and speak
2. **Add background context**: Upload resume/job description
3. **Try desktop app**: Run `start-desktop.bat` or `./start-desktop.sh`
4. **Customize settings**: Edit `.env` for your preferences
5. **Explore code**: Review `client/src/` and `server/` directories

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Verify all prerequisites are met
3. Review error messages carefully
4. Search the codebase for similar issues
5. Create detailed issue reports with:
   - Operating system and version
   - Node.js and npm versions
   - Complete error messages
   - Steps to reproduce