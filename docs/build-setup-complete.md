# ✅ Android AAB Build Setup Complete

Your Tank Adventure project now has complete command line build capabilities for Android AAB files! 🎉

## 🛠️ Installed Tools

- ✅ **PWABuilder CLI** - Microsoft's PWA to native app converter
- ✅ **Bubblewrap CLI** - Google's official TWA (Trusted Web Activity) builder
- ✅ **Build Scripts** - Ready-to-use automation scripts

## 🚀 Quick Start Commands

### Option 1: Using Build Scripts (Recommended)
```bash
# Interactive script - choose your build method
./build-android.sh

# Simple automated script
./build-android-simple.sh
```

### Option 2: Using npm Scripts
```bash
# Initialize Bubblewrap (first time only)
npm run init:android

# Build AAB using Bubblewrap
npm run build:android

# Build AAB using PWABuilder
npm run build:android:pwa

# Build signed AAB for production
npm run build:android:release
```

### Option 3: Direct Commands
```bash
# PWABuilder approach
pwabuilder -m ./manifest.json -p android -d ./build-output -s "Tank Adventure"

# Bubblewrap approach
bubblewrap init --manifest https://hoanganh25991.github.io/tank-adventure/manifest.json
bubblewrap build --skipPwaValidation
```

## 📋 CI/CD Setup

Your project includes a complete GitHub Actions workflow:
- **File**: `.github/workflows/build-android.yml`
- **Triggers**: Push to main, tags, manual dispatch
- **Features**: 
  - Development AAB builds
  - Signed release builds (on tags)
  - Artifact uploads
  - Automatic releases

## 🔧 For Production Builds

### 1. Create Android Signing Key
```bash
keytool -genkey -v -keystore tank-adventure-release.keystore \
  -alias tank-adventure \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Set Environment Variables
```bash
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_PASSWORD="your-key-password"  
export KEY_ALIAS="tank-adventure"
export KEYSTORE_PATH="./tank-adventure-release.keystore"
```

### 3. Build Signed AAB
```bash
npm run build:android:release
```

## 📁 Generated Files Structure

After building, you'll find:
```
tank-adventure/
├── build-output/           # PWABuilder output
├── bubblewrap-build/       # Bubblewrap output
├── aab-output/            # Final AAB files
├── android-build/         # Build artifacts
└── *.aab                  # Generated AAB files
```

## 🎯 Next Steps

1. **Test the build scripts**:
   ```bash
   ./build-android-simple.sh
   ```

2. **Upload to Google Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app or update existing
   - Upload the generated `.aab` file

3. **Set up CI/CD**:
   - Push your code to GitHub
   - Add signing secrets to repository settings
   - Create a release tag to trigger signed builds

## 🔍 Troubleshooting

- **JDK Issues**: Ensure JDK 17+ is installed
- **Manifest Errors**: Check manifest.json accessibility
- **Build Failures**: Run with `-l debug` for detailed logs
- **Permission Errors**: Make sure scripts are executable (`chmod +x`)

## 📚 Documentation

- **Complete Guide**: `build-android-aab.md`
- **CI/CD Workflow**: `.github/workflows/build-android.yml`
- **Package Scripts**: `package.json`

---

🎉 **Congratulations!** You now have a complete CI/CD pipeline for building Android AAB files from your Tank Adventure PWA!

No more dependency on PWABuilder's web interface - everything can be automated! 🚀