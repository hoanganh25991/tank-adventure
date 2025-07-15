#!/bin/bash

# Tank Adventure Android AAB Build Script
# This script builds Android App Bundle using command line tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Tank Adventure Android AAB Builder${NC}"
echo "=========================================="
echo -e "${YELLOW}📋 This script will configure the TWA to:${NC}"
echo "   • Hide the URL bar (enableUrlBarHiding: true)"
echo "   • Set fullscreen display mode"
echo "   • Optimize for landscape gaming"
echo "   • Remove notifications and shortcuts"
echo "   • Use dark theme colors"
echo ""

# Check if tools are installed
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v pwabuilder &>/dev/null; then
    echo -e "${RED}❌ PWABuilder CLI not found. Installing...${NC}"
    npm install -g pwabuilder
fi

if ! command -v bubblewrap &>/dev/null; then
    echo -e "${RED}❌ Bubblewrap CLI not found. Installing...${NC}"
    npm install -g @bubblewrap/cli
fi

if ! command -v jq &>/dev/null; then
    echo -e "${YELLOW}🔧 jq not found. Installing for better JSON manipulation...${NC}"
    # Try to install jq using various package managers
    if command -v brew &>/dev/null; then
        brew install jq
    elif command -v apt-get &>/dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v yum &>/dev/null; then
        sudo yum install -y jq
    else
        echo -e "${YELLOW}⚠️  Could not install jq automatically. Will use sed fallback.${NC}"
    fi
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# Configuration
PWA_URL="https://hoanganh25991.github.io/tank-adventure"
MANIFEST_URL="$PWA_URL/manifest.json"
APP_NAME="Tank Adventure"
BUILD_DIR="./android-build"
OUTPUT_DIR="./aab-output"

# Validate URLs to prevent double slash issues
echo -e "${YELLOW}🔍 Validating URLs...${NC}"
echo "   PWA URL: $PWA_URL"
echo "   Manifest URL: $MANIFEST_URL"

# Check for double slashes in URLs
if [[ "$PWA_URL" == *"//"* ]] && [[ "$PWA_URL" != "https://"* ]]; then
    echo -e "${RED}❌ Double slash detected in PWA_URL${NC}"
    exit 1
fi

if [[ "$MANIFEST_URL" == *"//"* ]] && [[ "$MANIFEST_URL" != "https://"* ]]; then
    echo -e "${RED}❌ Double slash detected in MANIFEST_URL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ URLs validated${NC}"

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

echo -e "${YELLOW}Choose build method:${NC}"
echo "1) PWABuilder CLI (Recommended)"
echo "2) Bubblewrap CLI (Google's Official)"
echo "3) Both methods"
read -p "Enter your choice (1-3): " choice

case $choice in
1)
    echo -e "${GREEN}🔨 Building with PWABuilder CLI...${NC}"
    pwabuilder "$PWA_URL" \
        -p android \
        -d "$BUILD_DIR" \
        -s "$APP_NAME" \
        -l info

    echo -e "${GREEN}📦 Packaging the generated project...${NC}"
    cd "$BUILD_DIR"
    if [ -d "*/android" ]; then
        cd */android
        pwabuilder package . -p android
        cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found"
    fi
    cd - >/dev/null
    ;;
2)
    echo -e "${GREEN}🔨 Building with Bubblewrap CLI...${NC}"
    cd "$BUILD_DIR"

    # Check if already initialized
    if [ ! -f "twa-manifest.json" ]; then
        echo -e "${YELLOW}Initializing Bubblewrap...${NC}"
        bubblewrap init --manifest "$MANIFEST_URL"

        # Configure TWA to hide URL bar for fullscreen gaming experience
        echo -e "${YELLOW}Configuring TWA for fullscreen gaming...${NC}"

        # Update twa-manifest.json to hide URL bar and optimize for games
        if [ -f "twa-manifest.json" ]; then
            # Create a temporary file for modifications
            temp_file=$(mktemp)

            # Use jq to modify the manifest, or fallback to sed if jq is not available
            if command -v jq &>/dev/null; then
                jq '.display = "fullscreen" | 
                    .enableUrlBarHiding = true | 
                    .enableNotifications = false |
                    .isChromeOSOnly = false |
                    .orientation = "landscape" |
                    .themeColor = "#1a1a1a" |
                    .backgroundColor = "#1a1a1a" |
                    .enableSiteSettingsShortcut = false |
                    .shortcuts = []' twa-manifest.json >"$temp_file" 2>/dev/null || {
                    echo -e "${YELLOW}⚠️  jq failed, using sed fallback${NC}"
                    # Fallback to sed modifications
                    sed -e 's/"display": "[^"]*"/"display": "fullscreen"/' \
                        -e 's/"enableUrlBarHiding": [^,]*/"enableUrlBarHiding": true/' \
                        -e 's/"enableNotifications": [^,]*/"enableNotifications": false/' \
                        -e 's/"orientation": "[^"]*"/"orientation": "landscape"/' \
                        -e 's/"themeColor": "[^"]*"/"themeColor": "#1a1a1a"/' \
                        -e 's/"backgroundColor": "[^"]*"/"backgroundColor": "#1a1a1a"/' \
                        twa-manifest.json >"$temp_file"
                }
            else
                # Fallback to sed modifications
                echo -e "${YELLOW}Using sed for manifest modification${NC}"
                sed -e 's/"display": "[^"]*"/"display": "fullscreen"/' \
                    -e 's/"enableUrlBarHiding": [^,]*/"enableUrlBarHiding": true/' \
                    -e 's/"enableNotifications": [^,]*/"enableNotifications": false/' \
                    -e 's/"orientation": "[^"]*"/"orientation": "landscape"/' \
                    -e 's/"themeColor": "[^"]*"/"themeColor": "#1a1a1a"/' \
                    -e 's/"backgroundColor": "[^"]*"/"backgroundColor": "#1a1a1a"/' \
                    twa-manifest.json >"$temp_file"
            fi

            # Replace the original file
            mv "$temp_file" twa-manifest.json

            echo -e "${GREEN}✅ TWA manifest configured for fullscreen gaming${NC}"
        fi
    fi

    echo -e "${GREEN}📦 Building AAB...${NC}"
    bubblewrap build --skipPwaValidation

    # Move AAB to output directory
    cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found"
    cd - >/dev/null
    ;;
