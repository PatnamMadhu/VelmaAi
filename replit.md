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
- June 16, 2025. Voice input enhancement, AI response optimization, and layout fixes
  * Implemented advanced voice input filtering to prevent repeated/partial phrase capture
  * Added anti-repetition tracking with lastTranscript comparison and debouncing
  * Filters out duplicate, substring, and progressive repetitions ("Intro" → "Introduce")
  * Added 300ms debounce delay and 500ms cooldown between accepted inputs
  * Smart filtering for word repetition patterns and short fragments
  * Updated AI system prompt for natural, confident interview-style responses
  * Responses now sound like experienced software engineer explaining their experience
  * Uses short paragraphs, bullet points, and 60-90 second speaking length
  * Avoids robotic definitions, focuses on practical real-world applications
  * Fixed critical input visibility issue using absolute positioning
  * Redesigned FloatingAssistant with compact bottom input area
  * Combined voice and text input into single streamlined interface
  * Maximized chat response area height for better readability
  * Improved color contrast and visibility throughout interface
  * Fixed voice input text accumulation issue for fresh sessions
  * Resolved React state update loop causing rendering errors
- June 14, 2025. Complete UI redesign with futuristic elegant theme
  * Replaced Velari dark theme with sophisticated futuristic design
  * Updated color palette: #0A0A0F background, #7C3AED/EC4899 gradients, #00D9FF accent
  * Enhanced visual effects with neon glows and advanced glassmorphism
  * Redesigned all components: FloatingAssistant, ChatWindow, FloatingMicButton, Home page
  * Improved typography with gradient text effects and enhanced animations
- June 13, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```