#!/bin/bash

# Chirp Mobile App Build Scripts
# Run these commands to build and deploy your mobile app

echo "🚀 Chirp Mobile App Build Scripts"
echo "================================="

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 completed successfully"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Build web app and prepare for mobile
build_mobile() {
    echo "📱 Building mobile app..."
    
    # Build the web application
    npm run build
    check_status "Web build"
    
    # Prepare dist folder for Capacitor
    cp dist/public/index.html dist/index.html
    cp -r dist/public/* dist/
    check_status "Dist folder preparation"
    
    # Sync web assets to mobile platforms
    npx cap sync
    check_status "Capacitor sync"
    
    echo "✅ Mobile build complete!"
}

# Open iOS project in Xcode (macOS only)
open_ios() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Opening iOS project in Xcode..."
        build_mobile
        npx cap open ios
        echo "📱 iOS project opened in Xcode"
        echo "Next steps:"
        echo "1. Connect your iPhone to your Mac"
        echo "2. Select your device in Xcode"
        echo "3. Click the Play button to test"
        echo "4. For App Store: Product → Archive → Upload to App Store"
    else
        echo "❌ iOS development requires macOS and Xcode"
        echo "Please run this script on a Mac computer"
    fi
}

# Open Android project in Android Studio
open_android() {
    echo "🤖 Opening Android project in Android Studio..."
    build_mobile
    npx cap open android
    echo "📱 Android project opened in Android Studio"
    echo "Next steps:"
    echo "1. Click the Run button to test on emulator"
    echo "2. Connect Android device for testing"
    echo "3. For Play Store: Build → Generate Signed Bundle"
}

# Build iOS archive for App Store (macOS only)
build_ios_release() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Building iOS release archive..."
        build_mobile
        cd ios
        xcodebuild -workspace App.xcworkspace -scheme App archive -archivePath ./build/App.xcarchive
        check_status "iOS archive build"
        echo "✅ iOS archive ready for App Store upload!"
        echo "📁 Archive location: ios/build/App.xcarchive"
        echo "Upload via Xcode Organizer or Application Loader"
    else
        echo "❌ iOS release build requires macOS and Xcode"
    fi
}

# Build Android release bundle for Play Store
build_android_release() {
    echo "🤖 Building Android release bundle..."
    build_mobile
    cd android
    ./gradlew bundleRelease
    check_status "Android bundle build"
    echo "✅ Android App Bundle ready for Play Store!"
    echo "📁 Bundle location: android/app/build/outputs/bundle/release/app-release.aab"
    echo "Upload this file to Google Play Console"
}

# Show help menu
show_help() {
    echo "Usage: ./mobile-build-scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build        - Build web app and sync to mobile platforms"
    echo "  ios          - Open iOS project in Xcode (macOS only)"
    echo "  android      - Open Android project in Android Studio"
    echo "  ios-release  - Build iOS archive for App Store (macOS only)"
    echo "  android-release - Build Android bundle for Play Store"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./mobile-build-scripts.sh build"
    echo "  ./mobile-build-scripts.sh ios"
    echo "  ./mobile-build-scripts.sh android-release"
}

# Check if Node.js and npm are installed
check_dependencies() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
}

# Main script logic
main() {
    check_dependencies
    
    case "$1" in
        "build")
            build_mobile
            ;;
        "ios")
            open_ios
            ;;
        "android")
            open_android
            ;;
        "ios-release")
            build_ios_release
            ;;
        "android-release")
            build_android_release
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            echo "❓ No command specified. Showing help..."
            show_help
            ;;
        *)
            echo "❌ Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"