3)
    echo -e "${GREEN}🔨 Building with both methods...${NC}"

    # PWABuilder first
    echo -e "${YELLOW}Method 1: PWABuilder CLI${NC}"
    pwabuilder "$PWA_URL" \
        -p android \
        -d "$BUILD_DIR/pwabuilder" \
        -s "$APP_NAME" \
        -l info

    # Bubblewrap second
    echo -e "${YELLOW}Method 2: Bubblewrap CLI${NC}"
    mkdir -p "$BUILD_DIR/bubblewrap"
    cd "$BUILD_DIR/bubblewrap"

    bubblewrap init --manifest "$MANIFEST_URL"

    # Configure TWA to hide URL bar for fullscreen gaming experience
    echo -e "${YELLOW}Configuring TWA for fullscreen gaming...${NC}"

    # Update twa-manifest.json to hide URL bar and optimize for games
    if [ -f "twa-manifest.json" ]; then
        # Create a temporary file for modifications
        temp_file=$(mktemp)

        # Use jq to modify the manifest, or fallback to sed if jq is not available
        if command -v jq &>/dev/null; then
            jq '.display = "fullscreen" | 
                .enableUrlBarHiding = true | 
                .enableNotifications = false |
                .isChromeOSOnly = false |
                .orientation = "landscape" |
                .themeColor = "#1a1a1a" |
                .backgroundColor = "#1a1a1a" |
                .enableSiteSettingsShortcut = false |
                .shortcuts = []' twa-manifest.json >"$temp_file" 2>/dev/null || {
                echo -e "${YELLOW}⚠️  jq failed, using sed fallback${NC}"
                # Fallback to sed modifications
                sed -e 's/"display": "[^"]*"/"display": "fullscreen"/' \
                    -e 's/"enableUrlBarHiding": [^,]*/"enableUrlBarHiding": true/' \
                    -e 's/"enableNotifications": [^,]*/"enableNotifications": false/' \
                    -e 's/"orientation": "[^"]*"/"orientation": "landscape"/' \
                    -e 's/"themeColor": "[^"]*"/"themeColor": "#1a1a1a"/' \
                    -e 's/"backgroundColor": "[^"]*"/"backgroundColor": "#1a1a1a"/' \
                    twa-manifest.json >"$temp_file"
            }
        else
            # Fallback to sed modifications
            echo -e "${YELLOW}Using sed for manifest modification${NC}"
            sed -e 's/"display": "[^"]*"/"display": "fullscreen"/' \
                -e 's/"enableUrlBarHiding": [^,]*/"enableUrlBarHiding": true/' \
                -e 's/"enableNotifications": [^,]*/"enableNotifications": false/' \
                -e 's/"orientation": "[^"]*"/"orientation": "landscape"/' \
                -e 's/"themeColor": "[^"]*"/"themeColor": "#1a1a1a"/' \
                -e 's/"backgroundColor": "[^"]*"/"backgroundColor": "#1a1a1a"/' \
                twa-manifest.json >"$temp_file"
        fi

        # Replace the original file
        mv "$temp_file" twa-manifest.json

        echo -e "${GREEN}✅ TWA manifest configured for fullscreen gaming${NC}"
    fi

    bubblewrap build --skipPwaValidation

    # Move AAB files
    cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found from Bubblewrap"
    cd - >/dev/null

    # Try to package PWABuilder output
    cd "$BUILD_DIR/pwabuilder"
    if [ -d "*/android" ]; then
        cd */android
        pwabuilder package . -p android
        cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found from PWABuilder"
    fi
    cd - >/dev/null
    ;;
