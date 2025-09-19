# Chirp - Social Media App

**This is proprietary software. Not for commercial use.**

Chirp is a modern social media application built with React Native and Expo, featuring real-time messaging, user profiles, and interactive content sharing.

## 🚀 Features

- **Real-time Chirps**: Post and share content with followers
- **User Profiles**: Customizable profiles with avatars and banners
- **Threaded Conversations**: Reply to chirps and create conversation threads
- **Follow System**: Follow other users and see their content in your feed
- **Search & Discovery**: Find users and content through search functionality
- **Push Notifications**: Stay updated with real-time notifications
- **Cross-platform**: Works on iOS, Android, and Web

## 🏗️ Architecture

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **UI Components**: Custom components with responsive design
- **Authentication**: Supabase Auth integration

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images and media
- **Real-time**: Supabase Realtime subscriptions

### Key Components

#### Core Components
- `ChirpCard.tsx` - Displays individual chirps with interactions
- `ComposeChirp.tsx` - Create new chirps and replies
- `HomePage.tsx` - Main feed displaying user's timeline
- `ProfilePage.tsx` - User profile management
- `SearchPage.tsx` - Search users and content

#### Navigation & Layout
- `BottomNavigation.tsx` - Main app navigation
- `ChirpApp.tsx` - Root app component
- `app/_layout.tsx` - App-wide layout configuration

#### Authentication
- `AuthContext.tsx` - Global authentication state
- `SignInScreen.tsx` - User login interface
- `SignInScreenNew.tsx` - Updated sign-in experience

## 📁 Project Structure

```
chirp.app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   ├── chirp/[id].tsx     # Individual chirp view
│   ├── profile/[userId].tsx # User profile pages
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── ChirpCard.tsx     # Chirp display component
│   ├── ComposeChirp.tsx  # Chirp creation
│   ├── HomePage.tsx      # Main feed
│   └── ProfilePage.tsx   # Profile management
├── mobile-db-supabase.ts  # Database operations
├── mobile-api.ts         # API client
├── mobile-types.ts       # TypeScript definitions
└── services/            # External services
```

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/krisxlle/chirp.app.git
   cd chirp.app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Run the SQL migrations in `supabase-setup.sql`
   - Set up Supabase Storage buckets for `profile-images` and `banner-images`

5. **Start the development server**
   ```bash
   npx expo start
   ```

## 🔧 Key Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript
- **Supabase**: Backend-as-a-Service
- **Expo Router**: File-based navigation
- **React Context**: State management
- **AsyncStorage**: Local data persistence

## 📱 Usage

### For Users
1. **Sign Up/Login**: Create an account or sign in
2. **Create Profile**: Upload avatar and banner images
3. **Post Chirps**: Share thoughts, images, and content
4. **Follow Users**: Connect with other users
5. **Reply & Thread**: Engage in conversations
6. **Search**: Discover new content and users

### For Developers
- **Component Development**: Add new UI components in `/components`
- **Page Creation**: Create new pages in `/app` directory
- **Database Operations**: Extend functionality in `mobile-db-supabase.ts`
- **API Integration**: Add new endpoints in `mobile-api.ts`

## 🔒 Security & Privacy

- **Authentication**: Secure user authentication via Supabase
- **Data Protection**: Row Level Security (RLS) policies
- **Image Storage**: Secure cloud storage with access controls
- **Privacy Controls**: User-controlled data sharing

## 🚀 Deployment

### Mobile App Stores
- **iOS**: Build with EAS Build for App Store
- **Android**: Build with EAS Build for Google Play

### Web Deployment

#### Production Deployment Options

**Option 1: Direct Server Deployment**
```bash
# Set up environment variables
cp env.production.example .env
# Edit .env with your production values

# Deploy using the deployment script
npm run deploy
```

**Option 2: Docker Deployment**
```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:compose
```

**Option 3: Manual Deployment**
```bash
# Build for production
npm run build:production

# Start production server
npm run start:production
```

#### Required Environment Variables for Production

Create a `.env` file with the following variables:

```env
NODE_ENV=production
PORT=5000
PRODUCTION_DOMAIN=yourdomain.com
DATABASE_URL=your_supabase_database_url
SESSION_SECRET=your_secure_session_secret
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CSRF_SECRET=your_csrf_secret
```

#### Security Configuration

1. **SSL Certificate**: Set up HTTPS with a valid SSL certificate
2. **Nginx Configuration**: Use the provided `nginx.conf` for reverse proxy
3. **Firewall**: Configure firewall to only allow ports 80, 443, and 22
4. **Domain Setup**: Point your domain DNS to your server IP

#### Authentication Flow

The web application automatically redirects unauthenticated users to the sign-in page. Users must authenticate through the configured authentication system before accessing the main application.

#### Monitoring

- Health check endpoint: `GET /api/health`
- Monitor logs for suspicious activity
- Set up uptime monitoring for your domain

## 🤝 Contributing

This is proprietary software. Contributions are not accepted for commercial use.

## 📄 License

**This is proprietary software. Not for commercial use.**

## 🆘 Support

For technical support or questions about the codebase, please refer to the documentation or contact the development team.

---

Built with ❤️ using React Native, Expo, and Supabase