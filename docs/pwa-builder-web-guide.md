# PWA Builder Web Interface Guide

## Using PWA Builder Website (No CLI Required)

Since you're using the PWA Builder web interface at [pwabuilder.com](https://pwabuilder.com), here's how to configure it for fullscreen:

### Step 1: Enter Your URL
```
https://hoanganh25991.github.io/tank-adventure/
```

### Step 2: Configure Android Package
When you click "Build My PWA" and select Android:

#### Basic Settings:
- **Package Name**: `com.tankadventure.game`
- **App Name**: `Tank Adventure`
- **Launch URL**: `/tank-adventure/`

#### Display Settings:
- **Display Mode**: Select `Fullscreen` ✅
- **Orientation**: Select `Landscape` ✅
- **Theme Color**: `#4a90e2`
- **Background Color**: `#1a1a1a`

#### Advanced Settings (if available):
Look for these options in the advanced/more settings section:
- ✅ **Fullscreen Mode**
- ✅ **Hide System UI**
- ✅ **Immersive Mode**
- ✅ **Lock Orientation to Landscape**
- **Status Bar Color**: `#1a1a1a`
- **Navigation Bar Color**: `#1a1a1a`

### Step 3: Icon Configuration
- **App Icon**: Upload your 512x512 icon
- **Maskable Icon**: Same 512x512 icon
- **Splash Screen**: Use background color `#1a1a1a`

### Step 4: Generate APK
Click "Generate" and download your APK.

## What Our Code Does

The enhanced `fullscreen.js` will automatically detect when your app is running as a TWA and:

1. **Force True Fullscreen**: Overrides any browser UI
2. **Lock Landscape Orientation**: Prevents rotation issues
3. **Hide System UI**: Uses immersive mode
4. **Prevent Scrolling**: Stops pull-to-refresh and scrolling
5. **Optimize Viewport**: Uses full screen dimensions

## Testing Your TWA

### 1. Install the APK on Android Device
```bash
# Enable Developer Options and USB Debugging
# Install via ADB or direct APK install
adb install tank-adventure.apk
```

### 2. Expected Behavior
- ✅ **No browser address bar**
- ✅ **No navigation buttons**
- ✅ **Full screen landscape**
- ✅ **Game uses entire screen**
- ✅ **Locked to landscape orientation**

### 3. Debug Console (if needed)
If you still see browser UI, connect Chrome DevTools:
```bash
# Open Chrome on desktop
# Go to chrome://inspect
# Select your device and app
# Check console for TWA detection logs
```

## Troubleshooting

### Issue: Still seeing browser UI
**Solution**: The web interface might not expose all fullscreen options. Our JavaScript code will handle this automatically.

### Issue: App not detecting as TWA
**Check**: Look for these console messages:
```javascript
"TWA detected - forcing fullscreen"
"Initializing TWA-specific features"
```

### Issue: Orientation not locked
**Solution**: Our code includes orientation locking that works even if PWA Builder doesn't set it properly.

## Alternative: Manual APK Modification

If the web interface doesn't provide enough control, you can:

1. **Download the generated APK**
2. **Extract and modify AndroidManifest.xml**
3. **Add these attributes to the main activity**:
```xml
android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
android:screenOrientation="landscape"
android:launchMode="singleTask"
```
4. **Repackage and sign the APK**

But our JavaScript solution should handle most cases automatically!

## Summary

You **don't need** the PWA Builder CLI. The web interface combined with our enhanced JavaScript code should provide the fullscreen experience you need. The key is that our `fullscreen.js` will detect the TWA environment and force fullscreen mode regardless of the PWA Builder configuration limitations.