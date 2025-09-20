// Web-specific entry point for Vercel deployment
// This file only imports client-side code and avoids any server imports

import { registerRootComponent } from 'expo';
import App from './web-app';

// Register the main component
registerRootComponent(App);
