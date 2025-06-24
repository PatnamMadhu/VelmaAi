# AnmaAI Deployment Guide

This guide covers deploying AnmaAI to various platforms and environments.

## Local Production Setup

### 1. Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### 2. Environment Configuration

Create a production `.env` file:

```env
NODE_ENV=production
PORT=5000
GROQ_API_KEY=your_production_groq_key
SESSION_SECRET=your_secure_session_secret
HTTPS_ENABLED=true
GZIP_ENABLED=true
```

### 3. Process Management with PM2

Install PM2 for production process management:

```bash
npm install -g pm2
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'velari-ai',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Cloud Deployment

### Vercel (Recommended for Web Version)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**/*",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "GROQ_API_KEY": "@groq-api-key"
  }
}
```

3. Deploy:
```bash
vercel --prod
```

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy on push

### Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

### DigitalOcean Droplet

1. Create Ubuntu 22.04 droplet
2. Install Node.js and PM2:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

3. Clone and setup your application:

```bash
git clone your-repo-url
cd velari-ai
npm install
npm run build
```

4. Configure Nginx as reverse proxy (`/etc/nginx/sites-available/velari-ai`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/velari-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. Setup SSL with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S velari -u 1001

WORKDIR /app

COPY --from=builder --chown=velari:nodejs /app/dist ./dist
COPY --from=builder --chown=velari:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=velari:nodejs /app/package.json ./package.json

USER velari

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  velari-ai:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - GROQ_API_KEY=${GROQ_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - velari-ai
    restart: unless-stopped
```

### Build and run:

```bash
docker-compose up --build -d
```

## Desktop App Distribution

### Building Executables

```bash
# Build for current platform
npm run dist

# Build for specific platforms
npx electron-builder --mac
npx electron-builder --win
npx electron-builder --linux
```

### Code Signing (Production)

1. **macOS**: Get Apple Developer certificate
2. **Windows**: Get code signing certificate
3. **Linux**: Use GPG signing

Update `electron-builder.json`:

```json
{
  "afterSign": "scripts/notarize.js",
  "mac": {
    "hardenedRuntime": true,
    "entitlements": "assets/entitlements.mac.plist",
    "entitlementsInherit": "assets/entitlements.mac.plist"
  },
  "win": {
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "password"
  }
}
```

### Auto-Updates

Set up update server and configure in `electron/main.js`:

```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug
DEV_HMR=true
```

### Staging
```env
NODE_ENV=staging
PORT=5000
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

### Production
```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=warn
HTTPS_ENABLED=true
GZIP_ENABLED=true
RATE_LIMIT_ENABLED=true
```

## Monitoring and Logging

### Application Monitoring

Add health check endpoint in `server/routes.ts`:

```typescript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});
```

### Log Management

For production logging, use Winston:

```bash
npm install winston
```

### Performance Monitoring

Integrate with services like:
- Sentry for error tracking
- New Relic for performance monitoring
- DataDog for infrastructure monitoring

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure session secrets
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Input validation and sanitization
- [ ] CSP headers configured

## Backup Strategy

### Database Backups (if using persistent storage)
```bash
# PostgreSQL example
pg_dump -h localhost -U username database_name > backup.sql
```

### Application Backups
```bash
# Backup application files
tar -czf velari-ai-backup-$(date +%Y%m%d).tar.gz /path/to/velari-ai
```

## Performance Optimization

### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement service workers for caching
- Optimize images and fonts

### Backend Optimization
- Use clustering for multiple CPU cores
- Implement Redis for session storage
- Database connection pooling
- API response caching

## Troubleshooting Deployment Issues

### Common Problems

1. **Port conflicts**: Change PORT in .env
2. **Memory issues**: Increase server memory limits
3. **SSL certificate errors**: Check certificate validity
4. **CORS errors**: Verify ALLOWED_ORIGINS configuration
5. **WebSocket connection failures**: Check proxy configuration

### Debug Commands

```bash
# Check application status
pm2 status
pm2 logs

# Check system resources
top
df -h
free -m

# Check network connections
netstat -tlnp | grep :5000

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session sharing with Redis
- Database clustering
- CDN implementation

### Vertical Scaling
- CPU and memory optimization
- Database performance tuning
- Connection pooling
- Caching strategies