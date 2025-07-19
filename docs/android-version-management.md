# Android Version Management System

This document describes the version management system for Tank Adventure Android builds.

## Overview

The version management system automatically handles Android version codes and version names for APK/AAB builds. It ensures that each build has a unique version code required by Google Play Store.

## Files

### Version Storage
- **Location**: `scripts/version.txt`
- **Format**: Simple key-value pairs
- **Example**:
  ```
  # Tank Adventure Version Information
  # This file tracks version codes for Android builds
  VERSION_CODE=5
  VERSION_NAME=1.2.0
  ```

### Scripts
- **`scripts/build-android.sh`**: Main build script with integrated version management
- **`scripts/version-manager.sh`**: Standalone version management utility

## Version Code Management

### Automatic Increment
When building with `build-android.sh`, the version code is automatically incremented:
- Current version code is read from `scripts/version.txt`
- Version code is incremented by 1
- New version code is applied to the TWA manifest
- Version file is updated with the new code

### Manual Management
Use the version manager script for manual control:

```bash
# Interactive mode
./scripts/version-manager.sh

# Command line usage
./scripts/version-manager.sh increment          # Increment version code
./scripts/version-manager.sh set-name "1.3.0"  # Set version name
./scripts/version-manager.sh set-code 10       # Set version code
./scripts/version-manager.sh show              # Show current version
./scripts/version-manager.sh reset             # Reset to defaults
```

## Build Integration

### PWABuilder CLI (Option 1)
```bash
./scripts/build-android.sh
# Choose option 1
```
- Auto-increments version code
- Applies version to generated TWA manifest files
- Packages with updated version information

### Bubblewrap CLI (Option 2)
```bash
./scripts/build-android.sh
# Choose option 2
```
- Auto-increments version code
- Configures TWA manifest with version information
- Builds AAB with correct version

### Both Methods (Option 3)
```bash
./scripts/build-android.sh
# Choose option 3
```
- Single version increment for both builds
- Consistent version across both build methods

## Version Management Menu (Option 5)

The build script includes a dedicated version management menu:

1. **Increment version code**: Increases version code by 1
2. **Set version name**: Update the human-readable version (e.g., "1.2.0")
3. **Set both**: Update both version code and name
4. **View version history**: Display current version file contents
5. **Reset version**: Return to default values (Code: 1, Name: "1.0.0")
6. **Back to main menu**: Return to build options

## Version Code Rules

### Google Play Store Requirements
- **Version Code**: Must be a positive integer
- **Unique**: Each upload must have a higher version code than the previous
- **Sequential**: Recommended to increment by 1 for each release
- **Maximum**: Up to 2,100,000,000

### Version Name Guidelines
- **Format**: Semantic versioning recommended (e.g., "1.2.3")
- **User-Facing**: Displayed to users in app stores
- **Flexible**: Can be any string, but should be meaningful

## Workflow Examples

### Regular Development Build
```bash
# Build with auto-increment
./scripts/build-android.sh
# Choose option 2 (Bubblewrap)
# Version code automatically increments: 5 → 6
```

### Release Preparation
```bash
# Set release version
./scripts/version-manager.sh set-name "1.3.0"

# Build release
./scripts/build-android.sh
# Choose option 2
# Version code increments: 6 → 7, Name: "1.3.0"
```

### Hotfix Release
```bash
# Set hotfix version
./scripts/version-manager.sh set-name "1.3.1"

# Build hotfix
./scripts/build-android.sh
# Version code increments: 7 → 8, Name: "1.3.1"
```

### Version Check
```bash
# Check current version
./scripts/version-manager.sh show

# Output:
# 📱 Current Version Information:
#    Version Code: 8
#    Version Name: 1.3.1
```

## Troubleshooting

### Version File Missing
If `scripts/version.txt` doesn't exist:
- Default values are used (Code: 1, Name: "1.0.0")
- File is created automatically on first increment

### Version Code Conflicts
If Google Play rejects due to version code conflicts:
```bash
# Set a higher version code manually
./scripts/version-manager.sh set-code 15
```

### Reset After Testing
After testing builds:
```bash
# Reset to clean state
./scripts/version-manager.sh reset
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Increment Version
  run: ./scripts/version-manager.sh increment

- name: Build Android
  run: ./scripts/build-android.sh
  # Use option 2 in automated mode
```

### Manual Release Process
1. Update version name for release: `./scripts/version-manager.sh set-name "1.4.0"`
2. Build: `./scripts/build-android.sh` (option 2)
3. Test the generated AAB
4. Upload to Google Play Console
5. Tag the release in Git with the version name

## Best Practices

1. **Always increment version code** for each build uploaded to stores
2. **Use semantic versioning** for version names (MAJOR.MINOR.PATCH)
3. **Keep version file in Git** to track version history
4. **Test builds locally** before uploading to stores
5. **Document version changes** in release notes

## File Structure
```
tank-adventure/
├── scripts/
│   ├── build-android.sh      # Main build script with version management
│   ├── version-manager.sh    # Standalone version utility
│   └── version.txt          # Version storage (created automatically)
└── docs/
    └── android-version-management.md  # This documentation
```

## Version History Tracking

The version file serves as a simple history:
- Comments show when file was created/modified
- Git history tracks version changes over time
- Build logs show which version was used for each build

This system ensures consistent, conflict-free version management for Android builds while providing both automated and manual control options.