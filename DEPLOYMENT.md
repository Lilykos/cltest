# Deployment Guide

This guide covers deploying the Nutrition Assistant application to production.

## Pre-Deployment Checklist

- [ ] Have API keys ready (LLM provider + Tavily)
- [ ] Choose hosting providers for database, backend, and frontend
- [ ] Set up domain name (optional)
- [ ] Generate production encryption key
- [ ] Generate strong JWT secret

## Production Environment Setup

### 1. Generate Secrets

```bash
# Generate encryption key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Generate JWT secret (any random string)
openssl rand -base64 32
```

Save these securely - you'll need them for environment variables.

## Deployment Option 1: Railway (All-in-One)

**Best for:** Quick deployment, minimal configuration

### Steps:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will provision and connect it automatically

4. **Deploy Backend**
   - Railway auto-detects the `backend/Dockerfile`
   - Add environment variables in Settings:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     REDIS_URL=redis://...  (add Redis service if needed)
     ENCRYPTION_KEY=<your-key>
     JWT_SECRET=<your-secret>
     CORS_ORIGINS=https://your-frontend.vercel.app
     ENVIRONMENT=production
     ```
   - Deploy backend

5. **Deploy Frontend to Vercel**
   - Go to https://vercel.com
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app
     ```
   - Deploy

6. **Update CORS**
   - Go back to Railway backend settings
   - Update `CORS_ORIGINS` with your Vercel URL

## Deployment Option 2: Separate Services

**Best for:** More control, cost optimization

### Database: Supabase

1. Create account at https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Run schema:
   ```bash
   psql "postgresql://..." < db/init.sql
   psql "postgresql://..." < db/seed.sql
   ```

### Database: Neon (Alternative)

1. Create account at https://neon.tech
2. Create new project (free tier available)
3. Get connection string
4. Run schema scripts

### Backend: Render.com

1. Create account at https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   ENCRYPTION_KEY=...
   JWT_SECRET=...
   CORS_ORIGINS=https://your-frontend.vercel.app
   PORT=8000
   ENVIRONMENT=production
   ```
6. Deploy

### Backend: Fly.io (Alternative)

1. Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. Login: `flyctl auth login`
3. Create app:
   ```bash
   cd backend
   flyctl launch
   ```
4. Set environment variables:
   ```bash
   flyctl secrets set DATABASE_URL=postgresql://...
   flyctl secrets set ENCRYPTION_KEY=...
   flyctl secrets set JWT_SECRET=...
   flyctl secrets set CORS_ORIGINS=https://...
   ```
5. Deploy: `flyctl deploy`

### Frontend: Vercel

1. Go to https://vercel.com
2. Import project from GitHub
3. Framework: Next.js (auto-detected)
4. Root Directory: `frontend`
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
6. Deploy

### Frontend: Netlify (Alternative)

1. Go to https://netlify.com
2. Import repository
3. Build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
5. Deploy

## Deployment Option 3: Self-Hosted (VPS)

**Best for:** Full control, privacy

### Requirements:
- Ubuntu 22.04 LTS server
- Docker and Docker Compose installed
- Domain name (optional but recommended)

### Steps:

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/your-username/nutrition-assistant.git
   cd nutrition-assistant
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Update all values, especially:
   - `ENCRYPTION_KEY`
   - `JWT_SECRET`
   - `CORS_ORIGINS=https://your-domain.com`

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Setup Nginx reverse proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/nutrition-assistant
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nutrition-assistant /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment

### 1. Test the Application

- [ ] Can register a new account
- [ ] Can login
- [ ] Can add API keys in settings
- [ ] Can log food using natural language
- [ ] Dashboard shows data correctly
- [ ] Can manually create food items
- [ ] Can update and delete entries

### 2. Monitor Logs

**Railway:**
- View logs in Railway dashboard

**Render:**
- View logs in Render dashboard

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Database Backups

**Automated backups (Railway/Supabase):**
- Enabled by default

**Manual backup:**
```bash
pg_dump -h your-db-host -U username -d nutrition_app > backup_$(date +%Y%m%d).sql
```

**Backup script (cron job):**
```bash
# Add to crontab (daily at 2 AM)
0 2 * * * pg_dump -h host -U user nutrition_app | gzip > /backups/nutrition_$(date +\%Y\%m\%d).sql.gz
```

### 4. Monitoring

**Free monitoring tools:**
- UptimeRobot (uptime monitoring)
- Sentry (error tracking)
- LogRocket (session replay)
- Plausible/Umami (analytics)

### 5. Performance Optimization

**Backend:**
- Enable Redis caching for food lookups
- Add database connection pooling (already configured)
- Use CDN for static assets

**Frontend:**
- Enable Next.js image optimization
- Add service worker for offline support
- Implement lazy loading for charts

**Database:**
- Ensure indexes are created (already in init.sql)
- Monitor slow queries
- Consider read replicas for scale

## Scaling Considerations

### For 1-100 users:
- Single PostgreSQL instance
- Single backend instance
- Frontend on CDN (Vercel/Netlify)
- **Est. cost:** $0-20/month

### For 100-1000 users:
- Managed PostgreSQL with backups
- 2-3 backend instances behind load balancer
- Redis for caching
- **Est. cost:** $50-150/month

### For 1000+ users:
- PostgreSQL with read replicas
- Auto-scaling backend (5+ instances)
- Redis cluster
- CDN for frontend + assets
- **Est. cost:** $200-500/month

## Troubleshooting Deployment

### Backend won't start
- Check logs for error messages
- Verify DATABASE_URL is correct
- Ensure all environment variables are set
- Check port availability

### Database connection fails
- Verify connection string format
- Check firewall rules
- Ensure database accepts external connections
- Test connection with `psql`

### Frontend can't reach backend
- Check CORS settings
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is publicly accessible
- Check network/firewall rules

### API keys not working
- Verify ENCRYPTION_KEY is same across deployments
- Check API key format in database
- Test API keys directly with provider

## Security Hardening

### Production Checklist:

- [ ] Use HTTPS everywhere (SSL/TLS)
- [ ] Set secure JWT_SECRET (32+ random characters)
- [ ] Enable CSRF protection
- [ ] Set up rate limiting
- [ ] Use environment variables, never hardcode secrets
- [ ] Enable database encryption at rest
- [ ] Regular security updates
- [ ] Monitor for suspicious activity
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable 2FA for admin accounts

### Rate Limiting (add to backend):

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

## Maintenance

### Regular Tasks:

**Daily:**
- Monitor error logs
- Check API usage/costs

**Weekly:**
- Review user feedback
- Check database size
- Monitor performance metrics

**Monthly:**
- Database backups verification
- Security updates
- Review and optimize costs
- Update dependencies

### Updates:

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Or for managed platforms
git push origin main  # Auto-deploys on Vercel/Railway
```

---

**Your app is now live! 🚀**
