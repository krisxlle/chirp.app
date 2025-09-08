# CrimsonTalon Bot System

The CrimsonTalon bot is an AI-powered news bot that automatically posts trending news stories twice daily to keep users informed.

## Features

- **Automated Posting**: Posts twice daily at 9:00 AM and 6:00 PM UTC
- **AI-Generated Content**: Uses AI to create engaging chirp content from news stories
- **News Integration**: Fetches trending news from various sources
- **Profile Management**: Uses red-bird.svg as profile photo
- **API Management**: Full REST API for bot control and monitoring

## Bot Configuration

- **Username**: `CrimsonTalon`
- **Email**: `crimson.talon.bot@chirp.app`
- **Name**: `Crimson Talon`
- **Bio**: `🤖 AI-powered news bot bringing you the latest trending stories twice daily. Stay informed with CrimsonTalon!`
- **Profile Image**: `/assets/red-bird.svg`
- **Posting Schedule**: 9:00 AM and 6:00 PM UTC

## Setup Instructions

### 1. Initialize the Bot

Run the initialization script to create the bot account and start the scheduler:

```bash
npm run init-bot
```

This will:
- Create the CrimsonTalon bot user account
- Set up the profile with red-bird.svg image
- Test posting a chirp
- Start the automated scheduler

### 2. Start the Server

Make sure your server is running to handle bot operations:

```bash
npm run start-server
```

### 3. Monitor Bot Status

Check the bot status:

```bash
npm run bot-status
```

## API Endpoints

### Bot Management

- `POST /api/bot/initialize` - Initialize the bot service
- `POST /api/bot/start-scheduler` - Start the automated scheduler
- `POST /api/bot/stop-scheduler` - Stop the automated scheduler
- `GET /api/bot/status` - Get bot and scheduler status
- `GET /api/bot/config` - Get bot configuration

### Testing

- `POST /api/bot/force-post` - Force a test post (bypasses schedule)

## File Structure

```
services/
├── botService.ts          # Core bot functionality
└── botScheduler.ts        # Automated posting scheduler

server/
└── botRoutes.ts           # API endpoints for bot management

scripts/
├── initializeBot.ts       # Bot initialization script
└── initializeBot.js       # JavaScript version

public/assets/
└── red-bird.svg          # Bot profile image
```

## Configuration

### Environment Variables

Add these to your `.env` file for production:

```env
# News API (optional - uses mock data if not provided)
NEWS_API_KEY=your_news_api_key_here

# AI API (optional - uses simple content generation if not provided)
OPENAI_API_KEY=your_openai_api_key_here
```

### Customizing Posting Schedule

Edit `services/botService.ts` to change the posting times:

```typescript
postingSchedule: {
  morning: '09:00', // 9 AM UTC
  evening: '18:00'  // 6 PM UTC
}
```

## How It Works

1. **Scheduler**: Runs every minute to check if it's time to post
2. **News Fetching**: Retrieves trending news stories (currently uses mock data)
3. **Content Generation**: Uses AI to create engaging chirp content
4. **Posting**: Creates chirps using the existing chirp creation system
5. **Monitoring**: Provides API endpoints for status monitoring

## Testing

### Manual Testing

Force a test post:

```bash
npm run bot-force-post
```

### Check Bot Status

```bash
npm run bot-status
```

### View Bot Profile

The bot will appear in the user list with username `CrimsonTalon` and the red bird profile image.

## Troubleshooting

### Bot Not Posting

1. Check if the scheduler is running: `npm run bot-status`
2. Verify the bot user exists in the database
3. Check server logs for errors
4. Ensure the server is running

### Bot User Not Created

1. Run the initialization script: `npm run init-bot`
2. Check database connection
3. Verify Supabase configuration

### Scheduler Issues

1. Restart the scheduler: `POST /api/bot/stop-scheduler` then `POST /api/bot/start-scheduler`
2. Check system time and timezone settings
3. Verify the posting schedule configuration

## Production Considerations

1. **API Keys**: Set up real News API and OpenAI API keys
2. **Error Handling**: Implement retry logic for failed posts
3. **Monitoring**: Set up logging and alerting for bot failures
4. **Rate Limiting**: Ensure bot posts don't exceed platform limits
5. **Content Moderation**: Add content filtering for news stories

## Security

- Bot user has `is_bot: true` flag for identification
- Bot posts are clearly marked with `#CrimsonTalon` hashtag
- API endpoints should be protected in production
- Bot user cannot perform sensitive operations

## Future Enhancements

- Real-time news API integration
- Multiple posting schedules
- Content personalization based on user interests
- Analytics and engagement tracking
- Multi-language support
- Custom news categories
