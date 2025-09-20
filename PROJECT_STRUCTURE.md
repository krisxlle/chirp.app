# Chirp App - Project Structure

This project contains both Metro (React Native/Expo) and Web implementations of the Chirp social media app.

## 📁 Directory Structure

### 🏗️ Root Level
- `metro/` - Metro/React Native specific code
- `web/` - Web-specific code  
- `shared/` - Shared code between Metro and Web
- `server/` - Backend server code
- `database/` - Database schemas and migrations
- `docs/` - Documentation
- `config/` - Configuration files

### 📱 Metro (React Native/Expo)
```
metro/
├── components/          # Metro-specific components
├── hooks/              # Metro-specific hooks
├── lib/                # Metro-specific utilities
├── app/                # Expo Router app structure
├── assets/             # Metro assets
└── constants/          # Metro constants
```

### 🌐 Web (Vite/React)
```
web/
├── client/             # Web client code
│   ├── src/
│   │   ├── components/ # Web-specific components
│   │   ├── pages/      # Web pages
│   │   ├── hooks/      # Web-specific hooks
│   │   └── lib/        # Web-specific utilities
│   ├── public/         # Web public assets
│   └── vite.config.ts  # Vite configuration
├── api/                # Vercel serverless functions
└── dist/               # Built web assets
```

### 🔄 Shared
```
shared/
├── schema.ts           # Shared TypeScript types
└── utils/              # Shared utilities
```

## 🚀 Development

### Metro Development
```bash
# Install dependencies
npm install

# Start Metro development server
npm run start

# Build for production
npm run build
```

### Web Development
```bash
# Install dependencies
npm install

# Start web development server
npm run dev

# Build web for production
npm run build:web
```

## 📦 Build Outputs

- Metro builds to `android/` and `ios/` directories
- Web builds to `web/dist/` directory
- Server builds to `server/` directory

## 🔧 Configuration

- `config/metro.config.js` - Metro bundler configuration
- `config/vite.config.ts` - Vite bundler configuration
- `config/tailwind.config.ts` - Tailwind CSS configuration
- `package.json` - Dependencies and scripts
- `vercel.json` - Vercel deployment configuration