*)
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}✅ Build process completed!${NC}"
echo -e "${YELLOW}📁 Output directory: $OUTPUT_DIR${NC}"

# Function to find and print absolute paths of specific files
find_and_print_paths() {
    local search_dirs=("$BUILD_DIR" "$OUTPUT_DIR")
    local found_files=()

    echo -e "${YELLOW}🔍 Searching for APK and AAB files...${NC}"

    # Search for app-release-unsigned.apk
    for dir in "${search_dirs[@]}"; do
        if [ -d "$dir" ]; then
            while IFS= read -r -d '' file; do
                if [[ "$file" == *"app-release-unsigned.apk" ]]; then
                    abs_path=$(realpath "$file")
                    echo -e "${GREEN}📱 APK Found: ${abs_path}${NC}"
                    found_files+=("$abs_path")
                fi
            done < <(find "$dir" -name "*.apk" -print0 2>/dev/null)
        fi
    done

    # Search for app-release.aab
    for dir in "${search_dirs[@]}"; do
        if [ -d "$dir" ]; then
            while IFS= read -r -d '' file; do
                if [[ "$file" == *"app-release.aab" ]]; then
                    abs_path=$(realpath "$file")
                    echo -e "${GREEN}📦 AAB Found: ${abs_path}${NC}"
                    found_files+=("$abs_path")
                fi
            done < <(find "$dir" -name "*.aab" -print0 2>/dev/null)
        fi
    done

    # Also search for any AAB files in general
    for dir in "${search_dirs[@]}"; do
        if [ -d "$dir" ]; then
            while IFS= read -r -d '' file; do
                if [[ "$file" == *".aab" ]] && [[ "$file" != *"app-release.aab" ]]; then
                    abs_path=$(realpath "$file")
                    echo -e "${GREEN}📦 Other AAB Found: ${abs_path}${NC}"
                    found_files+=("$abs_path")
                fi
            done < <(find "$dir" -name "*.aab" -print0 2>/dev/null)
        fi
    done

    # Also search for any APK files in general
    for dir in "${search_dirs[@]}"; do
        if [ -d "$dir" ]; then
            while IFS= read -r -d '' file; do
                if [[ "$file" == *".apk" ]] && [[ "$file" != *"app-release-unsigned.apk" ]]; then
                    abs_path=$(realpath "$file")
                    echo -e "${GREEN}📱 Other APK Found: ${abs_path}${NC}"
                    found_files+=("$abs_path")
                fi
            done < <(find "$dir" -name "*.apk" -print0 2>/dev/null)
        fi
    done

    if [ ${#found_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No APK or AAB files found. Check the build logs above.${NC}"
    else
        echo -e "${GREEN}✅ Found ${#found_files[@]} file(s)${NC}"
    fi
}

# List generated files
if [ -d "$OUTPUT_DIR" ] && [ "$(ls -A $OUTPUT_DIR)" ]; then
    echo -e "${GREEN}Generated files in output directory:${NC}"
    ls -la "$OUTPUT_DIR"
else
    echo -e "${YELLOW}⚠️  Output directory is empty or doesn't exist.${NC}"
fi

# Find and print absolute paths of APK and AAB files
find_and_print_paths

# Create a summary report
echo ""
echo -e "${GREEN}==================== BUILD SUMMARY ====================${NC}"
echo -e "${YELLOW}📁 Build Directory: $(realpath "$BUILD_DIR")${NC}"
echo -e "${YELLOW}📁 Output Directory: $(realpath "$OUTPUT_DIR")${NC}"
echo ""

# Create a final summary of specific files
echo -e "${GREEN}🎯 Target Files Summary:${NC}"
TARGET_APK=$(find "$BUILD_DIR" "$OUTPUT_DIR" -name "*app-release-unsigned.apk" 2>/dev/null | head -1)
TARGET_AAB=$(find "$BUILD_DIR" "$OUTPUT_DIR" -name "*app-release.aab" 2>/dev/null | head -1)

if [ -n "$TARGET_APK" ]; then
    echo -e "${GREEN}📱 app-release-unsigned.apk: $(realpath "$TARGET_APK")${NC}"
else
    echo -e "${YELLOW}📱 app-release-unsigned.apk: Not found${NC}"
fi

if [ -n "$TARGET_AAB" ]; then
    echo -e "${GREEN}📦 app-release.aab: $(realpath "$TARGET_AAB")${NC}"
else
    echo -e "${YELLOW}📦 app-release.aab: Not found${NC}"
fi

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}🎉 Done! Your APK/AAB files are ready for deployment.${NC}"
echo ""
echo -e "${YELLOW}📱 The built app should now have:${NC}"
echo "   • No URL bar at the top (fullscreen gaming experience)"
echo "   • Landscape orientation locked"
echo "   • Dark theme matching your game"
echo "   • Optimized for mobile gaming"
echo ""
