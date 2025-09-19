# Production Deployment Guide

This guide will help you deploy Chirp to your domain with proper security measures.

## Prerequisites

- A domain name (e.g., yourdomain.com)
- A server with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access to the server
- SSL certificate (Let's Encrypt recommended)

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Software
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 1.2 Configure Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Step 2: Application Deployment

### 2.1 Clone and Setup Application
```bash
# Clone your repository
git clone https://github.com/yourusername/chirp.app.git
cd chirp.app

# Install dependencies
npm install

# Copy environment template
cp env.production.example .env
```

### 2.2 Configure Environment Variables
Edit `.env` file with your production values:

```env
NODE_ENV=production
PORT=5000
PRODUCTION_DOMAIN=yourdomain.com
DATABASE_URL=your_supabase_database_url
SESSION_SECRET=your_very_secure_session_secret_here
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CSRF_SECRET=your_csrf_secret_here
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
OPENAI_API_KEY=your_openai_api_key
```

### 2.3 Build and Deploy
```bash
# Build the application
npm run build:production

# Start with PM2
pm2 start server/index.js --name chirp-app --env production
pm2 save
pm2 startup
```

## Step 3: SSL Certificate Setup

### 3.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 3.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 4: Nginx Configuration

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/chirp
```

Copy the contents of `nginx.conf` and update the domain name and SSL certificate paths.

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/chirp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Domain Configuration

### 5.1 DNS Setup
Point your domain's A record to your server's IP address:
```
yourdomain.com    A    YOUR_SERVER_IP
www.yourdomain.com    A    YOUR_SERVER_IP
```

### 5.2 Test Deployment
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Test main application
curl https://yourdomain.com
```

## Step 6: Monitoring and Maintenance

### 6.1 Set Up Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor application logs
pm2 logs chirp-app

# Monitor Nginx logs
sudo tail -f /var/log/nginx/chirp_access.log
sudo tail -f /var/log/nginx/chirp_error.log
```

### 6.2 Automated SSL Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: Security Hardening

### 7.1 Update Security Headers
Ensure your Nginx configuration includes all security headers from the provided `nginx.conf`.

### 7.2 Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit fix
npm update
```

### 7.3 Backup Strategy
```bash
# Create backup script
sudo nano /usr/local/bin/backup-chirp.sh
```

Add backup commands for your database and application files.

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check if the Node.js app is running
   ```bash
   pm2 status
   pm2 logs chirp-app
   ```

2. **SSL Certificate Issues**: Verify certificate installation
   ```bash
   sudo certbot certificates
   ```

3. **Permission Issues**: Ensure proper file permissions
   ```bash
   sudo chown -R www-data:www-data /path/to/chirp
   ```

### Log Locations
- Application logs: `pm2 logs chirp-app`
- Nginx access logs: `/var/log/nginx/chirp_access.log`
- Nginx error logs: `/var/log/nginx/chirp_error.log`
- System logs: `/var/log/syslog`

## Performance Optimization

### 1. Enable Gzip Compression
Already configured in the provided Nginx configuration.

### 2. Set Up CDN (Optional)
Consider using CloudFlare or similar CDN for static assets.

### 3. Database Optimization
- Enable connection pooling
- Set up database indexes
- Monitor query performance

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Firewall configured
- [ ] Environment variables secured
- [ ] Regular security updates scheduled
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Access controls configured
- [ ] CORS properly configured for production domain

## Support

For deployment issues:
1. Check application logs: `pm2 logs chirp-app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/chirp_error.log`
3. Verify environment variables are set correctly
4. Ensure all required ports are open
5. Check domain DNS configuration

---

**Note**: This guide assumes a standard Ubuntu server setup. Adjust commands as needed for your specific server configuration.
