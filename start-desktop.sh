#!/bin/bash

echo "Starting VelariAI Desktop Application..."
echo ""

# Start the server in background
echo "Starting server..."
npm run dev &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to initialize..."
sleep 5

# Start Electron
echo "Starting desktop app..."
NODE_ENV=development npx electron .

# Clean up
echo ""
echo "Desktop application closed. Stopping server..."
kill $SERVER_PID 2>/dev/null

echo "Done."