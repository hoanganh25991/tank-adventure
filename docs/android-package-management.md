# Android Package Name Management System

This document describes the package name management system for Tank Adventure Android builds.

## Overview

The package name management system allows you to configure and change the Android package name used for APK/AAB builds. The package name uniquely identifies your app on Google Play Store and Android devices.

## Files

### Package Configuration Storage
- **Location**: `scripts/package-config.txt`
- **Format**: Simple key-value pairs
- **Example**:
  ```
  # Tank Adventure Package Configuration
  # This file stores the Android package name
  PACKAGE_NAME=com.example.tankgame
  ```

### Scripts
- **`scripts/build-android.sh`**: Main build script with integrated package management
- **`scripts/package-manager.sh`**: Standalone package management utility

## Package Name Management

### Using the Build Script
Access package management through the main build script:

```bash
./scripts/build-android.sh
# Choose option 6 for Package Name Management
```

### Using the Standalone Manager
Use the dedicated package manager for direct control:

```bash
# Interactive mode
./scripts/package-manager.sh

# Command line usage
./scripts/package-manager.sh set "com.mycompany.app"    # Set package name
./scripts/package-manager.sh show                      # Show current package
./scripts/package-manager.sh validate "com.test.app"   # Validate format
./scripts/package-manager.sh reset                     # Reset to default
```

## Package Name Format Requirements

### Valid Format
- **Reverse Domain Notation**: `com.company.appname`
- **Lowercase Only**: No uppercase letters allowed
- **Valid Characters**: Letters, numbers, underscores only
- **Segment Rules**: Each segment must start with a letter
- **Minimum Segments**: At least 2 segments (e.g., `com.appname`)

### Examples

#### ✅ Valid Package Names
```
com.mycompany.tankadventure
io.github.username.game
org.nonprofit.app
com.studio123.game_app
```

#### ❌ Invalid Package Names
```
Com.MyCompany.App           # Uppercase letters
com.123company.app          # Segment starts with number
myapp                       # Single segment
com.my-company.app          # Hyphens not allowed
com.company.app.           # Trailing dot
```

## Package Management Menu Options

### 1. Change Package Name
- Prompts for new package name with validation
- Shows format guidelines
- Updates configuration file
- Warns about Google Play Console implications

### 2. View Current Configuration
- Displays current package name
- Shows package config file contents
- Indicates if using default or custom package

### 3. Reset to Default
- Resets to default package name: `com.tankadventure.app`
- Removes custom configuration file
- Requires confirmation

### 4. Package Name Guidelines
- Displays comprehensive formatting rules
- Shows valid and invalid examples
- Explains Google Play Store requirements

## Integration with Build Process

### Automatic Application
When building Android apps, the package name is automatically applied to:

1. **TWA Manifest**: Sets the package name in `twa-manifest.json`
2. **Asset Links**: Updates `assetlinks.json` with correct package name
3. **Build Configuration**: Configures build tools with package name

### Asset Links Generation
The system automatically generates asset links with the current package name:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.tankgame",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_HERE"]
    }
  }
]
```

## Command Line Reference

### Package Manager Commands
```bash
# Show current package name
./scripts/package-manager.sh show

# Set new package name
./scripts/package-manager.sh set "com.mycompany.app"

# Validate package name format
./scripts/package-manager.sh validate "com.test.app"

# Reset to default
./scripts/package-manager.sh reset

# Show help
./scripts/package-manager.sh help
```

### Build Script Integration
```bash
# Build with current package name
./scripts/build-android.sh
# Choose option 1, 2, or 3

# Manage package name
./scripts/build-android.sh
# Choose option 6
```

## Important Considerations

### Google Play Store
- **Unique Identifier**: Package name must be unique across all Google Play apps
- **Permanent**: Cannot be changed after publishing to Google Play Store
- **Ownership**: Package name determines app ownership and update rights

### Development Workflow
1. **Choose Carefully**: Select a package name that reflects your brand/organization
2. **Test First**: Use a test package name for development builds
3. **Reserve Names**: Consider registering domain names matching your package
4. **Future Planning**: Think about potential app variations or versions

### Asset Links
- **Regeneration**: Changing package name requires updating asset links
- **GitHub Pages**: Update `.well-known/assetlinks.json` in your repository
- **Verification**: Test deep linking after package name changes

## Workflow Examples

### Setting Up for Development
```bash
# Set development package name
./scripts/package-manager.sh set "com.mycompany.tankadventure.dev"

# Build development version
./scripts/build-android.sh  # Choose option 2
```

### Preparing for Production
```bash
# Set production package name
./scripts/package-manager.sh set "com.mycompany.tankadventure"

# Verify package name
./scripts/package-manager.sh show

# Build production version
./scripts/build-android.sh  # Choose option 2
```

### Validating Package Names
```bash
# Test different package names
./scripts/package-manager.sh validate "com.mycompany.app"      # ✅ Valid
./scripts/package-manager.sh validate "MyApp"                 # ❌ Invalid
./scripts/package-manager.sh validate "com.123test.app"       # ❌ Invalid
```

## Troubleshooting

### Invalid Package Name Error
If you see validation errors:
1. Check format requirements
2. Ensure lowercase letters only
3. Verify each segment starts with a letter
4. Use at least 2 segments

### Google Play Console Issues
If Google Play rejects your package name:
1. Ensure uniqueness across all Play Store apps
2. Check for trademark conflicts
3. Verify format compliance
4. Consider alternative naming

### Asset Links Not Working
If deep linking fails after package name change:
1. Update asset links in your web repository
2. Regenerate and redeploy `assetlinks.json`
3. Verify package name matches exactly
4. Test with Google's Asset Links tester

## File Structure
```
tank-adventure/
├── scripts/
│   ├── build-android.sh      # Main build script with package management
│   ├── package-manager.sh    # Standalone package utility
│   └── package-config.txt    # Package storage (created automatically)
└── docs/
    └── android-package-management.md  # This documentation
```

## Best Practices

1. **Use Your Domain**: Base package name on a domain you own
2. **Be Descriptive**: Include app name or purpose in package
3. **Stay Consistent**: Use similar naming across related apps
4. **Plan Ahead**: Consider future app variations
5. **Test Thoroughly**: Validate package names before production builds
6. **Document Changes**: Keep track of package name changes in version control

This system ensures proper package name management for Android builds while providing both automated and manual control options.