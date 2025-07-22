# App Store Submission Checklist

## Pre-Submission Requirements

### ✅ Development Setup Complete
- [x] Capacitor installed and configured
- [x] iOS and Android platforms added
- [x] App icons generated
- [x] PWA manifest created
- [ ] Build production version
- [ ] Test on physical devices

### 📱 iOS App Store Requirements

#### Developer Account & Setup
- [ ] Apple Developer Program membership ($99/year)
- [ ] Mac with Xcode installed
- [ ] iOS Provisioning Profile created
- [ ] App Store Connect app created

#### App Assets Required
- [ ] App Icon (1024x1024 PNG, no transparency)
- [ ] iPhone Screenshots (6.7", 6.5", 5.5" displays)
- [ ] iPad Screenshots (12.9", 11" displays) - optional
- [ ] App Preview videos (optional but recommended)

#### App Information
- [ ] App Name: "Chirp"
- [ ] Bundle ID: com.chirp.app
- [ ] Version: 1.0.0
- [ ] Category: Social Networking
- [ ] Age Rating: 13+
- [ ] Keywords: social media, personality, AI, profiles
- [ ] Description (4000 char max)
- [ ] Privacy Policy URL
- [ ] Terms of Service URL

#### iOS Specific Files
- [ ] Privacy manifest file
- [ ] App Store screenshots in required sizes
- [ ] App icon without rounded corners
- [ ] Launch screen/splash screen

### 🤖 Android Play Store Requirements

#### Developer Account & Setup
- [ ] Google Play Developer account ($25 one-time)
- [ ] Android Studio installed
- [ ] App signing key generated
- [ ] Play Console app created

#### App Assets Required
- [ ] App Icon (512x512 PNG, 32-bit with alpha)
- [ ] Feature Graphic (1024x500 JPG/PNG)
- [ ] Phone Screenshots (min 2, max 8)
- [ ] Tablet Screenshots (optional)
- [ ] Promo video (optional)

#### App Information
- [ ] App Name: "Chirp"
- [ ] Package Name: com.chirp.app
- [ ] Version Code: 1
- [ ] Version Name: 1.0.0
- [ ] Category: Social
- [ ] Target Age: 13+
- [ ] Short Description (80 char max)
- [ ] Full Description (4000 char max)
- [ ] Privacy Policy URL
- [ ] Terms of Service URL

## Build & Testing Phase

### 🔨 Build Process
- [ ] Run `npm run build` successfully
- [ ] Run `npx cap sync` to sync web assets
- [ ] Open iOS project: `npx cap open ios`
- [ ] Open Android project: `npx cap open android`
- [ ] Configure signing certificates
- [ ] Build release versions

### 🧪 Testing Requirements
- [ ] Test core functionality (login, posting, following)
- [ ] Test AI profile generation
- [ ] Test subscription flow
- [ ] Test notifications
- [ ] Test on multiple devices/screen sizes
- [ ] Test offline functionality
- [ ] Performance testing (load times, memory usage)

### 📋 App Store Guidelines Compliance

#### iOS App Review Guidelines
- [ ] 4.2 Minimum Functionality - App provides substantial unique value
- [ ] 2.1 App Completeness - All features functional
- [ ] 1.1 Objectionable Content - Content appropriate for 13+
- [ ] 3.1 Payments - Subscription properly implemented via Apple
- [ ] 5.1 Privacy - Privacy policy covers data collection

#### Google Play Policies
- [ ] User Data policy compliance
- [ ] Financial Services policy (for subscriptions)
- [ ] Content Policy adherence
- [ ] Target API level requirements met
- [ ] App Bundle format used

## Submission Process

### 📤 iOS Submission Steps
1. [ ] Archive app in Xcode
2. [ ] Upload to App Store Connect
3. [ ] Complete app information in App Store Connect
4. [ ] Add screenshots and metadata
5. [ ] Set pricing (free with IAP)
6. [ ] Submit for review
7. [ ] Respond to reviewer feedback if needed

### 📤 Android Submission Steps
1. [ ] Generate signed AAB (Android App Bundle)
2. [ ] Upload to Play Console
3. [ ] Complete store listing
4. [ ] Add screenshots and graphics
5. [ ] Set up pricing & distribution
6. [ ] Submit for review
7. [ ] Respond to reviewer feedback if needed

## Post-Launch

### 📊 Monitoring & Updates
- [ ] Monitor crash reports
- [ ] Track user reviews and ratings
- [ ] Monitor app performance metrics
- [ ] Plan regular updates
- [ ] Respond to user feedback

### 🚀 Marketing & ASO
- [ ] App Store Optimization (ASO)
- [ ] Social media promotion
- [ ] Press kit creation
- [ ] User acquisition strategy
- [ ] Review and rating campaigns

## Timeline Estimate

- **Setup & Development**: 1-2 weeks
- **Testing & Polish**: 1-2 weeks  
- **App Store Assets**: 3-5 days
- **Submission Process**: 1-2 days
- **Review Time**: 2-7 days (varies by platform)

**Total Time to Launch**: 4-6 weeks

## Notes

- iOS has stricter review guidelines but higher-spending users
- Android has faster approval but more competition
- Consider soft launch in specific regions first
- Plan for multiple iterations based on reviewer feedback
- Keep regular backups of signing certificates and keys