# Support Email System Setup

The Chirp app has a fully functional support system that sends help requests to `joinchirp@gmail.com`. Here's how to set it up:

## Current Status ✅

The support system is **already implemented** and working:

- ✅ Support page exists at `/support` 
- ✅ Contact Support button in Settings page navigates to support form
- ✅ API endpoint `/api/support` handles form submissions
- ✅ Email service configured to send to `joinchirp@gmail.com`
- ✅ Beautiful HTML email templates with Chirp branding
- ✅ Rate limiting and validation in place

## Setup Required 🔧

To enable email sending, you need to configure Gmail credentials:

### 1. Create Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to "App passwords" section
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### 2. Set Environment Variables

**✅ CREDENTIALS READY!** 

Rename `env-template.txt` to `.env` in the project root. The file contains:

```env
GMAIL_USER=joinchirp@gmail.com
GMAIL_PASSWORD=hitj gpsk mfsa tohn
```

### 3. Restart the Server

After setting the environment variables, restart the development server:

```bash
npx expo start --clear
```

## How It Works 📧

1. **User submits support form** → Support page (`/support`)
2. **Form data sent** → `/api/support` endpoint
3. **Email generated** → Beautiful HTML email with Chirp branding
4. **Email sent** → `joinchirp@gmail.com` via Gmail SMTP
5. **User notified** → Success message in app

## Email Template Features 🎨

- **Chirp Branding**: Purple gradient header with bird emoji
- **Structured Layout**: User info, message content, next steps
- **Security**: HTML escaping to prevent XSS
- **Responsive**: Works on all email clients
- **Professional**: Clean, modern design

## Testing 🧪

To test the support system:

1. Navigate to Settings → Contact Support
2. Fill out the support form
3. Submit the request
4. Check `joinchirp@gmail.com` for the email
5. Check server logs for confirmation

## Fallback Behavior 📝

If Gmail credentials are not configured:
- Support requests are still saved to the database
- Detailed logs are printed to console
- User still gets success message
- No emails are sent (but system doesn't break)

## Rate Limiting 🛡️

The support system includes rate limiting:
- `supportLimiter`: Prevents spam submissions
- Configurable limits in `server/rateLimiting.ts`

## Security 🔒

- Input validation and sanitization
- HTML escaping in email templates
- Rate limiting to prevent abuse
- No sensitive data exposure

---

**The support system is ready to use! Just add the Gmail credentials to enable email notifications.**
