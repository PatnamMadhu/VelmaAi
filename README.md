# AI Interview Assistant

A full-stack real-time AI assistant that helps users prepare for job interviews using voice input, context awareness, and streaming AI responses.

## Features

- 🎤 **Voice Input**: Real-time speech recognition using Web Speech API
- 📝 **Context Awareness**: Upload resume, notes, or context for personalized responses  
- 🤖 **AI-Powered**: Uses Groq API (Mixtral) for fast, intelligent responses
- ⚡ **Real-time Streaming**: WebSocket-based streaming responses (<1 second latency)
- 🧠 **Memory Management**: Maintains conversation history (last 10 exchanges)
- 💬 **Chat Interface**: Clean, modern chat UI with voice/text indicators

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- Web Speech API for voice recognition
- WebSocket client for real-time streaming
- TanStack Query for state management

### Backend
- Node.js + Express
- WebSocket (ws) for real-time communication
- Groq API integration for AI responses
- In-memory storage for session data
- CORS-enabled for local development

## Quick Start

### Prerequisites
- Node.js 18+ 
- Groq API key (get one at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd ai-interview-assistant
npm install
