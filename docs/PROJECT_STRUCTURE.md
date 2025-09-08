# Chirp App - Project Structure

This document outlines the reorganized project structure for better maintainability and clarity.

## 📁 Directory Structure

```
chirp.app/
├── 📱 app/                    # Expo Router app pages
├── 🎨 assets/                 # Static assets (images, fonts)
├── 📦 components/              # Reusable React components
├── 🔧 config/                  # Configuration files
├── 📊 constants/               # App constants and configurations
├── 🗄️ database/               # Database-related files
│   ├── migrations/             # Database migration files
│   ├── snippets/               # SQL snippets and utilities
│   └── sql/                    # SQL scripts and queries
├── 📚 docs/                    # Documentation
│   ├── bot/                    # Bot system documentation
│   ├── database/               # Database documentation
│   ├── deployment/             # Deployment guides
│   ├── development/            # Development guides
│   ├── notifications/          # Notification system docs
│   └── security/               # Security documentation
├── 🎣 hooks/                   # Custom React hooks
├── 📚 lib/                     # Core library files
│   ├── api/                    # API client functions
│   ├── database/               # Database interaction layer
│   └── types/                  # TypeScript type definitions
├── 🛠️ scripts/                 # Build and utility scripts
├── 🖥️ server/                   # Backend server code
├── 🔧 services/                # Business logic services
├── 🔄 utils/                   # Utility functions and debug tools
└── 📄 types/                   # Additional type definitions
```

## 🔄 Migration Summary

### Files Moved:

**Database Files:**
- `Supabase Snippets/*` → `database/snippets/`
- `migrations/*` → `database/migrations/`
- `*.sql` → `database/sql/`

**Documentation:**
- `DATABASE_*.md` → `docs/database/`
- `SUPABASE_*.md` → `docs/database/`
- `NOTIFICATION_SYSTEM_README.md` → `docs/notifications/`
- `BOT_SYSTEM_README.md` → `docs/bot/`
- `SECURITY*.md` → `docs/security/`
- `DEVELOPMENT_SECURITY.md` → `docs/security/`
- `CODEQL_RESOLUTION_SUMMARY.md` → `docs/security/`
- `app-store-assets/` → `docs/deployment/`
- `AUTH_DISABLED_README.md` → `docs/development/`
- `GET_ANON_KEY.md` → `docs/development/`

**Library Files:**
- `mobile-db.ts` → `lib/database/`
- `mobile-db-supabase.ts` → `lib/database/`
- `mobile-db-old.ts` → `lib/database/`
- `mobile-api.ts` → `lib/api/`
- `mobile-types.ts` → `lib/types/`

**Utility Files:**
- `debug-*.js` → `utils/`
- `test-*.js` → `utils/`
- `check-*.js` → `utils/`
- `find-*.js` → `utils/`
- `quick-*.js` → `utils/`
- `fixed-*.js` → `utils/`
- `add-mock-data.js` → `utils/`
- `run-migration.js` → `utils/`
- `package-scripts.js` → `utils/`

### Directories Removed:
- `Supabase Snippets/` (moved to `database/snippets/`)
- `migrations/` (moved to `database/migrations/`)

## 🎯 Benefits of New Structure

1. **Better Organization**: Related files are grouped together
2. **Clearer Separation**: Database, documentation, and code are separated
3. **Easier Navigation**: Developers can quickly find what they need
4. **Scalability**: Structure supports future growth
5. **Maintainability**: Easier to maintain and update

## 📝 Import Path Updates Needed

After this reorganization, you may need to update import paths in your code:

```typescript
// Old imports
import { getChirps } from '../mobile-db';
import { BotService } from '../services/botService';

// New imports
import { getChirps } from '../lib/database/mobile-db';
import { BotService } from '../services/botService';
```

## 🚀 Next Steps

1. Update import paths in existing code
2. Update build scripts if needed
3. Update documentation references
4. Test that all functionality still works
5. Update CI/CD pipelines if they reference old paths

---

*This reorganization was completed to improve project maintainability and developer experience.*
