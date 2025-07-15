# Building Android AAB with Command Line Tools

This guide provides multiple command line approaches to build Android App Bundle (AAB) files for your Tank Adventure PWA.

## Prerequisites

Make sure you have the following installed:

1. **Node.js** (already installed)
2. **Java Development Kit (JDK) 17** (required for Android builds)
3. **Android SDK** (for advanced builds)

## Option 1: PWABuilder CLI (Recommended)

PWABuilder CLI is the command line version of the PWABuilder web interface you've used before.

### Installation
```bash
npm install -g pwabuilder
```

### Basic Usage
```bash
# Generate Android app from your PWA
pwabuilder https://hoanganh25991.github.io/tank-adventure -p android -d ./build-output

# Or if you have a local manifest
pwabuilder -m ./manifest.json -p android -d ./build-output
```

### Build with Custom Options
```bash
pwabuilder https://hoanganh25991.github.io/tank-adventure \
  -p android \
  -d ./build-output \
  -s "Tank Adventure" \
  -l info
```

### Package the Generated Project
```bash
# After generation, package the project
pwabuilder package ./build-output/tank-adventure/android -p android
```

## Option 2: Bubblewrap CLI (Google's Official Tool)

Bubblewrap is Google's official CLI tool for building Android apps from PWAs using Trusted Web Activity (TWA).

### Installation
```bash
npm install -g @bubblewrap/cli
```

### Initial Setup
```bash
# Initialize Bubblewrap (first time only)
bubblewrap init --manifest https://hoanganh25991.github.io/tank-adventure/manifest.json
```

### Build AAB
```bash
# Build the Android App Bundle
bubblewrap build --skipPwaValidation
```

### Advanced Build with Custom Configuration
```bash
# Build with custom signing key
bubblewrap build \
  --skipPwaValidation \
  --signingKeyPath ./android-signing-key.jks \
  --signingKeyPassword "your-password" \
  --signingKeyAlias "your-alias"
```

## Option 3: Capacitor (Alternative)

Capacitor is another option that provides good PWA to native app conversion.

### Installation
```bash
npm install -g @capacitor/cli
```

### Setup
```bash
# Initialize Capacitor project
npx cap init tank-adventure io.github.hoanganh25991.tankadventure

# Add Android platform
npx cap add android

# Copy web assets
npx cap copy

# Open in Android Studio
npx cap open android
```

## CI/CD Pipeline Example

Here's a GitHub Actions workflow example for automated AAB builds:

```yaml
name: Build Android AAB

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'adopt'
        java-version: '17'
        
    - name: Install Bubblewrap
      run: npm install -g @bubblewrap/cli
      
    - name: Initialize Bubblewrap
      run: bubblewrap init --manifest https://hoanganh25991.github.io/tank-adventure/manifest.json
      
    - name: Build AAB
      run: bubblewrap build --skipPwaValidation
      
    - name: Upload AAB artifact
      uses: actions/upload-artifact@v3
      with:
        name: android-aab
        path: '*.aab'
```

## Signing Configuration

For production builds, you'll need to configure signing:

### Generate Keystore
```bash
keytool -genkey -v -keystore tank-adventure-release.keystore \
  -alias tank-adventure \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Configure Signing in Bubblewrap
```bash
# Update twa-manifest.json with signing details
{
  "signingKey": {
    "path": "./tank-adventure-release.keystore",
    "alias": "tank-adventure"
  }
}
```

## Environment Variables for CI/CD

Set these in your CI/CD environment:

```bash
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_PASSWORD="your-key-password"
export KEY_ALIAS="tank-adventure"
export KEYSTORE_PATH="./tank-adventure-release.keystore"
```

## Build Scripts

Add these to your package.json:

```json
{
  "scripts": {
    "build:android": "bubblewrap build --skipPwaValidation",
    "build:android:release": "bubblewrap build --skipPwaValidation --signingKeyPath $KEYSTORE_PATH --signingKeyPassword $KEYSTORE_PASSWORD --signingKeyAlias $KEY_ALIAS",
    "init:android": "bubblewrap init --manifest https://hoanganh25991.github.io/tank-adventure/manifest.json"
  }
}
```

## Usage Commands

```bash
# Initialize (first time only)
npm run init:android

# Build development AAB
npm run build:android

# Build release AAB (with signing)
npm run build:android:release
```

## Troubleshooting

1. **JDK Issues**: Ensure JDK 17 is installed and JAVA_HOME is set
2. **Manifest Issues**: Verify your manifest.json is valid and accessible
3. **Build Failures**: Check Android SDK installation and PATH variables
4. **Signing Issues**: Verify keystore path and passwords are correct

## Next Steps

1. Try the PWABuilder CLI approach first (simpler)
2. If you need more control, use Bubblewrap
3. Set up CI/CD pipeline using the provided examples
4. Configure proper signing for production releases

The generated AAB files can be uploaded directly to Google Play Console for distribution.