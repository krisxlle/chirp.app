// This file adds the missing dev script functionality
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add the dev script that runs the web version on port 5000
packageJson.scripts.dev = 'expo start --web --port 5000';

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Added dev script to package.json');