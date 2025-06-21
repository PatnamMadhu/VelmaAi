# VelariAI - Real-time AI Interview Assistant

## Overview

VelariAI is a full-stack real-time AI interview assistant designed to help users prepare for technical interviews. The application combines voice recognition, AI-powered responses, and contextual information management to provide an interactive interview preparation experience. It's built as both a web application and a native desktop app using Electron.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Radix UI components with Tailwind CSS for responsive design
- **State Management**: React hooks with TanStack Query for server state
- **Voice Integration**: Web Speech API for real-time voice recognition
- **Desktop Support**: Electron wrapper for native desktop experience

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety
- **WebSocket**: Real-time streaming communication for AI responses
- **Session Management**: In-memory session handling with optional database persistence
- **API Design**: RESTful endpoints with WebSocket streaming for chat functionality

### Data Storage Solutions
- **Database**: Drizzle ORM configured for PostgreSQL (with in-memory fallback)
- **Schema**: Message history, context storage, and session management
- **Storage Strategy**: Memory-first with database persistence for production

### Authentication and Authorization
- **Session-based**: Express sessions with configurable timeout
- **Security**: CORS configuration and environment-based security settings
- **No Complex Auth**: Simplified session management for interview preparation use case

### External Service Integrations
- **Primary AI Service**: Groq API with Llama 3.1 8B model for sub-second responses
- **Fallback AI Service**: OpenAI API as secondary option
- **Voice Recognition**: Browser-native Web Speech API
- **Technical Terms Correction**: Custom mapping for interview-specific terminology

## Key Components

### FloatingAssistant
Draggable, resizable chat interface that provides the main interaction point. Features include:
- Real-time streaming responses
- Voice input with visual feedback
- Context management interface
- Resizable and persistent positioning

### Voice Recognition System
- Real-time speech-to-text conversion
- Technical term correction for interview terminology
- Visual feedback for recording state
- Automatic punctuation and capitalization

### Context Management
- Background information storage (resumes, job descriptions)
- Session-based context retrieval
- Unlimited context capacity for personalized responses

### Streaming Response System
- WebSocket-based real-time communication
- Chunked response delivery for sub-second initial responses
- Error handling and connection management

### Desktop Integration
- Electron wrapper with native window controls
- Platform-specific optimizations
- Enhanced UI for desktop usage
- System notifications and menu integration

## Data Flow

1. **User Input**: Voice or text input captured through React components
2. **Processing**: Speech recognition converts voice to text with technical term correction
3. **Context Retrieval**: Session context and recent message history fetched
4. **AI Request**: Message sent to Groq API with context and conversation history
5. **Streaming Response**: AI response streamed back through WebSocket connection
6. **UI Update**: Real-time updates to chat interface with streaming text
7. **Storage**: Messages and context stored for session continuity

## External Dependencies

### Core Runtime
- Node.js 18+ for server runtime
- Electron for desktop application wrapper

### AI Services
- Groq API (primary) - Ultra-fast Llama model responses
- OpenAI API (fallback) - Alternative AI service

### Database
- PostgreSQL for production data persistence
- Drizzle ORM for type-safe database operations

### Frontend Libraries
- React ecosystem with TypeScript
- Radix UI for accessible components
- Tailwind CSS for responsive styling
- TanStack Query for server state management

## Deployment Strategy

### Development
- Vite dev server for hot module replacement
- Concurrent server and client development
- Memory-based storage for rapid iteration

### Production
- Static build generation with Vite
- Express server for API and static file serving
- Database migrations with Drizzle
- Environment-based configuration

### Desktop Distribution
- Electron packaging for multiple platforms
- Native installers for Windows, macOS, and Linux
- Auto-updater integration capability

### Cloud Deployment
- Replit-optimized configuration
- Auto-scaling deployment target
- Environment variable management
- CORS and security configurations

## Changelog

```
Changelog:
- June 13, 2025. Initial setup
- January 22, 2025. Enhanced voice recognition accuracy with comprehensive technical term mapping
- January 22, 2025. Implemented editable voice transcript with manual correction capability
- January 22, 2025. Improved AI response quality with better formatting and reduced incomplete responses
- January 22, 2025. Added extended listening timeouts and auto-restart functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```