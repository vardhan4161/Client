# Recruiter Platform - Production Deployment Guide

## 1. Prerequisites

- **Node.js**: v18+
- **MongoDB**: v5.0+ (or MongoDB Atlas)
- **Nginx** (optional, for reverse proxy)
- **PM2** (for process management)

## 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hire_db
# Or for Atlas: mongodb+srv://<user>:<password>@cluster.mongodb.net/hire_db
JWT_SECRET=your_strong_secret_key_here
CLIENT_URL=http://your-domain.com
UPLOAD_DIR=./uploads
```

## 3. Database Setup

1. Install MongoDB Community Edition (or use MongoDB Atlas)
2. Verify connection:
   ```bash
   mongosh
   ```
   *Note: The application will automatically create the collections (users, jobs, applications) on first run via Mongoose.*

## 4. Backend Deployment

1. Navigate to server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install --production
   ```
3. Start with PM2:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "hire-api"
   ```

## 5. Frontend Deployment

1. Navigate to client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Serve the `dist` folder using a static file server (e.g., Nginx, Serve):
   ```bash
   npm install -g serve
   pm2 start serve --name "hire-client" -- -s dist -l 5173
   ```

## 6. Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
