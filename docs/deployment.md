# Deployment Guide - Recruiter Hiring Platform

## Prerequisites
- PostgreSQL database (local or cloud)
- Node.js runtime environment
- Domain name (optional)
- SSL certificate (for HTTPS)

## Environment Setup

### Backend Environment Variables
Create `.env` file in `server/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/hire_db
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=production
UPLOAD_DIR=./uploads
```

### Frontend Environment Variables
Create `.env.production` file in `client/` directory:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### 1. Create Dockerfile for Backend
`server/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

#### 2. Create Dockerfile for Frontend
`client/Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: hire_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./server
    restart: always
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/hire_db
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads

  frontend:
    build: ./client
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads:
```

#### 4. Deploy
```bash
docker-compose up -d
```

### Option 2: Cloud Platform Deployment

#### Heroku

**Backend:**
```bash
cd server
heroku create hire-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

**Frontend:**
```bash
cd client
npm run build
# Deploy dist/ folder to Netlify or Vercel
```

#### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Install dependencies:
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql nginx
```

3. Clone repository and setup
4. Configure Nginx as reverse proxy
5. Setup PM2 for process management:
```bash
npm install -g pm2
pm2 start server/index.js --name hire-backend
pm2 startup
pm2 save
```

#### Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
cd client
vercel --prod
```

**Backend (Railway):**
1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy automatically

## Database Migration

### Initial Setup
```bash
psql $DATABASE_URL -f server/db/schema.sql
```

### Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        root /var/www/hire/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Log Files
- Backend logs: `pm2 logs hire-backend`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Implement rate limiting
- [ ] Set up monitoring alerts

## Performance Optimization

1. **Database Indexing**: Already configured in schema.sql
2. **Caching**: Consider Redis for session management
3. **CDN**: Use CloudFlare for static assets
4. **Compression**: Enable gzip in Nginx
5. **Load Balancing**: Use multiple backend instances

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Shared PostgreSQL database
- Centralized file storage (S3, CloudStorage)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database read replicas

## Troubleshooting

### Backend won't start
- Check DATABASE_URL connection
- Verify PostgreSQL is running
- Check port 5000 availability

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS configuration
- Ensure backend is accessible

### Database connection errors
- Verify credentials
- Check network connectivity
- Ensure database exists

## Post-Deployment Validation

1. **Health Check**: `curl http://your-domain/health`
2. **Register Test User**: Create recruiter account
3. **Create Test Job**: Verify job creation
4. **Test Application Flow**: Complete chatbot as candidate
5. **Upload Resume**: Test file upload
6. **Review Candidates**: Check dashboard functionality

## Rollback Plan

```bash
# Revert to previous version
docker-compose down
git checkout <previous-commit>
docker-compose up -d
```

## Support & Maintenance

- Monitor error logs daily
- Update dependencies monthly
- Database backups: Daily
- Security patches: As needed
- Performance review: Quarterly

---

**Deployment completed successfully!** 🚀
