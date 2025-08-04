# Chirp - Social Media Platform

## Overview

Chirp is a social media platform with dual implementations: a web application (React) and a mobile application (Expo/React Native), both sharing the same Express.js backend and PostgreSQL database. The project aims to provide a full-featured social media experience with AI-powered content generation and robust user interaction capabilities, envisioning significant market potential for a modern, engaging platform.

## User Preferences

Preferred communication style: Simple, everyday language.
Interface preference: Original React web client from client/ directory, NOT Expo mobile app.

## System Architecture

The application employs a full-stack architecture with clear separation of concerns.

### Frontend Architecture
**Web Application**:
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter
- **Build Tool**: Vite

**Mobile Application (Expo)**:
- **Framework**: Expo/React Native with TypeScript
- **Navigation**: Expo Router (tab-based)
- **Styling**: React Native StyleSheet and themed components
- **Build**: Capacitor for native iOS/Android builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth
- **Session Management**: Express sessions with PostgreSQL storage
- **AI Integration**: OpenAI API

### Key Architectural Decisions & Features
- **Database Schema**: Comprehensive schema covering Users, Chirps, Follows, Reactions, Notifications, and Sessions.
- **Authentication System**: Replit OAuth for user authentication, session-based with PostgreSQL storage, and middleware protection for routes. Includes OpenID Connect (OIDC).
- **API Structure**: RESTful endpoints with authentication, error handling, and request logging.
- **Frontend Components**: Responsive design (mobile-first), consistent UI with shadcn/ui, and React Query for data management. Uses Radix UI for accessible primitives, Lucide Icons, and Tailwind CSS for styling.
- **Data Flow**: OAuth for authentication, React Query for data fetching/caching, polling for real-time updates, and centralized error handling.
- **AI-Powered Features**: Content generation for user summaries, avatars, banners, and bios. Includes AI profile generation based on personality quiz, and AI-powered weekly analytics summaries.
- **User Engagement Systems**: Comprehensive notification system (mentions, reactions, replies, follows), custom handle claiming with invitation and VIP code systems, and a robust mood reaction system with custom icons.
- **Subscription Model**: Chirp+ premium subscription ($4.99/month) with Stripe integration, offering enhanced AI features and benefits.
- **Legal Compliance**: Integrated Terms of Service and Privacy Policy for GDPR compliance and legal protection.
- **Deployment Strategy**: Replit for development, Vite/Expo export for production builds, deployed to Cloud Run with autoscale.

## External Dependencies

- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database.
- **OpenAI API**: Used for AI-powered content generation (summaries, avatars, banners, bios).
- **Stripe**: Payment processing for Chirp+ subscriptions.
- **Mailchimp**: For automated weekly email analytics.
- **Twilio (implied)**: For SMS-based link sharing system (contact invitations).
- **html2canvas**: For saving chirps as images.