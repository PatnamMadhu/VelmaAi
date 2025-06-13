const { spawn } = require('child_process');
const path = require('path');

// Start the server first
console.log('Starting VelariAI server...');
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait for server to be ready and then start Electron
setTimeout(() => {
  console.log('Starting VelariAI desktop app...');
  const electron = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electron.on('close', () => {
    console.log('Desktop app closed, stopping server...');
    server.kill();
    process.exit(0);
  });
}, 3000);

server.on('close', () => {
  console.log('Server stopped');
  process.exit(0);
});