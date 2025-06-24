# AnmaAI - AI Interview Assistant

AnmaAI is a full-stack real-time AI assistant specialized in technical interview preparation. It features responsive design, voice input capabilities, and runs as both a web application and native desktop app.

## Features

- **Real-time Voice Input**: Web Speech API integration for natural conversation
- **Floating AI Assistant**: Draggable, resizable interface for seamless interaction
- **Streaming Responses**: Sub-1-second AI response delivery with Groq/Llama models
- **Unlimited Context**: Add resumes, job descriptions, and background information
- **Cross-Platform**: Available as web app and native desktop application
- **Mobile Responsive**: Touch-friendly interface for all devices

## Prerequisites

Before running AnmaAI locally, ensure you have:

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd velari-ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Frontend dependencies (React, Vite, TailwindCSS)
- Backend dependencies (Express, WebSocket support)
- Desktop app dependencies (Electron)

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# Required: Groq API Key for AI responses
GROQ_API_KEY=your_groq_api_key_here

# Optional: OpenAI API Key (fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Development settings
NODE_ENV=development
PORT=5000
```

#### Getting API Keys

**Groq API Key (Required):**
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**OpenAI API Key (Optional):**
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new secret key
5. Copy the key to your `.env` file

## Running the Application

### Web Version (Recommended for Development)

Start the development server:

```bash
npm run dev
```

The application will be available at:
- **Web Interface**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/*

### Desktop Version

#### Quick Start

**Windows:**
```bash
start-desktop.bat
```

**macOS/Linux:**
```bash
./start-desktop.sh
```

#### Manual Desktop Start

1. Start the server:
```bash
npm run dev
```

2. In a new terminal, start the desktop app:
```bash
npx electron .
```

## Project Structure

```
velari-ai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── ui/         # UI component library
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configuration
│   └── index.html          # Main HTML file
├── server/                 # Backend Node.js/Express server
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
├── components.json         # UI components configuration
├── desktop-start.js        # Desktop app launcher script
├── start-desktop.sh        # Linux/macOS startup script
├── start-desktop.bat       # Windows startup script
├── electron-builder.json   # Electron build configuration
├── drizzle.config.ts       # Database configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run check        # Type checking with TypeScript
```

### Desktop App
```bash
npx electron .       # Start desktop app (requires running server)
npm run pack         # Package desktop app for current platform
npm run dist         # Build distributable desktop app
```

### Production
```bash
npm run build        # Build for production
npm start           # Start production server
```

## Usage

### 1. Basic Chat Interface

1. Navigate to http://localhost:5000
2. Click the floating microphone button or "Open Assistant"
3. Use voice input or type messages
4. Receive real-time AI responses

### 2. Adding Background Context

1. Click the gear icon in the floating assistant
2. Select "Add Background Context"
3. Paste your resume, job description, or interview notes
4. Save the context for personalized responses

### 3. Voice Input

1. Click the microphone button
2. Allow microphone permissions when prompted
3. Speak clearly into your microphone
4. The AI will respond based on your spoken input

## Configuration

### Server Configuration

Edit `server/index.ts` to modify:
- Port number (default: 5000)
- CORS settings
- WebSocket configuration

### AI Model Configuration

Edit `server/services/groqService.ts` to adjust:
- Model selection (default: llama-3.1-8b-instant)
- Response timeout (default: 800ms)
- Temperature and other parameters

### Frontend Configuration

Edit `client/src/lib/queryClient.ts` to modify:
- API request settings
- Query configurations

## Troubleshooting

### Common Issues

**1. Server won't start**
```bash
# Check if port 5000 is in use
lsof -i :5000          # macOS/Linux
netstat -ano | find "5000"  # Windows

# Use a different port
PORT=3000 npm run dev
```

**2. API Key errors**
- Verify your `.env` file exists and contains valid API keys
- Check that the API key has sufficient credits/quota
- Ensure no extra spaces or quotes around the API key

**3. Voice input not working**
- Check browser microphone permissions
- Ensure you're using HTTPS or localhost (required for Web Speech API)
- Try a different browser (Chrome/Edge recommended)

**4. Desktop app won't start**
```bash
# Check Electron installation
npx electron --version

# Reinstall Electron if needed
npm install electron --save-dev
```

**5. Build failures**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
```

### Development Issues

**Hot reload not working:**
- Restart the development server
- Check for TypeScript errors in the console

**WebSocket connection issues:**
- Ensure both frontend and backend are running
- Check browser developer tools for WebSocket errors

## Browser Compatibility

### Supported Browsers
- **Chrome/Chromium** 88+ (Recommended)
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

### Required Features
- WebSocket support
- Web Speech API (for voice input)
- ES2020+ JavaScript features

## Performance Optimization

### For Development
- Use Chrome DevTools for debugging
- Monitor WebSocket connections in Network tab
- Check memory usage with React DevTools

### For Production
- Build with `npm run build` for optimized bundle
- Enable gzip compression on your server
- Use CDN for static assets

## Security Considerations

- API keys are stored server-side only
- Frontend cannot access Node.js APIs directly
- WebSocket connections use secure protocols
- Content Security Policy implemented

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## API Documentation

### Endpoints

**POST /api/chat**
- Send messages to AI assistant
- Supports voice and text input
- Returns streaming responses via WebSocket

**POST /api/context**
- Save background context
- Used for personalizing AI responses

**WebSocket /ws**
- Real-time communication
- Streaming response delivery
- Session management

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review the code comments and documentation
3. Open an issue on the repository

---

**Quick Start Summary:**
1. Install Node.js 18+
2. Clone repository and run `npm install`
3. Get Groq API key from console.groq.com
4. Create `.env` file with your API key
5. Run `npm run dev`
6. Open http://localhost:5000