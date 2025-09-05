# Development Server Security Guide

## Overview

This guide addresses the esbuild CORS vulnerability and implements comprehensive security measures for your development server.

## The Problem

esbuild's development server has a critical security vulnerability where it sets `Access-Control-Allow-Origin: *` by default, allowing any website to:
- Send requests to your development server
- Read responses and source code
- Access sensitive development files
- Potentially steal API keys or other secrets

## Security Measures Implemented

### 1. CORS Protection
- **Restricted Origins**: Only allows requests from specific localhost and your computer IP
- **Dynamic Validation**: Checks each request origin against allowed list
- **Blocked Requests**: Logs and blocks unauthorized origin attempts

### 2. Origin Validation Middleware
- **Real-time Monitoring**: Logs all suspicious requests
- **IP Tracking**: Records IP addresses of blocked requests
- **Security Headers**: Adds protective headers to all responses

### 3. Development File Protection
- **Sensitive Path Blocking**: Prevents access to source files, configs, and dependencies
- **Source Map Protection**: Blocks access to source maps from unauthorized origins
- **Directory Listing Prevention**: Prevents browsing of sensitive directories

### 4. Rate Limiting
- **API Protection**: Limits requests per IP address
- **Tiered Limits**: Different limits for different endpoint types
- **Abuse Prevention**: Protects against DDoS and brute force attacks

## Configuration

### Environment Variables

Create a `.env.local` file with your computer's IP:

```bash
# Your computer's local IP address for mobile testing
COMPUTER_IP=192.168.1.100

# Optional: Additional allowed origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Setup Script

Run the security setup script to automatically configure your environment:

```bash
npm run setup-security
```

This will:
- Detect your computer's IP address
- Create `.env.local` with proper configuration
- Display security information and next steps

## Allowed Origins

The following origins are automatically allowed:

- `http://localhost:3000`
- `http://localhost:5000`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5000`
- `http://localhost:8080`
- `http://127.0.0.1:8080`
- `http://[YOUR_COMPUTER_IP]:5000` (for mobile testing)
- `http://[YOUR_COMPUTER_IP]:3000` (for mobile testing)

## Security Features

### Request Logging
All requests are logged with:
- Origin and referer headers
- IP address and user agent
- Request path and method
- Response status and timing
- Security alerts for blocked requests

### Security Headers
Every response includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Content Creation**: 10 requests per minute
- **File Uploads**: 5 requests per minute
- **Social Actions**: 50 requests per minute

## Mobile Testing

For mobile testing with Expo Go:

1. **Find your computer's IP**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Use your computer IP instead of localhost**:
   ```
   http://192.168.1.100:5000  # Instead of http://localhost:5000
   ```

3. **Update Expo configuration** if needed:
   ```bash
   npx expo start --web --host 192.168.1.100
   ```

## Monitoring

### Security Alerts
Watch for these console messages:

```
🚨 SECURITY ALERT: Unauthorized origin attempt
🚨 SUSPICIOUS REQUEST
🚨 Blocked CORS request from unauthorized origin
```

### Normal Logs
These are expected during development:

```
🔍 DEV SERVER ACCESS
✅ Allowed CORS request from localhost:5000
```

## Troubleshooting

### Common Issues

1. **Mobile app can't connect**:
   - Ensure `COMPUTER_IP` is set correctly
   - Use computer IP instead of localhost
   - Check firewall settings

2. **CORS errors in browser**:
   - Check if origin is in allowed list
   - Verify `.env.local` configuration
   - Restart development server

3. **Rate limiting issues**:
   - Check if you're making too many requests
   - Wait for rate limit window to reset
   - Adjust limits in `server/rateLimiting.ts` if needed

### Adding New Origins

To allow additional origins, update the allowed origins list in:
- `vite.config.ts`
- `server/vite.ts`
- `server/security.ts`

## Production Considerations

⚠️ **Important**: These security measures are for development only. For production:

1. **Use HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never expose development secrets
3. **Network Security**: Don't run development server on public networks
4. **Regular Updates**: Keep dependencies updated
5. **Security Audits**: Regularly audit your security configuration

## Testing Security

Test that security is working:

1. **Try unauthorized origin**:
   ```javascript
   // This should be blocked
   fetch('http://localhost:5000/api/test', {
     headers: { 'Origin': 'http://malicious-site.com' }
   })
   ```

2. **Check rate limiting**:
   ```bash
   # Make many requests quickly
   for i in {1..20}; do curl http://localhost:5000/api/test; done
   ```

3. **Verify logging**:
   - Check console for security alerts
   - Verify blocked requests are logged

## Additional Resources

- [OWASP CORS Security](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Vite Security Configuration](https://vitejs.dev/config/server-options.html#server-cors)
